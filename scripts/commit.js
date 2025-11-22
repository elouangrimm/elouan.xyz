const GITHUB_USERNAME = "elouangrimm";
const commitStatusElement = document.getElementById(
    "github-profile-commit-status"
);
const tooltipElement = document.getElementById("tooltip-display");

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    try {
        const rtf = new Intl.RelativeTimeFormat("en", {
            style: "short",
            numeric: "auto",
        });
        if (seconds < 60) return rtf.format(-seconds, "second");
        if (minutes < 60) return rtf.format(-minutes, "minute");
        if (hours < 24) return rtf.format(-hours, "hour");
        if (days < 7) return rtf.format(-days, "day");
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    } catch (e) {
        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }
}

async function fetchLatestProfileCommitInfo() {
    const apiUrl = `/api/commit`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.sha) {
            const relativeTime = formatTimeAgo(data.date);
            const commitMessage = data.message;

            commitStatusElement.innerHTML = `
                    Last commit ${relativeTime}
                    (<a href="${data.commitUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="commit-tooltip-trigger"
                        data-commit-message="${escapeHtml(
                commitMessage.split("\n")[0]
            )}">
                        ${data.shortSha}
                    </a> to ${data.repoName.split("/")[1]})
                `;
        } else {
            commitStatusElement.textContent = data.message || "No recent activity.";
        }
    } catch (error) {
        console.error("Failed to fetch profile commit info:", error);
        commitStatusElement.textContent = "Could not load last commit info.";
    }
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== "string") return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

if (tooltipElement && commitStatusElement) {
    commitStatusElement.addEventListener("mouseover", function (event) {
        if (event.target.classList.contains("commit-tooltip-trigger")) {
            const message = event.target.dataset.commitMessage;
            tooltipElement.textContent = message;
            tooltipElement.style.left = event.pageX + 10 + "px";
            tooltipElement.style.top = event.pageY + 15 + "px";
            tooltipElement.classList.add("visible");
        }
    });

    commitStatusElement.addEventListener("mouseout", function (event) {
        if (event.target.classList.contains("commit-tooltip-trigger")) {
            tooltipElement.classList.remove("visible");
        }
    });

    commitStatusElement.addEventListener("mousemove", function (event) {
        if (
            tooltipElement.classList.contains("visible") &&
            event.target.classList.contains("commit-tooltip-trigger")
        ) {
            tooltipElement.style.left = event.pageX + 10 + "px";
            tooltipElement.style.top = event.pageY + 15 + "px";
        }
    });
} else {
    if (!tooltipElement)
        console.warn("Tooltip element with ID 'tooltip-display' not found.");
    if (!commitStatusElement)
        console.warn(
            "Commit status element with ID 'github-profile-commit-status' not found."
        );
}

document.addEventListener("DOMContentLoaded", fetchLatestProfileCommitInfo);
