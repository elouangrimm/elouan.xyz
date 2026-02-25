// PostHog Analytics Initialization
// This script initializes PostHog analytics for tracking
!(function (e, t) {
    var s, r, o, i;
    t.__SV ||
        ((window.posthog = t),
        (t._i = []),
        (t.init = function (n, a, p) {
            function g(e, t) {
                var s = t.split(".");
                (2 == s.length && ((e = e[s[0]]), (t = s[1])),
                    (e[t] = function () {
                        e.push(
                            [t].concat(
                                Array.prototype.slice.call(arguments, 0),
                            ),
                        );
                    }));
            }
            (((o = e.createElement("script")).type = "text/javascript"),
                (o.crossOrigin = "anonymous"),
                (o.async = !0),
                (o.src =
                    a.api_host.replace(
                        ".i.posthog.com",
                        "-assets.i.posthog.com",
                    ) + "/static/array.js"),
                (o.onerror = function () {
                    console.log(
                        "\n%c↑↑↑ %cgood on you for using an ad blocker... sorry for even trying to track you in the first place %c😉\n",
                        "font-style: none; font-size: 1.25em;",
                        "font-style: italic; font-size: 1.25em;",
                        "font-style: none; font-size: 1.25em;",
                    );
                }),
                (i =
                    e.getElementsByTagName(
                        "script",
                    )[0]).parentNode.insertBefore(o, i));
            var c = t;
            for (
                void 0 !== p ? (c = t[p] = []) : (p = "posthog"),
                    c.people = c.people || [],
                    c.toString = function (e) {
                        var t = "posthog";
                        return (
                            "posthog" !== p && (t += "." + p),
                            e || (t += " (stub)"),
                            t
                        );
                    },
                    c.people.toString = function () {
                        return c.toString(1) + ".people (stub)";
                    },
                    s =
                        "init bs ws ge fs capture De Ai $s register register_once register_for_session unregister unregister_for_session Is getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty xs Ss createPersonProfile Es gs opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing ys debug ks getPageViewId captureTraceFeedback captureTraceMetric".split(
                            " ",
                        ),
                    r = 0;
                r < s.length;
                r++
            )
                g(c, s[r]);
            t._i.push([n, a, p]);
        }),
        (t.__SV = 1));
})(document, window.posthog || []);

posthog.init("phc_W4DPbbp1Qbz4lPVtWrFF54GFUabBHpKzNJx9U6fryBZ", {
    api_host: "https://posthog.elouan.xyz/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "always",
});

fetch("/manifest.json")
    .then((r) => r.json());

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(function () {
        console.log("\n \n \n")

        // === welcome banner ===
        const logoBase64 = `
        url(data:image/png;base64,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)
        
        
        `
        console.log("%c ", `font-size: 1px; line-height: 1px; padding: 64px 64px; background: ${logoBase64} no-repeat center/128px 128px`)

        const _3d = (color, shadow) =>
            `font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', 'Cascadia Code', monospace; font-size: 3em; font-weight: 700; color: ${color}; text-shadow: 1px 1px 1px ${shadow}, 1px 2px 1px ${shadow}, 1px 3px 1px ${shadow}, 1px 4px 1px ${shadow}, 1px 5px 1px ${shadow}, 1px 13px 6px rgba(16,16,16,0.4), 1px 22px 10px rgba(16,16,16,0.2), 1px 25px 35px rgba(16,16,16,0.2), 1px 30px 60px rgba(16,16,16,0.4); padding: 10px 0`
        console.log(
            "%cwelcome to %ce%cl%co%cu%ca%cn%c.%cx%cy%cz \n%cand the dev tools",
            _3d("#4680ff", "#1c50be"),
            _3d("#ff6b6b", "#8b2e2e"),
            _3d("#ffa94d", "#7a4e1a"),
            _3d("#ffd43b", "#7a6010"),
            _3d("#69db7c", "#2a6b38"),
            _3d("#4dabf7", "#1a5a8a"),
            _3d("#748ffc", "#2a3a8a"),
            _3d("#9775fa", "#3d2a7a"),
            _3d("#da77f2", "#6a2a7a"),
            _3d("#f783ac", "#7a2a4a"),
            _3d("#ff6b6b", "#8b2e2e"),
            "position: absolute; top: 50%; right: 50%; transform: translate(50%,-50%); font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', 'Cascadia Code', monospace; font-size: 2em; font-weight: 700; font-style: italic; color: #f59e0b; text-shadow: 1px 1px 1px #72582a, 1px 2px 1px #72582a, 1px 3px 1px #72582a, 1px 4px 1px #72582a, 1px 5px 1px #72582a, 1px 13px 6px rgba(16,16,16,0.4), 1px 22px 10px rgba(16,16,16,0.2), 1px 25px 35px rgba(16,16,16,0.2), 1px 30px 60px rgba(16,16,16,0.4);padding:10px",
        );

        // === SVG image card (data: URL via btoa — the only way that works in modern Chrome) ===
        /*
        (function () {
            const svg = [
                `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="130">`,
                `<rect width="340" height="130" fill="#0d0d0d" rx="6"/>`,
                `<rect x="0" y="0" width="6" height="130" fill="#4680ff" rx="3"/>`,
                `<text x="26" y="44" font-family="monospace" font-size="26" font-weight="bold" fill="#ffffff">elouan</text>`,
                `<text x="120" y="44" font-family="monospace" font-size="26" font-weight="bold" fill="#4680ff">.xyz</text>`,
                `<text x="26" y="72" font-family="monospace" font-size="12" fill="#a8a29e">developer / builder / tinkerer</text>`,
                `<rect x="26" y="84" width="288" height="1" fill="#2a2a2a"/>`,
                `<text x="26" y="106" font-family="monospace" font-size="11" fill="#4680ff">✦</text>`,
                `<text x="40" y="106" font-family="monospace" font-size="11" fill="#78716c">curious enough to open devtools</text>`,
                `<text x="26" y="122" font-family="monospace" font-size="11" fill="#4680ff">✦</text>`,
                `<text x="40" y="122" font-family="monospace" font-size="11" fill="#78716c">github.com/elouangrimm</text>`,
                `</svg>`,
            ].join("")
            const url = `data:image/svg+xml,${encodeURIComponent(svg)}`
            console.log("%c ", `padding: 65px 170px; background: url('${url}') no-repeat center/contain; border-radius: 6px`)
        }())
        */

        console.log("\n \n \n")

        // === site stats table ===
        console.log("%csite info:", "color: #4680ff; font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', 'Cascadia Code', monospace; font-size: 1.5em; font-weight: bold; border-bottom: 2px solid #4680ff; padding-bottom: 2px")
        console.table({
            "stack":     { value: "HTML + CSS + vanilla JS" },
            "hosting":   { value: "Vercel" },
            "analytics": { value: "PostHog" },
            "framework": { value: "none. raw dogging it." },
            "source": { value: "github.com/elouangrimm/elouan.xyz" },

        })

    }, 500)
});