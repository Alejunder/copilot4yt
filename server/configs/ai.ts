import { VertexAI } from "@google-cloud/vertexai";
// import Replicate from "replicate";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT as string;
const LOCATION   = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";


if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.warn("[ai] GOOGLE_APPLICATION_CREDENTIALS_JSON is not set — Vertex AI calls will fail.");
}

let parsedCredentials: Record<string, unknown> | undefined;
try {
  const raw = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ?? "{}");
  // Vercel stores multiline secrets with literal \n — restore real newlines
  // in the RSA private key or the JWT signature will be invalid.
  if (raw.private_key) {
    raw.private_key = (raw.private_key as string).replace(/\\n/g, "\n");
  }
  parsedCredentials = raw;
} catch {
  console.error("[ai] GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON — Vertex AI calls will fail.");
}

const vertexAI = new VertexAI({
  project: PROJECT_ID,
  location: LOCATION,
  googleAuthOptions: {
    scopes: "https://www.googleapis.com/auth/cloud-platform",
    credentials: parsedCredentials,
  },
});

// export const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN as string,
// });

export const FREE_MODELS = new Set([
  "gemini-2.5-flash-image",
] as const);

export const BASIC_MODELS = new Set([
  "gemini-3.1-flash-image-preview",
] as const);

export const PRO_MODELS = new Set([
  "gemini-3-pro-image-preview",
] as const);

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-image";

export const ALL_GEMINI_MODELS = new Set<string>([
  ...FREE_MODELS,
  ...BASIC_MODELS,
  ...PRO_MODELS,
]);

export type Plan = "free" | "basic" | "pro" | "enterprise";

export function isPlanAllowed(model: string, plan: Plan): boolean {
  if (FREE_MODELS.has(model as never))  return true;
  if (BASIC_MODELS.has(model as never)) return plan === "basic" || plan === "pro" || plan === "enterprise";
  if (PRO_MODELS.has(model as never))   return plan === "pro"   || plan === "enterprise";
  return false;
}

// ── FLUX / Replicate — commented out pending future migration ─────────────
// const FLUX_FREE_MODEL          = "black-forest-labs/flux-schnell";
// const FLUX_PRO_MODEL           = "black-forest-labs/flux-pro";
// const ALL_VALID_FLUX_MODELS    = new Set([FLUX_FREE_MODEL, FLUX_PRO_MODEL]);
// const FLUX_DIMENSIONS: Record<string, { width: number; height: number }> = {
//   "16:9": { width: 1280, height: 720 },
//   "1:1":  { width: 1024, height: 1024 },
//   "9:16": { width: 720,  height: 1280 },
// };

export default vertexAI;