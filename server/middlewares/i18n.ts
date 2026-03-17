import { Request, Response, NextFunction } from 'express';


export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export const DEFAULT_LOCALE = 'en' as const;

export type Locale = typeof SUPPORTED_LOCALES[number];


declare global {
    namespace Express {
        interface Request {
            locale: Locale;
        }
    }
}


function parseAcceptLanguage(header: string | undefined): Locale {
    if (!header) return DEFAULT_LOCALE;

    const best = header
        .split(',')
        .map((part) => {
            const [rawLang, rawQ] = part.trim().split(';q=');
            const lang = rawLang.split('-')[0].toLowerCase();
            const q = rawQ !== undefined ? parseFloat(rawQ) : 1.0;
            return { lang, q };
        })
        .filter(({ q }) => !isNaN(q))
        .sort((a, b) => b.q - a.q)
        .find(({ lang }) => SUPPORTED_LOCALES.includes(lang as Locale));

    return best ? (best.lang as Locale) : DEFAULT_LOCALE;
}


export const i18nMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
    req.locale = parseAcceptLanguage(req.headers['accept-language']);
    next();
};
