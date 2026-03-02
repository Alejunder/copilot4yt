import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";
import { v2 as cloudinary } from "cloudinary";

const GEMINI_MODEL = "gemini-3.1-flash-image-preview";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    // Get the uploaded file from multer
    const referenceImage = (req as any).file;

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    // gemini-3.1-flash-image-preview: supports responseModalities + imageConfig.
    // We call the REST API directly with fetch instead of the @google/genai SDK because
    // the SDK maps GenerateContentConfig incorrectly for image generation models,
    // consistently producing IMAGE_OTHER / NO_IMAGE despite the REST API working fine.

    // Build the prompt
    let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;
    if (color_scheme) {
      prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
    }
    if (user_prompt) {
      prompt += ` Additional details: ${user_prompt}`;
    }
    const aspectLabel = aspect_ratio === '16:9' ? 'widescreen 16:9' : aspect_ratio === '9:16' ? 'vertical 9:16' : aspect_ratio === '1:1' ? 'square 1:1' : (aspect_ratio || '16:9');
    prompt += ` The thumbnail must use a ${aspectLabel} aspect ratio, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;

    // Build content parts (text + optional reference image)
    const contentParts: any[] = [];
    if (referenceImage && referenceImage.buffer) {
      prompt = `Using the reference image provided as inspiration, create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}". Use similar composition, style elements, or visual themes from the reference image.`;
      if (color_scheme) {
        prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
      }
      if (user_prompt) {
        prompt += ` Additional details: ${user_prompt}`;
      }
      prompt += ` The thumbnail must use a ${aspectLabel} aspect ratio, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;
      contentParts.push({
        inlineData: {
          mimeType: referenceImage.mimetype,
          data: referenceImage.buffer.toString("base64"),
        },
      });
    }
    contentParts.push({ text: prompt });

    const geminiRequestBody = {
      contents: [{ role: "user", parts: contentParts }],
      generationConfig: {
        // Both TEXT and IMAGE are required — IMAGE alone causes IMAGE_OTHER on most models.
        // imageConfig.aspectRatio is not a valid REST API field; aspect ratio goes in the prompt.
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiRequestBody),
      }
    );

    const response: any = await geminiResponse.json();

    // Check if the response is valid
    if (!response?.candidates?.[0]?.content?.parts) {
        console.error('Gemini raw response:', JSON.stringify(response, null, 2));
        const reason = response?.candidates?.[0]?.finishReason || response?.error?.message || "unknown";
        throw new Error(`Gemini returned no content parts (reason: ${reason})`);
    }

    const parts = response.candidates[0].content.parts;

    let finalBuffer: Buffer | null = null;
    for (const part of parts) {
      // Skip thought parts (present in thinking models like gemini-3-pro-image-preview)
      if (part.thought) continue;
      if (part.inlineData?.data) {
        finalBuffer = Buffer.from(part.inlineData.data, "base64");
      }
    }

    if (!finalBuffer) {
        console.error('Parts received:', JSON.stringify(parts.map((p: any) => ({ hasInlineData: !!p.inlineData, hasText: !!p.text, thought: !!p.thought })), null, 2));
        throw new Error("Gemini returned no image in response");
    }

    // Upload directly to Cloudinary from buffer (Vercel-compatible)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image", folder: "thumbnails" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(finalBuffer!);
    });

    thumbnail.image_url = (uploadResult as any).secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.json({message : "Thumbnail generated ", thumbnail })


  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message});
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