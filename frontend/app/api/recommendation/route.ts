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
  source: "wardrobe" | "ai";
};

// ─── Curated Pexels AI suggestion pool ──────────────────────────────────────
// These are high-quality Pexels images used for AI-generated outfit suggestions
// when the user doesn't have enough wardrobe items.
const PEXELS_AI_ITEMS = [
  // Shirts / Tops
  { id: "ai-s1",  name: "Classic White Shirt",      type: "shirt", theme: "casual",  processed_image_url: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-s2",  name: "Navy Blue Polo",            type: "shirt", theme: "smart",   processed_image_url: "https://images.pexels.com/photos/991509/pexels-photo-991509.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-s3",  name: "Striped Casual Tee",        type: "shirt", theme: "casual",  processed_image_url: "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-s4",  name: "Olive Green Henley",        type: "shirt", theme: "sporty",  processed_image_url: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-s5",  name: "Black Fitted Tee",          type: "shirt", theme: "minimal", processed_image_url: "https://images.pexels.com/photos/1232459/pexels-photo-1232459.jpeg?auto=compress&cs=tinysrgb&w=300" },
  // Pants / Bottoms
  { id: "ai-p1",  name: "Slim Fit Blue Jeans",       type: "pants", theme: "casual",  processed_image_url: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-p2",  name: "Beige Chinos",              type: "pants", theme: "smart",   processed_image_url: "https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-p3",  name: "Black Slim Trousers",       type: "pants", theme: "formal",  processed_image_url: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-p4",  name: "Grey Jogger Pants",         type: "pants", theme: "sporty",  processed_image_url: "https://images.pexels.com/photos/1519056/pexels-photo-1519056.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-p5",  name: "Dark Wash Denim",           type: "pants", theme: "casual",  processed_image_url: "https://images.pexels.com/photos/4210863/pexels-photo-4210863.jpeg?auto=compress&cs=tinysrgb&w=300" },
  // Shoes
  { id: "ai-sh1", name: "White Minimalist Sneakers",  type: "shoes", theme: "casual",  processed_image_url: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-sh2", name: "Brown Leather Boots",        type: "shoes", theme: "winter",  processed_image_url: "https://images.pexels.com/photos/267320/pexels-photo-267320.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-sh3", name: "Classic Black Loafers",      type: "shoes", theme: "formal",  processed_image_url: "https://images.pexels.com/photos/293405/pexels-photo-293405.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-sh4", name: "Running Sport Shoes",        type: "shoes", theme: "sporty",  processed_image_url: "https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=300" },
  { id: "ai-sh5", name: "Canvas Slip-Ons",            type: "shoes", theme: "casual",  processed_image_url: "https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=300" },
];

// Pre-built AI outfit combinations using the Pexels items above
const AI_OUTFIT_TEMPLATES = [
  { name: "Clean Minimalist",      description: "Effortless monochrome with a modern edge",  shirt: "ai-s1",  pants: "ai-p3", shoes: "ai-sh1" },
  { name: "Weekend Explorer",      description: "Relaxed layers for spontaneous adventures",  shirt: "ai-s3",  pants: "ai-p1", shoes: "ai-sh5" },
  { name: "Urban Sporty",          description: "Athletic vibes meet street style",           shirt: "ai-s4",  pants: "ai-p4", shoes: "ai-sh4" },
  { name: "Smart Casual Friday",   description: "Polished yet comfortable for any occasion",  shirt: "ai-s2",  pants: "ai-p2", shoes: "ai-sh3" },
  { name: "Night Out Classic",     description: "Dark tones for evening confidence",          shirt: "ai-s5",  pants: "ai-p5", shoes: "ai-sh2" },
];

const TARGET_OUTFIT_COUNT = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { mood, style, userId } = body;

    const moodValue  = mood  || "relaxed";
    const styleValue = style || "casual";

    console.log(`[recommendation] mood="${moodValue}" style="${styleValue}" userId="${userId || "none"}"`);

    // ── 1. Fetch user's wardrobe items from Supabase ───────────────────────
    let userItems: { id: string; name: string; type: string; theme: string; processed_image_url: string | null }[] = [];

    if (userId) {
      const { data: clothingItems, error: dbError } = await supabase
        .from("clothing_items")
        .select("id, name, type, theme, processed_image_url")
        .eq("user_id", userId)
        .not("processed_image_url", "is", null);

      if (dbError) {
        console.error("[recommendation] database query failed:", dbError);
      }
      userItems = clothingItems || [];
    } else {
      // Fallback: fetch all items (no user filter)
      const { data: clothingItems, error: dbError } = await supabase
        .from("clothing_items")
        .select("id, name, type, theme, processed_image_url")
        .not("processed_image_url", "is", null);

      if (dbError) {
        console.error("[recommendation] database query failed:", dbError);
      }
      userItems = clothingItems || [];
    }

    console.log(`[recommendation] User wardrobe: ${userItems.length} items`);

    // Classify user items by type
    const userShirts = userItems.filter(i => i.type === "shirt");
    const userPants  = userItems.filter(i => i.type === "pants");
    const userShoes  = userItems.filter(i => i.type === "shoes");

    // Check if user has enough items to create at least one complete outfit
    const hasCompleteSet = userShirts.length > 0 && userPants.length > 0 && userShoes.length > 0;
    
    // Count how many complete outfits we can make from user's wardrobe
    const maxWardrobeOutfits = hasCompleteSet
      ? Math.min(userShirts.length, userPants.length, userShoes.length, TARGET_OUTFIT_COUNT)
      : 0;

    console.log(`[recommendation] Can create ${maxWardrobeOutfits} wardrobe outfits, need ${TARGET_OUTFIT_COUNT - maxWardrobeOutfits} AI outfits`);

    // ── 2. Build wardrobe-based outfits using Gemini ───────────────────────
    const wardrobeOutfits: DBOutfit[] = [];

    if (maxWardrobeOutfits > 0) {
      // Build catalog from user items only
      const catalogMap = new Map<string, typeof userItems[0]>();
      userItems.forEach((item) => catalogMap.set(item.id, item));

      const formattedCatalog = userItems
        .map((item) => `- ID: "${item.id}" | Name: "${item.name}" | Type: "${item.type}" | Theme: "${item.theme}"`)
        .join("\n");

      const prompt = `Respond with valid JSON only — no markdown, no backticks, no extra text.

You are a professional fashion stylist. Below is the catalog of actual clothing items available in the user's wardrobe database.
Create exactly ${maxWardrobeOutfits} beautiful, stylish, and perfectly matching outfit recommendations for:
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
- Generate exactly ${maxWardrobeOutfits} outfits.
- Each outfit MUST use exactly one 'shirt', one 'pants', and one 'shoes' chosen exclusively from the catalog above. Do NOT invent new items or IDs.
- Double-check that the chosen item IDs match the catalog IDs perfectly.
- Try to use different combinations for each outfit — avoid repeating the same set.
- "name": 2–4 words that clearly evoke the style and mood.
- "description": under 12 words, captures the vibe.
- Response MUST be pure, valid JSON matching the exact schema above. No backticks, no markdown code block wrapper.`;

      try {
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

        if (Array.isArray(parsedData.outfits)) {
          for (const o of parsedData.outfits) {
            const dbShirt = catalogMap.get(o.shirt?.id ?? "") || userShirts[0] || null;
            const dbPants = catalogMap.get(o.pants?.id ?? "") || userPants[0] || null;
            const dbShoes = catalogMap.get(o.shoes?.id ?? "") || userShoes[0] || null;

            wardrobeOutfits.push({
              name: o.name || "My Style",
              description: o.description || "From your wardrobe collection",
              shirt: dbShirt ? { id: dbShirt.id, name: dbShirt.name, processed_image_url: dbShirt.processed_image_url } : null,
              pants: dbPants ? { id: dbPants.id, name: dbPants.name, processed_image_url: dbPants.processed_image_url } : null,
              shoes: dbShoes ? { id: dbShoes.id, name: dbShoes.name, processed_image_url: dbShoes.processed_image_url } : null,
              source: "wardrobe",
            });
          }
        }
      } catch (err) {
        console.error("[recommendation] Gemini wardrobe generation failed:", err instanceof Error ? err.message : err);
      }
    }

    // ── 3. Fill remaining slots with AI-generated Pexels outfits ───────────
    const aiSlotsNeeded = TARGET_OUTFIT_COUNT - wardrobeOutfits.length;
    const aiOutfits: DBOutfit[] = [];

    if (aiSlotsNeeded > 0) {
      const pexelsMap = new Map<string, typeof PEXELS_AI_ITEMS[0]>();
      PEXELS_AI_ITEMS.forEach(item => pexelsMap.set(item.id, item));

      // Use pre-built templates, shuffled for variety
      const shuffledTemplates = [...AI_OUTFIT_TEMPLATES].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(aiSlotsNeeded, shuffledTemplates.length); i++) {
        const tpl = shuffledTemplates[i];
        const shirt = pexelsMap.get(tpl.shirt) ?? null;
        const pants = pexelsMap.get(tpl.pants) ?? null;
        const shoes = pexelsMap.get(tpl.shoes) ?? null;

        aiOutfits.push({
          name: tpl.name,
          description: tpl.description,
          shirt: shirt ? { id: shirt.id, name: shirt.name, processed_image_url: shirt.processed_image_url } : null,
          pants: pants ? { id: pants.id, name: pants.name, processed_image_url: pants.processed_image_url } : null,
          shoes: shoes ? { id: shoes.id, name: shoes.name, processed_image_url: shoes.processed_image_url } : null,
          source: "ai",
        });
      }
    }

    // ── 4. Merge: wardrobe outfits first, then AI suggestions ──────────────
    const allOutfits = [...wardrobeOutfits, ...aiOutfits];

    console.log(`[recommendation] Returning ${wardrobeOutfits.length} wardrobe + ${aiOutfits.length} AI outfits`);

    return NextResponse.json({
      outfits: allOutfits,
      wardrobeCount: wardrobeOutfits.length,
      aiCount: aiOutfits.length,
      source: wardrobeOutfits.length > 0 ? "mixed" : "ai",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[recommendation] error, using AI fallback:", msg);

    // All-AI fallback using Pexels images
    const pexelsMap = new Map<string, typeof PEXELS_AI_ITEMS[0]>();
    PEXELS_AI_ITEMS.forEach(item => pexelsMap.set(item.id, item));

    const fallbackOutfits: DBOutfit[] = AI_OUTFIT_TEMPLATES.map(tpl => {
      const shirt = pexelsMap.get(tpl.shirt) ?? null;
      const pants = pexelsMap.get(tpl.pants) ?? null;
      const shoes = pexelsMap.get(tpl.shoes) ?? null;
      return {
        name: tpl.name,
        description: tpl.description,
        shirt: shirt ? { id: shirt.id, name: shirt.name, processed_image_url: shirt.processed_image_url } : null,
        pants: pants ? { id: pants.id, name: pants.name, processed_image_url: pants.processed_image_url } : null,
        shoes: shoes ? { id: shoes.id, name: shoes.name, processed_image_url: shoes.processed_image_url } : null,
        source: "ai",
      };
    });

    return NextResponse.json({ outfits: fallbackOutfits, wardrobeCount: 0, aiCount: fallbackOutfits.length, source: "fallback" });
  }
}
