import { useState, useEffect, useCallback } from 'react';
import { t, translateBackendError, getLocale, setLocale, type Locale } from '../utils/i18n';

export function useTranslation() {
    const [locale, setLocaleState] = useState<Locale>(getLocale);

    useEffect(() => {
        const handler = (e: Event) => {
            const { locale: newLocale } = (e as CustomEvent<{ locale: Locale }>).detail;
            setLocaleState(newLocale);
        };
        window.addEventListener('locale-change', handler);
        return () => window.removeEventListener('locale-change', handler);
    }, []);

    const changeLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        setLocale(newLocale);
    }, []);

    const translate = useCallback((key: string) => t(key, locale), [locale]);

    const translateError = useCallback(
        (code: string) => translateBackendError(code, locale),
        [locale]
    );

    return { t: translate, translateError, locale, changeLocale };
}
