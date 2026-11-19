
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const urls = body?.urls;

    if (!Array.isArray(urls) || urls.length === 0) {
      return Response.json(
        { error: "Please provide at least one URL." },
        { status: 400 }
      );
    }

    if (urls.length > 100) {
      return Response.json(
        { error: "Maximum 100 URLs per request." },
        { status: 400 }
      );
    }

    const cleanUrls = [...new Set(
      urls.map(url => String(url).trim())
    )];

    for (const url of cleanUrls) {
      try {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return Response.json(
          { error: `Invalid URL: ${url}` },
          { status: 400 }
        );
      }
    }

    const apiKey = process.env.INDEXMYLINK_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "API key is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://indexmylink.com/api/v1/index",
      {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ urls: cleanUrls }),
        cache: "no-store"
      }
    );

    const result = await response.json();

    return Response.json(result, {
      status: response.status,
      headers: { "Cache-Control": "no-store" }
    });

  } catch (error) {
    return Response.json(
      { error: "Indexing service request failed." },
      { status: 502 }
    );
  }
}
