import en from '../locales/en.json';
import es from '../locales/es.json';

type Translations = typeof en;
type BackendErrorCode = keyof typeof en.backend_errors;

export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

const translations: Record<Locale, Translations> = { en, es };

function detectLocale(): Locale {
    const saved = localStorage.getItem('locale');
    if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) return saved as Locale;

    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(browserLang as Locale)) return browserLang as Locale;

    return 'en';
}

export function getLocale(): Locale {
    return detectLocale();
}

export function setLocale(locale: Locale): void {
    localStorage.setItem('locale', locale);
    window.dispatchEvent(new CustomEvent('locale-change', { detail: { locale } }));
}

export function t(key: string, locale?: Locale): string {
    const current = locale ?? getLocale();
    const dict = translations[current].ui as Record<string, unknown>;

    const value = key.split('.').reduce<unknown>((node, segment) => {
        if (node && typeof node === 'object') {
            return (node as Record<string, unknown>)[segment];
        }
        return undefined;
    }, dict);

    if (typeof value === 'string') return value;
    if (current !== 'en') return t(key, 'en');
    return key;
}

export function translateBackendError(code: string, locale?: Locale): string {
    const current = locale ?? getLocale();
    const errors = translations[current].backend_errors;

    if (code in errors) {
        return errors[code as BackendErrorCode];
    }

    return errors.UNKNOWN_ERROR;
}
