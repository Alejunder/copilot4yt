if (!process.env.GEMINI_API_KEY) {
  console.warn("[ai] GEMINI_API_KEY is not set — AI generation calls will fail.");
}

export const GEMINI_API_KEY  = process.env.GEMINI_API_KEY as string;
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

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

