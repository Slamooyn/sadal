import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Fallback if Gemini is unavailable
const FALLBACK_OUTFITS = [
  { name: "Casual Classic",  description: "Effortless everyday comfort",       items: ["White t-shirt", "Blue jeans", "White sneakers"],          imageQuery: "casual everyday fashion outfit clothing" },
  { name: "Street Chic",     description: "Bold and urban street style",       items: ["Graphic hoodie", "Cargo pants", "Chunky sneakers"],        imageQuery: "urban streetwear fashion outfit clothing" },
  { name: "Smart Casual",    description: "Polished yet relaxed look",         items: ["Oxford shirt", "Chinos", "Loafers"],                       imageQuery: "smart casual fashion outfit clothing" },
  { name: "Sporty Fresh",    description: "Active and energetic all-day look", items: ["Sports tee", "Track pants", "Running shoes"],              imageQuery: "sporty athletic fashion outfit clothing" },
  { name: "Minimal Vibes",   description: "Clean lines, calm aesthetic",       items: ["Plain crewneck", "Straight-leg trousers", "Sneakers"],     imageQuery: "minimalist fashion outfit clothing style" },
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

  // Ensure imageQuery always contains fashion/clothing keywords
  return (data.outfits as OutfitItem[]).map((o) => {
    const base = o.imageQuery?.trim() || `${o.name} fashion outfit`;
    const lower = base.toLowerCase();
    const hasFashion = lower.includes("fashion") || lower.includes("outfit") || lower.includes("clothing");
    return { ...o, imageQuery: hasFashion ? base : `${base} fashion outfit clothing` };
  });
}

export async function POST(request: Request) {
  const { mood, style, wardrobeItems } = await request.json().catch(() => ({}));

  const moodValue  = mood  || "relaxed";
  const styleValue = style || "casual";

  console.log(`[recommendation] mood="${moodValue}" style="${styleValue}"`);

  const STYLE_GUIDE: Record<string, { pieces: string; imageHint: string }> = {
    sporty:     { pieces: "athletic wear only: hoodies, joggers, track jackets, jerseys, compression tights, sports bras, sneakers, running shoes — NO shirts, chinos, loafers, or formal pieces", imageHint: "athletic sportswear outfit jogger hoodie" },
    casual:     { pieces: "relaxed everyday wear: t-shirts, jeans, shorts, flannel shirts, slip-on sneakers, canvas shoes", imageHint: "casual everyday fashion outfit" },
    formal:     { pieces: "formal / business wear: blazers, dress shirts, trousers, pencil skirts, heels, oxfords, ties", imageHint: "formal business fashion outfit" },
    streetwear: { pieces: "urban street style: graphic tees, oversized hoodies, cargo pants, chunky sneakers, caps, puffer jackets", imageHint: "urban streetwear fashion outfit" },
    elegant:    { pieces: "elegant / chic wear: midi dresses, tailored coats, silk blouses, heeled boots, minimalist jewelry", imageHint: "elegant chic fashion outfit" },
    bohemian:   { pieces: "boho / free-spirit wear: flowy dresses, wide-leg pants, fringe vests, sandals, headbands, layered accessories", imageHint: "bohemian boho fashion outfit" },
    minimalist: { pieces: "clean minimalist wear: plain crewnecks, straight-leg trousers, monochrome sets, simple sneakers, tote bags", imageHint: "minimalist clean fashion outfit" },
  };

  const styleKey = styleValue.toLowerCase();
  const styleGuide = STYLE_GUIDE[styleKey];
  const styleInstruction = styleGuide
    ? `CRITICAL — style is "${styleValue}": every outfit MUST use ${styleGuide.pieces}. imageQuery examples for this style: "${styleGuide.imageHint}", "${styleValue.toLowerCase()} fashion outfit clothing".`
    : `CRITICAL — style is "${styleValue}": every outfit MUST look like genuine ${styleValue} fashion. Use only clothing pieces and imageQuery keywords that clearly represent ${styleValue} style.`;

  console.log(`[recommendation] styleKey="${styleKey}" styleGuide=${styleGuide ? "FOUND" : "NOT FOUND (using generic fallback)"}`);
  console.log(`[recommendation] styleInstruction="${styleInstruction}"`);

  const prompt = `Respond with valid JSON only — no markdown, no backticks, no extra text.

You are a fashion stylist. Generate 5 outfit recommendations for:
- Mood: ${moodValue}
- Style: ${styleValue}${Array.isArray(wardrobeItems) && wardrobeItems.length > 0 ? `\n- Wardrobe items: ${wardrobeItems.join(", ")}` : ""}

${styleInstruction}

Use exactly this JSON structure:
{"outfits":[{"name":"Outfit Name","description":"Short vibe under 12 words","items":["Piece 1","Piece 2","Piece 3"],"imageQuery":"search query"}]}

Rules:
- Exactly 5 outfits, ALL must be ${styleValue} style — do NOT generate casual, formal, or smart-casual outfits if the style is sporty, and vice versa
- name: 2–4 words that clearly evoke ${styleValue} (e.g. for Sporty: "Track Day Look", "Gym Flow", "Athletic Edge")
- description: under 12 words, captures the ${moodValue} mood and ${styleValue} vibe
- items: 3–4 clothing pieces that are 100% appropriate for ${styleValue} style
- imageQuery: 4–7 words for Pexels — MUST include "fashion outfit" AND style-specific words (e.g. for Sporty: "sporty athletic fashion outfit jogger", "gym sportswear fashion outfit hoodie") — never generic terms like "casual classic" or "smart casual" unless that IS the chosen style
- Every single field must reflect ${styleValue} + ${moodValue} — no mixing with other styles`;

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
