export default async function handler(req, res) {
    const GITHUB_USERNAME = "elouangrimm";
    const token = process.env.GITHUB_PAT;

    if (!token) {
        console.error("GITHUB_PAT is not configured.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json"
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
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

        // Cache for 5 minutes
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

        if (latestPushEvent) {
            const commitData = latestPushEvent.payload.commits[latestPushEvent.payload.commits.length - 1];

            return res.status(200).json({
                sha: commitData.sha,
                shortSha: commitData.sha.substring(0, 7),
                repoName: latestPushEvent.repo.name,
                repoUrl: `https://github.com/${latestPushEvent.repo.name}`,
                commitUrl: `https://github.com/${latestPushEvent.repo.name}/commit/${commitData.sha}`,
                message: commitData.message,
                date: latestPushEvent.created_at
            });
        } else {
            return res.status(200).json({ message: "No recent public push events found." });
        }

    } catch (error) {
        console.error("Failed to fetch profile commit info:", error);
        return res.status(500).json({ error: "Could not load last commit info." });
    }
}
