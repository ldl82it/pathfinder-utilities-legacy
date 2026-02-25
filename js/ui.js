/**
 * ui.js — DOM rendering & interaction (vanilla JS)
 * Uses data-hook/data-action selectors exclusively.
 * Uses textContent for calculated outputs (never innerHTML).
 */

import { calcRow, calcTotals, validateInput, isEasterEgg } from './calc.js';
import { t, getLang, setLang, switchLang, applyLang, formatNumber } from './i18n.js';
import * as storage from './storage.js';

// ==========================================
// DOM QUERY HELPERS
// ==========================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const hook = (name, ctx) => $(`[data-hook="${name}"]`, ctx);
const hooks = (name, ctx) => $$(`[data-hook="${name}"]`, ctx);
const action = (name, ctx) => $(`[data-action="${name}"]`, ctx);

// ==========================================
// SCROLL ROW MANAGEMENT
// ==========================================

/** Get all scroll row elements */
function getRows() {
    return hooks('scroll-row');
}

/** Get the template row (first one) */
function getTemplateRow() {
    return hook('scroll-row');
}

/**
 * Read input values from a row.
 * @param {HTMLElement} row
 * @returns {{ caster: string, spell: string, quantity: string }}
 */
function readRowInputs(row) {
    return {
        caster: hook('caster-input', row)?.value ?? '',
        spell: hook('spell-input', row)?.value ?? '',
        quantity: hook('quantity-input', row)?.value ?? '1',
    };
}

/**
 * Write calculated output to a row using textContent (safe).
 * Preserves the unit <span> inside partial-value.
 */
function writeRowOutputs(row, result) {
    const costEl = hook('partial-cost', row);
    const timeEl = hook('partial-time', row);
    const timeEffEl = hook('partial-time-effective', row);

    if (costEl) {
        // Replace only the text node, preserve child <span class="partial-unit">
        setTextNodeValue(costEl, formatNumber(result.cost, result.cost % 1 === 0 ? 0 : 1));
    }
    if (timeEl) {
        setTextNodeValue(timeEl, formatNumber(result.theoreticalHours, result.theoreticalHours % 1 === 0 ? 0 : 1));
    }
    if (timeEffEl) {
        timeEffEl.textContent = result.effectiveHours;
    }
}

/**
 * Reset a row's outputs to zero.
 */
function resetRowOutputs(row) {
    const costEl = hook('partial-cost', row);
    const timeEl = hook('partial-time', row);
    const timeEffEl = hook('partial-time-effective', row);

    if (costEl) setTextNodeValue(costEl, 0);
    if (timeEl) setTextNodeValue(timeEl, 0);
    if (timeEffEl) timeEffEl.textContent = '';
}

/**
 * Safely set only the first text node of an element,
 * preserving child elements (like <span class="partial-unit">).
 */
function setTextNodeValue(el, value) {
    const textNode = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
        textNode.textContent = value;
    } else {
        // No text node exists — insert one before the first child
        el.insertBefore(document.createTextNode(value), el.firstChild);
    }
}

/**
 * Clone the template row and append it.
 * @returns {HTMLElement} the new row
 */
