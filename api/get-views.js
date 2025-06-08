// This function will run on a server, not in the user's browser.
// It will be accessible at yoursite.com/api/get-views

export default async function handler(req, res) {
    // These values are safe to be public.
    const projectId = "144453"; // <-- Paste your Project ID here
    const insightId = "DsoKcUHG"; // <-- Paste your Insight ID here

    // This is your secret API key. We get it from environment variables.
    const apiKey = process.env.POSTHOG_API_KEY;

    if (!apiKey) {
        // This error will show in your server logs, not to the user.
        console.error("PostHog API Key is not configured.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    // The PostHog API endpoint for fetching a specific insight.
    const posthogApiUrl = `https://us.posthog.com/api/projects/${projectId}/insights/${insightId}/`;

    try {
        const response = await fetch(posthogApiUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            // Log the error for debugging
            const errorBody = await response.text();
            console.error(`PostHog API Error: ${response.status}`, errorBody);
            throw new Error("Failed to fetch data from PostHog.");
        }

        const data = await response.json();

        // The structure of the insight result is nested.
        // The count is usually in result.data[0].count
        // We log the data to be sure of the structure.
        // console.log(JSON.stringify(data, null, 2));

        // Extract the count. Use optional chaining (?.) for safety.
        const count = data?.result?.data?.[0]?.count ?? 0;

        // Set caching headers. Cache the result for 5 minutes (300 seconds).
        // This prevents hitting the API on every single page load.
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");

        // Send ONLY the count back to the frontend.
        return res.status(200).json({ count: count });
    } catch (error) {
        console.error("Error in serverless function:", error.message);
        return res
            .status(500)
            .json({ error: "Could not retrieve view count." });
    }
}
