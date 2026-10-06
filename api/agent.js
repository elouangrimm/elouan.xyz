// api/agent.js — send a WhatsApp message to yourself through one of several agents.
//
//   GET/POST /api/agent?agent=2&message=hello&title=optional&key=SECRET
//
// Env vars (Vercel → Project → Settings → Environment Variables):
//   AGENT_API_KEY          secret needed for any non-public request
//   WHATSAPP_TOKEN_1..9    API token of agent N (agent 1 also falls back to WHATSAPP_TOKEN)
//   WHATSAPP_OWNER_ID      your id as returned by the API, e.g. "user:50972923564215"
//   WHATSAPP_OWNER_ID_1..9 (optional) per-agent override of the recipient
//   PUBLIC_AGENTS          (optional) comma list of agents that accept keyless GET/POST,
//                          e.g. "1" for your public ping page. Rate-limited harder.
//   NTFY_FALLBACK_TOPIC    (optional) if WhatsApp delivery fails, send to this ntfy topic

const crypto = require("crypto");

const WA_URL = "https://api.whatsapp.com/agent/v1/messages";
const MAX_AGENTS = 9;
const MESSAGE_MAX = 4096; // WhatsApp text limit
const PUBLIC_MESSAGE_MAX = 1000;
const TITLE_MAX = 100;

// Best-effort in-memory rate limits (per serverless instance).
// WhatsApp allows 12 sends/min per agent, so we stay under it.
const hitsByAgent = new Map();
const hitsByIp = new Map();

const first = (v) => (Array.isArray(v) ? v[0] : v);
const recent = (list, windowMs) => {
    const t = Date.now();
    return (list || []).filter((x) => t - x < windowMs);
};

function safeEqual(a, b) {
    const ha = crypto.createHash("sha256").update(String(a)).digest();
    const hb = crypto.createHash("sha256").update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

function getAgent(n) {
    const token =
    process.env[`WHATSAPP_TOKEN_${n}`] || (n === 1 ? process.env.WHATSAPP_TOKEN : undefined);
    const to = process.env[`WHATSAPP_OWNER_ID_${n}`] || process.env.WHATSAPP_OWNER_ID;
    return token && to ? { token, to } : null;
}

class WaError extends Error {
    constructor(status, detail) {
        super(`WhatsApp ${status}: ${detail}`);
        this.status = status;
    }
}

async function sendWhatsApp(agent, text) {
    const send = () =>
    fetch(WA_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${agent.token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: agent.to,
            type: "text",
            text: { body: text },
        }),
    });

    let r = await send();
    // 503 = "not accepted for delivery" -> safe to retry once.
    // 500 / timeouts are ambiguous (may have been sent), so no retry there.
    if (r.status === 503) {
        await new Promise((res) => setTimeout(res, 1500));
        r = await send();
    }
    if (!r.ok) {
        const body = await r.text().catch(() => "");
        throw new WaError(r.status, body.slice(0, 300));
    }
}

async function sendNtfy(text, title) {
    const topic = process.env.NTFY_FALLBACK_TOPIC;
    if (!topic) throw new Error("no NTFY_FALLBACK_TOPIC set");
    const r = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
        method: "POST",
        headers: { Title: "agent api fallback" },
        body: title ? `${title}\n${text}` : text,
    });
    if (!r.ok) throw new Error(`ntfy ${r.status}`);
}

module.exports = async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const fail = (code, error) => res.status(code).json({ ok: false, error });

    if (req.method !== "GET" && req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        return fail(405, "Use GET or POST");
    }

    // ---- gather input (query string wins nothing over body; body first) ----
    const q = req.query || {};
    let body = req.body;
    if (typeof body === "string") body = { message: body }; // curl -d "hello"
    if (!body || typeof body !== "object" || Buffer.isBuffer(body)) body = {};
    const pick = (k) => first(body[k] ?? q[k]);

    const message = String(pick("message") ?? "").trim();
    const title = String(pick("title") ?? "").trim().slice(0, TITLE_MAX);
    const agentNum = parseInt(pick("agent") ?? "1", 10);

    if (!Number.isInteger(agentNum) || agentNum < 1 || agentNum > MAX_AGENTS) {
        return fail(400, `agent must be 1-${MAX_AGENTS}`);
    }
    if (!message) return fail(400, "Missing message");

    // ---- auth ----
    const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const key = req.headers["x-api-key"] || bearer || first(q.key) || "";
    const publicAgents = (process.env.PUBLIC_AGENTS || "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter(Number.isInteger);

    let isPublic = false;
    if (key) {
        if (!process.env.AGENT_API_KEY || !safeEqual(key, process.env.AGENT_API_KEY)) {
            return fail(401, "Invalid key");
        }
    } else if (publicAgents.includes(agentNum)) {
        isPublic = true; // keyless GET or POST, with the stricter public limits below
    } else {
        return fail(401, "Missing key");
    }

    if (message.length > (isPublic ? PUBLIC_MESSAGE_MAX : MESSAGE_MAX)) {
        return fail(400, "Message too long");
    }

    const agent = getAgent(agentNum);
    if (!agent) return fail(404, `Agent ${agentNum} is not configured`);

    // ---- rate limits ----
    const agentHits = recent(hitsByAgent.get(agentNum), 60_000);
    if (agentHits.length >= 10) {
        res.setHeader("Retry-After", "30");
        return fail(429, "Too many messages, try again shortly");
    }
    if (isPublic) {
        // Used only for rate limiting; held in memory, never logged or forwarded.
        const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
        const ipHits = recent(hitsByIp.get(ip), 10 * 60_000);
        if (ipHits.length >= 5) return fail(429, "Slow down a little :)");
        ipHits.push(Date.now());
        hitsByIp.set(ip, ipHits);
    }
    agentHits.push(Date.now());
    hitsByAgent.set(agentNum, agentHits);

    // ---- send ----
    const text = title ? `*${title}*\n${message}` : message;
    try {
        await sendWhatsApp(agent, text);
        return res.status(200).json({ ok: true, agent: agentNum });
    } catch (err) {
        console.error(`agent ${agentNum}:`, err.message);
        try {
            await sendNtfy(message, title);
            return res.status(200).json({ ok: true, agent: agentNum, via: "ntfy" });
        } catch (_) {
            return fail(err.status === 429 ? 429 : 502, "Couldn't deliver the message");
        }
    }
};
