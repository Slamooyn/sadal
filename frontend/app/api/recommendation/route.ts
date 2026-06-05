import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../../../lib/supabase/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateWithRetry(
  prompt: string,
  models: string[],
  maxRetries = 2,
): Promise<string> {
  for (const modelName of models) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[recommendation] calling ${modelName} (attempt ${attempt})`);
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        console.log(`[recommendation] ${modelName} responded (${text.length} chars)`);
        return text;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[recommendation] ${modelName} attempt ${attempt} failed:`, msg.slice(0, 120));

        const is429 = msg.includes("429");
        if (is429 && attempt < maxRetries) {
          const delay = attempt * 3000;
          console.log(`[recommendation] rate limited — waiting ${delay}ms before retry`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        break;
      }
    }
  }

  throw new Error("All models exhausted");
}

type OutfitItemDetail = {
  id: string;
  name: string;
  processed_image_url: string | null;
};

type DBOutfit = {
  name: string;
  description: string;
  shirt: OutfitItemDetail | null;
  pants: OutfitItemDetail | null;
  shoes: OutfitItemDetail | null;
};

export async function POST(request: Request) {
  try {
    const { mood, style } = await request.json().catch(() => ({}));

    const moodValue  = mood  || "relaxed";
    const styleValue = style || "casual";

    console.log(`[recommendation] DB-mode: mood="${moodValue}" style="${styleValue}"`);

    // Fetch all clothing items with processed images from Supabase
    const { data: clothingItems, error: dbError } = await supabase
      .from("clothing_items")
      .select("id, name, type, theme, processed_image_url")
      .not("processed_image_url", "is", null);

    if (dbError) {
      console.error("[recommendation] database query failed:", dbError);
    }

    const items = clothingItems || [];
    console.log(`[recommendation] Loaded ${items.length} items from Supabase`);

    // Map items for rapid lookup
    const catalogMap = new Map<string, { id: string; name: string; type: string; theme: string; processed_image_url: string | null }>();
    items.forEach((item) => catalogMap.set(item.id, item));

    // If database has no items, create high-quality mock items to avoid blank screens
    if (items.length === 0) {
      const mockItems = [
        { id: "mock-s1", name: "Casual Denim Shirt", type: "shirt", theme: "summer", processed_image_url: "https://images.unsplash.com/photo-1541101767792-f9b472c0db39?q=80&w=300&auto=format&fit=crop" },
        { id: "mock-s2", name: "Classic White Tee", type: "shirt", theme: "summer", processed_image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop" },
        { id: "mock-p1", name: "Slim Fit Blue Jeans", type: "pants", theme: "summer", processed_image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=300&auto=format&fit=crop" },
        { id: "mock-p2", name: "Beige Summer Chinos", type: "pants", theme: "summer", processed_image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=300&auto=format&fit=crop" },
        { id: "mock-sh1", name: "Minimalist White Sneakers", type: "shoes", theme: "summer", processed_image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop" },
        { id: "mock-sh2", name: "Brown Leather Loafers", type: "shoes", theme: "summer", processed_image_url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=300&auto=format&fit=crop" },
      ];
      mockItems.forEach(item => {
        items.push(item);
        catalogMap.set(item.id, item);
      });
    }

    // Format catalog for Gemini prompt
    const formattedCatalog = items
      .map((item) => `- ID: "${item.id}" | Name: "${item.name}" | Type: "${item.type}" | Theme: "${item.theme}"`)
      .join("\n");

    const prompt = `Respond with valid JSON only — no markdown, no backticks, no extra text.

You are a professional fashion stylist. Below is the catalog of actual clothing items available in the user's wardrobe database.
Create exactly 5 beautiful, stylish, and perfectly matching outfit recommendations for:
- Mood: ${moodValue}
- Style: ${styleValue}

Available Clothing Catalog:
${formattedCatalog}

For each outfit recommendation, select exactly ONE shirt (Type: "shirt"), ONE pants (Type: "pants"), and ONE shoes (Type: "shoes") from the catalog above. Make sure the combination makes logical and aesthetic sense, and beautifully matches the requested style ("${styleValue}") and mood ("${moodValue}").

Use exactly this JSON structure:
{
  "outfits": [
    {
      "name": "Outfit Name",
      "description": "Short vibe under 12 words",
      "shirt": { "id": "selected_shirt_id", "name": "selected_shirt_name" },
      "pants": { "id": "selected_pants_id", "name": "selected_pants_name" },
      "shoes": { "id": "selected_shoes_id", "name": "selected_shoes_name" }
    }
  ]
}

Rules:
- Generate exactly 5 outfits.
- Each outfit MUST use exactly one 'shirt', one 'pants', and one 'shoes' chosen exclusively from the catalog above. Do NOT invent new items or IDs.
- Double-check that the chosen item IDs match the catalog IDs perfectly.
- "name": 2–4 words that clearly evoke the style and mood.
- "description": under 12 words, captures the vibe.
- Response MUST be pure, valid JSON matching the exact schema above. No backticks, no markdown code block wrapper.`;

    const text = await generateWithRetry(prompt, [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ]);

    let parsedData: { outfits?: { name?: string; description?: string; shirt?: { id?: string }; pants?: { id?: string }; shoes?: { id?: string } }[] } = {};
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON object found in response");
      parsedData = JSON.parse(match[0]);
    }

    if (!Array.isArray(parsedData.outfits) || parsedData.outfits.length === 0) {
      throw new Error("Parsed JSON has no outfits array");
    }

    const assembledOutfits: DBOutfit[] = parsedData.outfits.map((o) => {
      const dbShirt = catalogMap.get(o.shirt?.id ?? "") || items.find(i => i.type === "shirt") || null;
      const dbPants = catalogMap.get(o.pants?.id ?? "") || items.find(i => i.type === "pants") || null;
      const dbShoes = catalogMap.get(o.shoes?.id ?? "") || items.find(i => i.type === "shoes") || null;

      return {
        name: o.name || "Stylish Vibe",
        description: o.description || "Beautifully matched look",
        shirt: dbShirt ? { id: dbShirt.id, name: dbShirt.name, processed_image_url: dbShirt.processed_image_url } : null,
        pants: dbPants ? { id: dbPants.id, name: dbPants.name, processed_image_url: dbPants.processed_image_url } : null,
        shoes: dbShoes ? { id: dbShoes.id, name: dbShoes.name, processed_image_url: dbShoes.processed_image_url } : null,
      };
    });

    return NextResponse.json({ outfits: assembledOutfits, source: "gemini" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[recommendation] error matching outfits, using static fallback:", msg);

    // Dynamic static fallback from hardcoded mock list
    const fallbackOutfits = [
      {
        name: "Casual Vibe",
        description: "Comfortable and stylish look",
        shirt: { id: "f-s1", name: "Casual T-Shirt", processed_image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=300&auto=format&fit=crop" },
        pants: { id: "f-p1", name: "Slim Chinos", processed_image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=300&auto=format&fit=crop" },
        shoes: { id: "f-sh1", name: "Classic Sneakers", processed_image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop" },
      }
    ];

    return NextResponse.json({ outfits: fallbackOutfits, source: "fallback" });
  }
}
