const GITHUB_USERNAME = "elouangrimm";
// You can pass the token as an argument: node scripts/test-commit.js YOUR_TOKEN
// Or set it as an env var: set GITHUB_PAT=... && node scripts/test-commit.js
const token = process.argv[2] || process.env.GITHUB_PAT;

if (!token) {
    console.warn("⚠️  No GITHUB_PAT provided.");
    console.warn("Usage: node scripts/test-commit.js <YOUR_GITHUB_PAT>");
    console.warn("Running without token (rate limits may apply and private events won't show)...");
}

async function testFetch() {
    const apiUrl = `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`;

    console.log(`\nFetching: ${apiUrl}`);

    const headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Debug-Script"
    };

    if (token) {
        headers["Authorization"] = `token ${token}`;
        console.log("✅ Using provided token for Authorization.");
    }

    try {
        const response = await fetch(apiUrl, { headers });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error("❌ Request failed.");
            console.error(await response.text());
            return;
        }

        const events = await response.json();
        console.log(`✅ Fetched ${events.length} events.`);

        let latestPushEvent = null;

        // Log the first few events to see what we got
        console.log("\n--- First 5 Events ---");
        events.slice(0, 5).forEach((e, i) => {
            console.log(`[${i}] Type: ${e.type}, Repo: ${e.repo.name}, Date: ${e.created_at}`);
            if (e.type === 'PushEvent') {
                console.log(`    Payload keys: ${Object.keys(e.payload)}`);
                if (e.payload.commits) {
                    console.log(`    Commits length: ${e.payload.commits.length}`);
                } else {
                    console.log(`    Commits is missing/undefined`);
                }
            }
        });

        for (const event of events) {
            if (event.type === "PushEvent" && event.payload) {
                if (event.payload.commits && event.payload.commits.length > 0) {
                    latestPushEvent = event;
                    latestPushEvent.commitData = event.payload.commits[event.payload.commits.length - 1];
                    break;
                } else if (event.payload.head) {
                    console.log(`\n⚠️  'commits' array missing for ${event.repo.name}. Fetching HEAD commit ${event.payload.head.substring(0, 7)}...`);
                    // Fallback: Fetch the commit details directly
                    const commitUrl = `https://api.github.com/repos/${event.repo.name}/commits/${event.payload.head}`;
                    const commitResponse = await fetch(commitUrl, { headers });
                    if (commitResponse.ok) {
                        const commitDetails = await commitResponse.json();
                        latestPushEvent = event;
                        latestPushEvent.commitData = {
                            sha: commitDetails.sha,
                            message: commitDetails.commit.message,
                            url: commitDetails.html_url
                        };
                        break;
                    } else {
                        console.error(`❌ Failed to fetch commit details: ${commitResponse.status}`);
                    }
                }
            }
        }

        console.log("\n--- Result ---");
        if (latestPushEvent && latestPushEvent.commitData) {
            const { commitData } = latestPushEvent;
            console.log("✅ Found latest PushEvent!");
            console.log(`Repo: ${latestPushEvent.repo.name}`);
            console.log(`Commit: ${commitData.sha.substring(0, 7)}`);
            console.log(`Message: ${commitData.message}`);
            console.log(`Date: ${latestPushEvent.created_at}`);
        } else {
            console.log("❌ No PushEvent found in the last 100 public events.");
            console.log("Possible reasons:");
            console.log("1. You haven't pushed code recently.");
            console.log("2. Your pushes are to private repositories (and the token doesn't have access or this endpoint is public-only).");
            console.log("3. The 'public' events endpoint might have a delay.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

testFetch();
