import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import Credits from "../models/Credits.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { PLAN_BENEFITS } from "../configs/planBenefits.js";
import {
  GEMINI_API_KEY,
  GEMINI_BASE_URL,
  ALL_GEMINI_MODELS,
  DEFAULT_GEMINI_MODEL,
  isPlanAllowed,
  type Plan,
} from "../configs/ai.js";

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
  thought?: boolean;
}
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WATERMARK_PATH = path.join(__dirname, "../images/watermark.png");

async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const imageWidth = metadata.width ?? 1280;
  const watermarkWidth = Math.round(imageWidth * 0.18);

  const resizedWatermark = await sharp(WATERMARK_PATH)
    .resize(watermarkWidth)
    .toBuffer();

  return sharp(imageBuffer)
    .composite([{ input: resizedWatermark, gravity: "southeast" }])
    .toBuffer();
}

const GENERATION_COST = 10;

// ── FLUX / Replicate constants — commented out pending future migration ──────
// const FLUX_FREE_MODEL          = "black-forest-labs/flux-schnell";
// const FLUX_PRO_MODEL           = "black-forest-labs/flux-pro";
// const ALL_VALID_FLUX_MODELS    = new Set([FLUX_FREE_MODEL, FLUX_PRO_MODEL]);
// const FLUX_DIMENSIONS: Record<string, { width: number; height: number }> = {
//   "16:9": { width: 1280, height: 720 },
//   "1:1":  { width: 1024, height: 1024 },
//   "9:16": { width: 720,  height: 1280 },
// };

const stylePrompts: Record<string, string> = {
  "Bold & Graphic":
    "eye-catching YouTube thumbnail, bold large typography text overlay, vibrant saturated colors, dramatic studio lighting, high contrast composition, dynamic diagonal layout, click-worthy visual hierarchy, professional graphic design",
  "Tech/Futuristic":
    "futuristic YouTube thumbnail, sleek modern graphic design, digital HUD interface elements, glowing neon accents, holographic effects, cyber-tech geometric patterns, sharp dramatic lighting, high-tech dark atmosphere",
  "Minimalist":
    "minimalist YouTube thumbnail, clean uncluttered layout, simple bold geometric shapes, limited two-tone color palette, plenty of negative space, modern flat design, single clear focal point, elegant typography",
  "Photorealistic":
    "photorealistic YouTube thumbnail, ultra-realistic product or scene photography, DSLR camera aesthetic, studio professional lighting, shallow depth of field bokeh, sharp subject focus, commercial photography quality",
  "Illustrated":
    "illustrated YouTube thumbnail, custom digital artwork, bold graphic illustration style, vibrant flat colors, strong outlines, creative vector art composition, stylized non-realistic design",
};

const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
}

/** Upload a buffer to Cloudinary and return the secure URL. */
async function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "thumbnails" },
      (error, result) => {
        if (error) reject(error);
        else resolve((result as any).secure_url);
      }
    );
    stream.end(buffer);
  });
}

