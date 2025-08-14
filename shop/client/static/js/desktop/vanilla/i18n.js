export function getLang() {
    // Get from Django if available
    if (window.DJANGO_LANG) {
        return window.DJANGO_LANG;
    }

    // Get from browser settings
    const browserLang = navigator.language.split('-')[0]; // Extract 'en' from 'en-US'

    // Supported languages
    const supportedLangs = ["en", "uk", "de"];

    // Use browser language if supported, otherwise fallback to 'uk'
    return supportedLangs.includes(browserLang) ? browserLang : "uk";
}

export function t(key) {
    const lang = getLang();
    return translation[key]?.[lang] || translation[key]?.["uk"] || key;
}