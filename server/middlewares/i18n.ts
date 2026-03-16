import { Request, Response, NextFunction } from 'express';

// ---------------------------------------------------------------------------
// Supported locales & default
// ---------------------------------------------------------------------------
export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export const DEFAULT_LOCALE = 'en' as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

// Augment the Express Request type so every controller can read `req.locale`
declare global {
    namespace Express {
        interface Request {
            locale: Locale;
        }
    }
}

// ---------------------------------------------------------------------------
// Accept-Language parser
// Handles headers like: "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7"
// ---------------------------------------------------------------------------
function parseAcceptLanguage(header: string | undefined): Locale {
    if (!header) return DEFAULT_LOCALE;

    const best = header
        .split(',')
        .map((part) => {
            const [rawLang, rawQ] = part.trim().split(';q=');
            const lang = rawLang.split('-')[0].toLowerCase(); // "es-ES" → "es"
            const q = rawQ !== undefined ? parseFloat(rawQ) : 1.0;
            return { lang, q };
        })
        .filter(({ q }) => !isNaN(q))
        .sort((a, b) => b.q - a.q) // high quality-factor first
        .find(({ lang }) => SUPPORTED_LOCALES.includes(lang as Locale));

    return best ? (best.lang as Locale) : DEFAULT_LOCALE;
}

// ---------------------------------------------------------------------------
// Middleware
// Reads Accept-Language, resolves to a supported locale, attaches to req.
// Usage: app.use(i18nMiddleware) — must be mounted BEFORE route handlers.
// ---------------------------------------------------------------------------
export const i18nMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
    req.locale = parseAcceptLanguage(req.headers['accept-language']);
    next();
};