/** Build the generation prompt from the form inputs. */
function buildPrompt(
  title: string,
  style: string,
  aspectLabel: string,
  color_scheme?: string,
  user_prompt?: string,
  hasReferenceImage = false
): string {
  const styleDesc = stylePrompts[style as keyof typeof stylePrompts];
  const base = hasReferenceImage
    ? `Using the reference image provided as inspiration, create a ${styleDesc} for: "${title}". Use similar composition, style elements, or visual themes from the reference image.`
    : `Create a ${styleDesc} for: "${title}"`;

  let prompt = base;
  if (color_scheme) {
    prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
  }
  if (user_prompt) {
    prompt += ` Additional details: ${user_prompt}`;
  }
  prompt += ` The thumbnail must use a ${aspectLabel} aspect ratio, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;
  return prompt;
}

export const generateThumbnail = async (req: Request, res: Response) => {
  let creditsDeducted = false;
  let thumbnailId: string | null = null;

  try {
    const userId = (req as any).userId;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      model,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      res.status(500).json({ message: "Server configuration error" });
      return;
    }

    if (!title?.trim()) {
      res.status(400).json({ message: "Title is required" });
      return;
    }
    if (!style || !stylePrompts[style as keyof typeof stylePrompts]) {
      res.status(400).json({ message: "Invalid or missing thumbnail style" });
      return;
    }

    const selectedModel: string = model || DEFAULT_GEMINI_MODEL;

    if (!ALL_GEMINI_MODELS.has(selectedModel)) {
      res.status(400).json({ message: "Invalid model selected" });
      return;
    }

    const referenceImage = (req as any).file;

    // Expire plan if 30-day window has passed before checking access
    const userDoc = await User.findById(userId).select("plan planExpiresAt");
    if (userDoc && userDoc.plan !== "free" && userDoc.planExpiresAt && userDoc.planExpiresAt < new Date()) {
      await User.findByIdAndUpdate(userId, { $set: { plan: "free", planExpiresAt: null } });
      await Credits.findOneAndUpdate({ userId }, { $set: { plan: "free" } });
    }

    const effectivePlan = ((await Credits.findOne({ userId }))?.plan ?? "free") as keyof typeof PLAN_BENEFITS;
    const benefits = PLAN_BENEFITS[effectivePlan];

    if (!isPlanAllowed(selectedModel, effectivePlan as Plan)) {
      res.status(403).json({ message: "This model requires a higher-tier plan. Please upgrade to access it." });
      return;
    }

    if (referenceImage && !benefits.referenceImageAllowed) {
      res.status(403).json({ message: "Reference image uploads require a paid plan. Please upgrade to use this feature." });
      return;
    }

    if (effectivePlan === "free") {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await Credits.findOneAndUpdate(
        {
          userId,
          $or: [
            { lastDailyCreditReset: { $exists: false } },
            { lastDailyCreditReset: { $lt: twentyFourHoursAgo } },
          ],
        },
        {
          $set: { credits: 20, plan: "free", lastDailyCreditReset: new Date() },
          $setOnInsert: { userId },
        },
        { upsert: true }
      );
    }

    const credits = await Credits.findOne({ userId });

    if (!credits || credits.credits < GENERATION_COST) {
      res.status(403).json({ message: "Not enough credits" });
      return;
    }

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      model: selectedModel,
      isGenerating: true,
    });
    thumbnailId = thumbnail._id as string;

    credits.credits -= GENERATION_COST;
    await credits.save();
    creditsDeducted = true;

    const aspectLabel = aspect_ratio === '16:9' ? 'widescreen 16:9'
      : aspect_ratio === '9:16' ? 'vertical 9:16'
      : aspect_ratio === '1:1' ? 'square 1:1'
      : (aspect_ratio || '16:9');
    const hasReferenceImage = !!(referenceImage && referenceImage.buffer);
    const prompt = buildPrompt(title, style, aspectLabel, color_scheme, user_prompt, hasReferenceImage);

    // ── FLUX / Replicate generation path — commented out pending migration ────
    // if (provider === "flux") {
    //   const fluxModel = selectedModel as `${string}/${string}`;
    //   const isProModel = selectedModel === FLUX_PRO_MODEL;
    //   const dimensions = FLUX_DIMENSIONS[aspect_ratio] ?? FLUX_DIMENSIONS["16:9"];
    //   const fluxInput = isProModel
    //     ? { prompt, width: dimensions.width, height: dimensions.height }
    //     : { prompt, aspect_ratio: aspect_ratio || "16:9" };
    //   const fluxOutput = await replicate.run(fluxModel, { input: fluxInput });
    //   // ... (normalise output, upload, return)
    //   return;
    // }

    const contentParts: GeminiPart[] = [];
    if (referenceImage && referenceImage.buffer) {
      contentParts.push({
        inlineData: {
          mimeType: referenceImage.mimetype,
          data: (referenceImage.buffer as Buffer).toString("base64"),
        },
      });
    }
    contentParts.push({ text: prompt });

    const geminiRes = await fetch(
      `${GEMINI_BASE_URL}/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: contentParts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${errBody}`);
    }

    const data = await geminiRes.json() as {
      candidates?: Array<{
        content?: { parts?: GeminiPart[] };
        finishReason?: string;
      }>;
      error?: { message: string };
    };

    if (!data?.candidates?.[0]?.content?.parts) {
      console.error("Gemini raw response:", JSON.stringify(data, null, 2));
      const reason =
        data?.candidates?.[0]?.finishReason ??
        data?.error?.message ??
        "unknown";
      throw new Error(`Gemini returned no content parts (reason: ${reason})`);
    }

    const parts = data.candidates[0].content.parts!;

    let finalBuffer: Buffer | null = null;
    for (const part of parts) {
      if (part.thought) continue;
      if (part.inlineData?.data) {
        finalBuffer = Buffer.from(part.inlineData.data, "base64");
      }
    }

    if (!finalBuffer) {
      console.error(
        "Parts received:",
        JSON.stringify(
          parts.map((p) => ({
            hasInlineData: !!p.inlineData,
            hasText: !!p.text,
            thought: !!p.thought,
          })),
          null,
          2
        )
      );
      throw new Error("Gemini returned no image in response");
    }

    let uploadBuffer: Buffer = finalBuffer;
    if (effectivePlan === "free") {
      try {
        uploadBuffer = await applyWatermark(finalBuffer);
      } catch (wmErr) {
        console.error("Watermark failed — falling back to original image:", wmErr);
      }
    }

    const secureUrl = await uploadToCloudinary(uploadBuffer);
    thumbnail.image_url = secureUrl;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.json({ message: "Thumbnail generated", thumbnail });


  } catch (error: any) {
    console.error("generateThumbnail error:", error);

    if (creditsDeducted) {
      try {
        await Credits.findOneAndUpdate(
          { userId: (req as any).userId },
          { $inc: { credits: GENERATION_COST } }
        );
      } catch (refundErr) {
        console.error("Failed to refund credits after generation error:", refundErr);
      }
    }

    if (thumbnailId) {
      try {
        await Thumbnail.findByIdAndDelete(thumbnailId);
      } catch (cleanupErr) {
        console.error("Failed to clean up orphaned thumbnail:", cleanupErr);
      }
    }

    res.status(500).json({ message: error.message });
  }
};

export const deleteThumbnail = async (req: Request, res: Response) => { 

    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        await Thumbnail.findByIdAndDelete({ _id: id, userId });

        res.json({ message: "Thumbnail deleted successfully" });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message});
    }

}