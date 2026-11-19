
export const runtime = "nodejs";

export async function GET() {
  try {
    const apiKey = process.env.INDEXMYLINK_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "API key is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://indexmylink.com/api/v1/account",
      {
        headers: {
          "X-API-Key": apiKey
        },
        cache: "no-store"
      }
    );

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
      headers: { "Cache-Control": "no-store" }
    });

  } catch {
    return Response.json(
      { error: "Unable to connect to account API." },
      { status: 502 }
    );
  }
}
