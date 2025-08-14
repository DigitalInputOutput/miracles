import { gettext } from "/static/js/desktop/vanilla/i18n.js";

export const translation = {
    "delete_image": {
        "uk": "Видалити картинку?",
        "en": "Delete image?",
        "de": "Das Bild löschen?"
    },
    "max_length_error": {
        "uk": 'Максимальна довжина ',
        "en": 'Maximum length ',
        "de": 'Maximal Lange '
    },
    "min_length_error": {
        "uk": 'Мінімальна довжина ',
        "en": 'Minimum length ',
        "de": 'Minimal Lange '
    },
    "saved_succesfully": {
        "uk": "Збережено успішно",
        "en": "Saved successfully",
        "de": "Hat gespeichert"
    },
    "sure_delete": {
        "uk": "Видалити?",
        "en": "Delete?",
        "de": "Löschen?"
    },
    "login_error": {
        "uk": 'Мінімальна довжина 4 символи.',
        "en": 'Minimum length 4 symbols.',
        "de": 'Minimal Lange 4 Symbole.'
    },
    "password_error": {
        "uk": 'Мінімальна довжина 6 символів.',
        "en": 'Minimum length 6 symbols.',
        "de": 'Minimal Lange 6 Symbole.'
    },
    "login_regex": {
        "uk": 'Неправильний ввод.',
        "en": 'Incorrect input.',
        "de": 'Falsche Eingabe.'
    },
    "required_error": {
        "uk": "Це поле обов'язкове.",
        "en": "This field is required.",
        "de": "Dieses Feld ist erforderlich."
    }
}

export function t(key){
    return gettext(translation, key);
}