import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query } = await request.json().catch(() => ({}));

    if (!query?.trim()) {
      return NextResponse.json({ url: null });
    }

    // Ensure Pexels always returns fashion-relevant photos
    const raw = query.trim();
    const lower = raw.toLowerCase();
    const fashionQuery =
      lower.includes("fashion") || lower.includes("outfit") || lower.includes("clothing")
        ? raw
        : `${raw} fashion outfit clothing`;

    const url =
      `https://api.pexels.com/v1/search` +
      `?query=${encodeURIComponent(fashionQuery)}` +
      `&per_page=1&orientation=portrait`;

    const res = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY! },
      next: { revalidate: 3600 }, // cache same query for 1 hour
    });

    if (!res.ok) {
      console.error(`[photos] Pexels ${res.status} for query: "${query}"`);
      return NextResponse.json({ url: null });
    }

    const data = await res.json();
    const photoUrl: string | null = data.photos?.[0]?.src?.portrait ?? null;

    console.log(`[photos] "${fashionQuery}" → ${photoUrl ? "found" : "not found"}`);
    return NextResponse.json({ url: photoUrl });
  } catch (err) {
    console.error("[photos] error:", err);
    return NextResponse.json({ url: null });
  }
}
