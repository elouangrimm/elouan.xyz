// This function uses the modern HogQL API to query PostHog's cloud instance.

export default async function handler(req, res) {
  const posthogUrl = "https://us.posthog.com";
  
  // 2. Your Project ID.
  const projectId = "144453";
  
  // 3. Your secret API key from environment variables.
  const personalApiKey = process.env.POSTHOG_API_KEY;

  if (!personalApiKey) {
    console.error("PostHog API Key is not configured.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  // 4. The query to count ALL pageviews in the project.
  const hogqlQuery = `SELECT count() FROM events WHERE event = '$pageview'`;

  try {
    const response = await fetch(`${posthogUrl}/api/projects/${projectId}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${personalApiKey}`
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: hogqlQuery
        }
      })
    });

    if (!response.ok) {
        // This will log any error message from PostHog's API
        const errorBody = await response.text();
        console.error(`PostHog Query API Error: ${response.status}`, errorBody);
        throw new Error('Failed to fetch data from PostHog Query API.');
    }

    const data = await response.json();
    
    // The result is in a nested array: data.results[0][0]
    const count = data?.results?.[0]?.[0] ?? 0;

    // Set caching headers
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    // Send back the count in the format the frontend expects
    return res.status(200).json({ count: count });

  } catch (error) {
    console.error('Error in serverless function:', error.message);
    return res.status(500).json({ error: "Could not retrieve view count." });
  }
}