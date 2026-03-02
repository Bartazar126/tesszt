import { Locale } from './context';

export function getLocalizedText(
    value: string | Record<string, string> | undefined,
    locale: Locale
): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    // Fallbacks: requested locale -> English -> first available key
    if (value[locale]) return value[locale];
    if (value.en) return value.en;

    const keys = Object.keys(value);
    if (keys.length > 0) return value[keys[0]];
    return '';
}
