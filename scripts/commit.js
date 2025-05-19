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
    const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`;

    try {
        const response = await fetch(apiUrl, {
            headers: { Accept: "application/vnd.github.v3+json" },
        });

        if (!response.ok) {
            throw new Error(
                `GitHub API Error: ${response.status} ${response.statusText}`
            );
        }

        const events = await response.json();
        let latestPushEvent = null;

        for (const event of events) {
            if (
                event.type === "PushEvent" &&
                event.payload &&
                event.payload.commits &&
                event.payload.commits.length > 0
            ) {
                latestPushEvent = event;
                break;
            }
        }

        if (latestPushEvent) {
            const commitData =
                latestPushEvent.payload.commits[
                    latestPushEvent.payload.commits.length - 1
                ];
            const commitSha = commitData.sha;
            const shortSha = commitSha.substring(0, 7);
            const repoName = latestPushEvent.repo.name;
            const commitUrl = `https://github.com/${repoName}/commit/${commitSha}`;
            const commitDate = latestPushEvent.created_at;
            const relativeTime = formatTimeAgo(commitDate);
            const commitMessage = commitData.message; // Full commit message

            // Add a class "commit-tooltip-trigger" and data attribute for the message
            commitStatusElement.innerHTML = `
                    Last commit ${relativeTime}
                    (<a href="${commitUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="commit-tooltip-trigger"
                        data-commit-message="${escapeHtml(
                            commitMessage.split("\n")[0]
                        )}">
                        ${shortSha}
                    </a> to ${repoName.split("/")[1]})
                `;
        } else {
            commitStatusElement.textContent =
                "No recent public push events found.";
        }
    } catch (error) {
        console.error("Failed to fetch profile commit info:", error);
        commitStatusElement.textContent = "Could not load last commit info.";
        if (error.message.includes("API rate limit exceeded")) {
            commitStatusElement.textContent +=
                " (API rate limit likely exceeded)";
        }
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
