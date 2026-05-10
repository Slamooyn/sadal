import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Fallback if Gemini is unavailable
const FALLBACK_OUTFITS = [
  { name: "Casual Classic",  description: "Effortless everyday comfort",       items: ["White t-shirt", "Blue jeans", "White sneakers"],          imageQuery: "casual everyday outfit street" },
  { name: "Street Chic",     description: "Bold and urban street style",       items: ["Graphic hoodie", "Cargo pants", "Chunky sneakers"],        imageQuery: "urban streetwear fashion" },
  { name: "Smart Casual",    description: "Polished yet relaxed look",         items: ["Oxford shirt", "Chinos", "Loafers"],                       imageQuery: "smart casual men fashion" },
  { name: "Sporty Fresh",    description: "Active and energetic all-day look", items: ["Sports tee", "Track pants", "Running shoes"],              imageQuery: "sporty athletic outfit style" },
  { name: "Minimal Vibes",   description: "Clean lines, calm aesthetic",       items: ["Plain crewneck", "Straight-leg trousers", "Sneakers"],     imageQuery: "minimalist fashion outfit clean" },
];

// Try generating with retries on 429 (rate limit)
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

type OutfitItem = {
  name: string;
  description: string;
  items: string[];
  imageQuery: string;
};

function parseOutfits(text: string): OutfitItem[] {
  let data: { outfits?: unknown };

  try {
    data = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
    data = JSON.parse(match[0]);
  }

  if (!Array.isArray(data.outfits) || data.outfits.length === 0) {
    throw new Error("Parsed JSON has no outfits array");
  }

  // Ensure imageQuery is always present — fallback to name + "outfit"
  return (data.outfits as OutfitItem[]).map((o) => ({
    ...o,
    imageQuery: o.imageQuery?.trim() || `${o.name} outfit fashion`,
  }));
}

export async function POST(request: Request) {
  const { mood, style, wardrobeItems } = await request.json().catch(() => ({}));

  const moodValue  = mood  || "relaxed";
  const styleValue = style || "casual";

  console.log(`[recommendation] mood="${moodValue}" style="${styleValue}"`);

  const prompt = `Respond with valid JSON only — no markdown, no backticks, no extra text.

Generate 5 outfit recommendations for someone with:
- Mood today: ${moodValue}
- Style preference: ${styleValue}${Array.isArray(wardrobeItems) && wardrobeItems.length > 0 ? `\n- Wardrobe items available: ${wardrobeItems.join(", ")}` : ""}

Use exactly this JSON structure:
{"outfits":[{"name":"Outfit Name","description":"Short vibe under 12 words","items":["Piece 1","Piece 2","Piece 3"],"imageQuery":"2-5 word photo search for this outfit"}]}

Rules:
- Exactly 5 outfits in the array
- name: 2–4 words, creative and catchy
- description: under 12 words, describes the vibe or occasion
- items: 3–4 specific, realistic clothing pieces
- imageQuery: 2–5 words for a Pexels photo search that best represents this outfit (e.g., "summer beach outfit", "urban streetwear men", "cozy winter layers")
- All outfits must match the ${moodValue} mood and ${styleValue} style`;

  try {
    const text = await generateWithRetry(prompt, [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ]);

    const outfits = parseOutfits(text);
    return NextResponse.json({ outfits, source: "gemini" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[recommendation] all models failed, using fallback:", msg.slice(0, 200));
    return NextResponse.json({ outfits: FALLBACK_OUTFITS, source: "fallback" });
  }
}