function addRow() {
    const rows = getRows();
    const template = rows[rows.length - 1]; // clone from last
    const clone = template.cloneNode(true);
    const newIndex = rows.length;

    // Update IDs for legacy compatibility
    clone.id = 'sezionePerg-' + newIndex;

    // Update input IDs and label associations for a11y (must be unique)
    const idMap = [
        { input: 'caster-input', prefix: 'caster-' },
        { input: 'spell-input', prefix: 'spell-' },
        { input: 'quantity-input', prefix: 'quantity-' },
    ];

    for (const { input, prefix } of idMap) {
        const el = hook(input, clone);
        if (el) {
            const newId = prefix + newIndex;
            el.id = newId;
            // Find the associated label (works regardless of which row was cloned)
            const label = clone.querySelector(`label[for^="${prefix}"]`);
            if (label) label.setAttribute('for', newId);
        }
    }

    // Update scribing speed label id and aria-labelledby
    const scribingLabel = clone.querySelector('[id^="scribingLabel-"]');
    if (scribingLabel) {
        const newLabelId = 'scribingLabel-' + newIndex;
        scribingLabel.id = newLabelId;
        const readonlyDiv = clone.querySelector('[aria-labelledby^="scribingLabel-"]');
        if (readonlyDiv) readonlyDiv.setAttribute('aria-labelledby', newLabelId);
    }

    // Reset inputs
    hook('caster-input', clone).value = '';
    hook('spell-input', clone).value = '';
    hook('quantity-input', clone).value = '1';

    // Reset outputs
    resetRowOutputs(clone);

    // Insert after the last row
    template.after(clone);

    // Apply current language translations to the cloned row
    applyLang(clone);

    // Hide the clone button on the previous-to-last row (legacy behavior)
    const cloneBtn = action('clone-row', template);
    if (cloneBtn) cloneBtn.classList.add('hidden');

    return clone;
}

/**
 * Remove the last non-template row.
 */
function removeLastRow() {
    const rows = getRows();
    if (rows.length <= 1) return; // never remove the template

    const lastRow = rows[rows.length - 1];
    lastRow.remove();

    // Re-show the clone button on the new last row
    const newRows = getRows();
    const newLast = newRows[newRows.length - 1];
    const cloneBtn = action('clone-row', newLast);
    if (cloneBtn) cloneBtn.classList.remove('hidden');
}

/**
 * Remove a specific row.
 */
function removeRow(row) {
    const rows = getRows();
    if (rows.length <= 1) return;

    row.remove();

    const newRows = getRows();
    const newLast = newRows[newRows.length - 1];
    const cloneBtn = action('clone-row', newLast);
    if (cloneBtn) cloneBtn.classList.remove('hidden');
}

// ==========================================
// TOTALS RENDERING
// ==========================================

function writeTotals(totalCost, totalHours) {
    const costEl = hook('total-cost');
    const timeEl = hook('total-time');
    const costMobileEl = hook('total-cost-mobile');
    const timeMobileEl = hook('total-time-mobile');

    const fmtCost = formatNumber(totalCost, totalCost % 1 === 0 ? 0 : 1);
    const fmtTime = totalHours + ' ' + t('unitTotalTime');

    if (costEl) costEl.textContent = fmtCost;
    if (timeEl) timeEl.textContent = fmtTime;
    if (costMobileEl) costMobileEl.textContent = fmtCost;
    if (timeMobileEl) timeMobileEl.textContent = fmtTime;
}

function resetTotals() {
    writeTotals(0, 0);
}

// ==========================================
// UI STATE
// ==========================================

