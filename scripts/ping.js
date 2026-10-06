document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("ping-form");
    const titleInput = document.getElementById("ping-title");
    const messageInput = document.getElementById("ping-message");
    const status = document.getElementById("ping-status");
    const submitButton = document.getElementById("ping-submit");
    const toast = document.getElementById("ping-toast");
    const toastTitle = document.getElementById("ping-toast-title");
    const toastMessage = document.getElementById("ping-toast-message");

    if (!form || !messageInput || !status || !submitButton || !toast || !toastTitle || !toastMessage) {
        return;
    }

    const endpoint = "/api/agent";
    const agent = 1; // which WhatsApp agent receives pings from this page (must be in PUBLIC_AGENTS)
const defaultTitle = "elouan.xyz/ping";
let toastTimer;

const setStatus = (message, type = "idle") => {
    status.textContent = message;
    status.classList.remove("is-error", "is-success");

    if (type === "error") {
        status.classList.add("is-error");
    }

    if (type === "success") {
        status.classList.add("is-success");
    }
};

const hideToast = () => {
    toast.classList.remove("visible");
    window.setTimeout(() => {
        if (!toast.classList.contains("visible")) {
            toast.hidden = true;
        }
    }, 220);
};

const showToast = (title, message) => {
    window.clearTimeout(toastTimer);
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.hidden = false;

    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });

    toastTimer = window.setTimeout(hideToast, 4800);
};

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const rawTitle = titleInput ? titleInput.value.trim() : "";
    const rawMessage = messageInput.value.trim();
    const title = rawTitle || defaultTitle;

    if (!rawMessage) {
        setStatus("Write a message before sending.", "error");
        messageInput.focus();
        return;
    }

    setStatus("Sending ping…");
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    // Guarded: if an ad blocker stops PostHog loading, sending must still work.
    if (window.posthog && typeof window.posthog.capture === "function") {
        window.posthog.capture("ping_sent", { message: rawMessage });
    }

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ agent, title, message: rawMessage })
        });

        if (!response.ok) {
            let details = "";
            try {
                details = (await response.json()).error;
            } catch (_) {
                // non-JSON error body, fall through to the default message
            }
            throw new Error(details || "The notification could not be delivered.");
        }

        setStatus("Ping sent.", "success");
        showToast(title, rawMessage);
        form.reset();

                      if (titleInput) {
                          titleInput.focus();
                      } else {
                          messageInput.focus();
                      }
    } catch (error) {
        const message = error instanceof Error ? error.message : "The notification could not be delivered.";
        setStatus(message, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send";
    }
});
});
