/**
 * i18n.js — Internationalisation dictionary + formatters
 * Single source of truth for all UI strings.
 */

const dict = {
    it: {
        // Card header
        cardTitle: 'Trascrizione Pergamene',
        cardSubtitle: 'Configura parametri arcani',

        // Labels
        casterLevel: 'Livello Incantatore',
        spellLevel: 'Livello Incantesimo',
        scribingSpeed: 'Velocità scrittura',
        scribingSpeedMeta: '(ore/giorno)',
        quantity: 'N Pergamene',

        // Helpers
        casterHelper: 'Livello 1/20',
        spellHelper: '0 - 9',

        // Partials
        partialCost: 'Costo parziale',
        partialTime: 'Tempo parziale',
        unitCost: 'MO',
        unitTime: 'Ore',

        // Summary
        totalCostTitle: 'Costo Totale',
        totalTimeLabel: 'TEMPO DI CREAZIONE TOTALE',
        totalTimeShort: 'Ore Totali',
        unitTotalTime: 'Ore',
        currency: 'MO',

        // Buttons
        calculate: 'Calcola',
        addScroll: 'Aggiungi altra pergamena',
        removeScroll: 'Rimuovi pergamena',
        reset: 'Resetta Calcolatore',

        // Footer info
        footerInfo: 'Regolamento standard Pathfinder.',
        copyright: '© 2026 Pathfinder Utilities. Realizzato per il mago esigente.',
        backToApp: '← Torna al calcolatore',

        // Notes panel
        notesTitle: 'NOTE E REGOLAMENTO',
        notesBody: 'La creazione di un oggetto richiede 8 ore di lavoro per 1.000 mo del prezzo base dell\'oggetto (o frazione di esso), con un minimo di almeno 8 ore. Pozioni e pergamene sono un\'eccezione a questa regola; possono impiegare solo 2 ore per essere creati (se il loro prezzo base è 250 mo o meno). Pergamene e pozioni il cui prezzo base è superiore a 250 mo, ma inferiore a 1.000 mo, richiedono 8 ore per essere create, proprio come qualsiasi altro oggetto magico.',
        notesLink: 'CREAZIONE OGGETTI MAGICI',

        // Alerts
        alertTitle: 'TI HO VISTO',
        alertInvalid: 'Input non validi',
        alertTooHigh: 'Non esagerare con i livelli e le pergamene!',

        // Number formatting
        decimalSep: ',',
        thousandSep: '.',
    },
    en: {
        cardTitle: 'Scroll Transcription',
        cardSubtitle: 'Configure arcane parameters',

        casterLevel: 'Caster Level',
        spellLevel: 'Spell Level',
        scribingSpeed: 'Scribing Speed',
        scribingSpeedMeta: '(hours/day)',
        quantity: 'N Scrolls',

        casterHelper: 'Level 1/20',
        spellHelper: '0 - 9',

        partialCost: 'Partial Cost',
        partialTime: 'Partial Time',
        unitCost: 'GP',
        unitTime: 'Hours',

        totalCostTitle: 'Total Cost',
        totalTimeLabel: 'TOTAL CREATION TIME',
        totalTimeShort: 'Total Hours',
        unitTotalTime: 'Hours',
        currency: 'GP',

        calculate: 'Calculate',
        addScroll: 'Add Another Scroll',
        removeScroll: 'Remove Scroll',
        reset: 'Reset Calculator',

        footerInfo: 'Standard Pathfinder rules.',
        copyright: '© 2026 Pathfinder Utilities. Made for the demanding wizard.',
        backToApp: '← Back to calculator',


        notesTitle: 'NOTES & RULES',
        notesBody: 'Creating a magic item requires 8 hours of work per 1,000 gp in the item\'s base price (or fraction thereof), with a minimum of at least 8 hours. Potions and scrolls are an exception to this rule; they can take as little as 2 hours to create (if their base price is 250 gp or less). Scrolls and potions whose base price is more than 250 gp, but less than 1,000 gp, take 8 hours to create, just like any other magic item.',
        notesLink: 'MAGIC ITEM CREATION',

        alertTitle: 'I SAW THAT',
        alertInvalid: 'Invalid inputs',
        alertTooHigh: 'Don\'t go overboard with levels and scrolls!',

        decimalSep: '.',
        thousandSep: ',',
    }
};

let currentLang = 'it';

/**
 * Set active language.
 * @param {'it'|'en'} lang
 */
export function setLang(lang) {
    if (dict[lang]) currentLang = lang;
}

/**
 * Get current language.
 * @returns {'it'|'en'}
 */
export function getLang() {
    return currentLang;
}

/**
 * Get a translated string.
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
    return dict[currentLang]?.[key] ?? dict['it']?.[key] ?? key;
}

/**
 * Apply translations to all elements with data-i18n attribute.
 * Scans the entire document (or a subtree) and sets textContent.
 * @param {HTMLElement} [root=document] - Root element to scan
 */
export function applyLang(root = document) {
    const elements = root.querySelectorAll('[data-i18n]');
    for (const el of elements) {
        const key = el.dataset.i18n;
        const translated = t(key);

        // Check if element has child elements we need to preserve
        // (like icons inside buttons, or unit spans inside values)
        const hasChildElements = el.querySelector('*') !== null;

        if (hasChildElements) {
            // Only replace text nodes, preserve child elements
            for (const node of el.childNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                    node.textContent = translated;
                    break; // only replace the first meaningful text node
                }
            }
        } else {
            // Simple element — just set textContent
            el.textContent = translated;
        }
    }
}

/**
 * Switch language, apply to DOM, update <html lang>, and return new lang.
 * @param {'it'|'en'} lang
 */
export function switchLang(lang) {
    setLang(lang);
    applyLang();
    document.documentElement.lang = lang;
}

/**
 * Format a number per current locale.
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatNumber(value, decimals = 0) {
    if (isNaN(value)) return '0';
    const fixed = value.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const sep = dict[currentLang].thousandSep;
    const dec = dict[currentLang].decimalSep;
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return decPart ? formatted + dec + decPart : formatted;
}