function updateResetButton() {
    const resetBtn = action('reset');
    if (!resetBtn) return;

    const rows = getRows();
    const hasMultipleRows = rows.length > 1;

    let hasCalculated = false;
    for (const row of rows) {
        const costEl = hook('partial-cost', row);
        if (costEl) {
            const textNode = [...costEl.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
            const val = textNode ? textNode.textContent.trim() : '0';
            if (val !== '' && val !== '0') {
                hasCalculated = true;
                break;
            }
        }
    }

    if (hasCalculated || hasMultipleRows) {
        resetBtn.classList.remove('btn-disabled');
        resetBtn.disabled = false;
    } else {
        resetBtn.classList.add('btn-disabled');
        resetBtn.disabled = true;
    }
}

function updateRemoveButton() {
    const removeBtn = action('remove-last-row');
    if (!removeBtn) return;

    const rows = getRows();
    removeBtn.style.display = rows.length > 1 ? 'flex' : 'none';
}

// ==========================================
// CALCULATE
// ==========================================

function runCalculation() {
    const rows = getRows();
    const results = [];
    let hasErrors = false;

    for (const row of rows) {
        const inputs = readRowInputs(row);

        // Validate
        const vCaster = validateInput('caster', inputs.caster);
        const vSpell = validateInput('spell', inputs.spell);
        const vQuantity = validateInput('quantity', inputs.quantity);

        // Mark errors on inputs
        hook('caster-input', row)?.classList.toggle('errorBox', !vCaster.valid);
        hook('spell-input', row)?.classList.toggle('errorBox', !vSpell.valid);
        hook('quantity-input', row)?.classList.toggle('errorBox', !vQuantity.valid);

        if (!vCaster.valid || !vSpell.valid || !vQuantity.valid) {
            hasErrors = true;
            continue;
        }

        // Clear errors
        hook('caster-input', row)?.classList.remove('errorBox');
        hook('spell-input', row)?.classList.remove('errorBox');
        hook('quantity-input', row)?.classList.remove('errorBox');

        // Calculate
        const result = calcRow(vCaster.value, vSpell.value, vQuantity.value);
        writeRowOutputs(row, result);
        results.push(result);

        // Easter egg
        if (isEasterEgg(vCaster.value, vSpell.value, vQuantity.value)) {
            const audio = hook('easter-egg-audio');
            if (audio) audio.play().catch(() => { });
        }
    }

    if (hasErrors) {
        showAlert(results.length === 0 ? 'invalid' : 'too_high');
    }

    // Totals
    const totals = calcTotals(results);
    writeTotals(totals.totalCost, totals.totalHours);
    updateResetButton();
}

// ==========================================
// ALERTS
// ==========================================

function showAlert(type) {
    const modal = hook('alert-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    // Show the right message
    const invalidMsg = modal.querySelector('.invalidInput');
    const tooHighMsg = modal.querySelector('.lvlSpellAlto');
    if (invalidMsg) invalidMsg.classList.toggle('hidden', type !== 'invalid');
    if (tooHighMsg) tooHighMsg.classList.toggle('hidden', type !== 'too_high');
}

function dismissAlert() {
    const modal = hook('alert-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.querySelectorAll('.testoAlert').forEach(el => el.classList.add('hidden'));
    // NON resettare righe, input o totali — l'utente corregge e ricalcola
}

function resetAllRows() {
    const rows = getRows();

    // Remove all except template
    for (let i = rows.length - 1; i > 0; i--) {
        rows[i].remove();
    }

    // Reset template
    const template = getTemplateRow();
    if (template) {
        hook('caster-input', template).value = '';
        hook('spell-input', template).value = '';
        hook('quantity-input', template).value = '1';
        resetRowOutputs(template);

        const cloneBtn = action('clone-row', template);
        if (cloneBtn) cloneBtn.classList.remove('hidden');
    }
}

// ==========================================
// NOTES PANEL
// ==========================================

function openNotes() {
    const panel = hook('notes-panel');
    if (panel) panel.classList.add('noteVisibili');
    document.body.classList.add('oscurato');
    document.documentElement.classList.add('noScroll');
}

function closeNotes() {
    const panel = hook('notes-panel');
    if (panel) panel.classList.remove('noteVisibili');
    document.body.classList.remove('oscurato');
    document.documentElement.classList.remove('noScroll');
}

// ==========================================
// THEME TOGGLE
// ==========================================

function initTheme() {
    const saved = storage.get('theme');
    if (saved === 'dark') {
        enableDark();
    } else if (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        enableDark();
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        disableDark();
    } else {
        enableDark();
    }
}

function enableDark() {
    document.body.classList.add('dark-theme');
    const icon = action('toggle-theme')?.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'light_mode';
    storage.set('theme', 'dark');
}

function disableDark() {
    document.body.classList.remove('dark-theme');
    const icon = action('toggle-theme')?.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = 'dark_mode';
    storage.set('theme', 'light');
}

// ==========================================
// LANGUAGE TOGGLE
// ==========================================

function initLang() {
    const saved = storage.get('lang');
    if (saved && (saved === 'it' || saved === 'en')) {
        switchLang(saved);
        updateLangButtons(saved);
    }
    // If no saved preference, keep default (IT from HTML)
}

function setLanguage(lang) {
    switchLang(lang);
    updateLangButtons(lang);
    storage.set('lang', lang);

    // Re-apply translations to cloned rows (they were cloned with old lang)
    // applyLang() already handles all [data-i18n] in the document

    // Update dynamic values that include units (totals)
    // Re-run totals rendering with current values
    refreshTotalsDisplay();
}

function updateLangButtons(lang) {
    const toggle = hook('lang-toggle');
    if (!toggle) return;

    const buttons = toggle.querySelectorAll('[data-action="set-lang"]');
    for (const btn of buttons) {
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

/**
 * Re-render totals with current language units.
 * Reads current values from DOM and re-writes with correct unit text.
 */
function refreshTotalsDisplay() {
    const timeEl = hook('total-time');
    if (timeEl) {
        const currentText = timeEl.textContent.trim();
        // Extract number: everything before the last space + unit
        const parts = currentText.split(' ');
        const numStr = parts[0] || '0';
        // Parse back: remove thousand separators, normalize decimal
        const normalized = numStr.replace(/[.,](?=\d{3})/g, '').replace(',', '.');
        const num = parseFloat(normalized) || 0;
        timeEl.textContent = num + ' ' + t('unitTotalTime');
    }

    const timeMobileEl = hook('total-time-mobile');
    if (timeMobileEl) {
        const currentText = timeMobileEl.textContent.trim();
        const parts = currentText.split(' ');
        const numStr = parts[0] || '0';
        const normalized = numStr.replace(/[.,](?=\d{3})/g, '').replace(',', '.');
        const num = parseFloat(normalized) || 0;
        timeMobileEl.textContent = num + ' ' + t('unitTotalTime');
    }
}

// ==========================================
// VIBRATION (mobile)
// ==========================================

function vibrate() {
    if (window.innerWidth < 500 && navigator.vibrate) {
        navigator.vibrate(200);
    }
}

// ==========================================
// EVENT BINDING (delegation)
// ==========================================

export function init() {
    // Theme (apply immediately, before render)
    initTheme();
    initLang();

    // Single delegated listener on document for all data-action clicks
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const actionName = target.dataset.action;

        switch (actionName) {
            case 'calculate':
                vibrate();
                runCalculation();
                break;

            case 'add-row':
                vibrate();
                addRow();
                resetTotals();
                updateResetButton();
                updateRemoveButton();
                break;

            case 'clone-row':
                vibrate();
                addRow();
                resetTotals();
                updateResetButton();
                updateRemoveButton();
                break;

            case 'delete-row': {
                const row = target.closest('[data-hook="scroll-row"]');
                if (row) {
                    vibrate();
                    removeRow(row);
                    resetTotals();
                    updateResetButton();
                    updateRemoveButton();
                }
                break;
            }

            case 'remove-last-row':
                vibrate();
                removeLastRow();
                resetTotals();
                updateResetButton();
                updateRemoveButton();
                break;

            case 'reset':
                vibrate();
                resetAllRows();
                resetTotals();
                updateResetButton();
                updateRemoveButton();
                break;

            case 'dismiss-alert':
                vibrate();
                dismissAlert();
                updateResetButton();
                updateRemoveButton();
                break;

            case 'open-notes':
                openNotes();
                break;

            case 'close-notes':
                closeNotes();
                break;

            case 'toggle-theme':
                toggleTheme();
                break;

            case 'set-lang': {
                const lang = target.dataset.lang;
                if (lang) {
                    setLanguage(lang);
                }
                break;
            }
        }
    });

    // Close notes on backdrop click
    document.addEventListener('click', (e) => {
        if (document.body.classList.contains('oscurato') &&
            !e.target.closest('[data-hook="notes-panel"]') &&
            !e.target.closest('[data-action="open-notes"]')) {
            closeNotes();
        }
    });

    // Clear error on input
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('errorBox')) {
            e.target.classList.remove('errorBox');
        }
    });

    // Prevent form submission (Enter key in inputs)
    const form = hook('scroll-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Trigger calculation on Enter
            runCalculation();
        });
    }

    // Initial UI state
    updateResetButton();
    updateRemoveButton();
}
