/**
 * calc.js — Pure calculation functions (Pathfinder 1e scroll crafting)
 * Zero DOM dependencies. All functions are pure: input → output.
 */

/**
 * Calculate scroll crafting cost and time for a single row.
 * @param {number} casterLevel - Caster level (1–20)
 * @param {number} spellLevel  - Spell level (0–9, where 0 is treated as 0.5)
 * @param {number} quantity    - Number of scrolls (1–30)
 * @returns {{ cost: number, theoreticalHours: number, effectiveHours: number }}
 */
export function calcRow(casterLevel, spellLevel, quantity) {
    const effectiveSpellLevel = spellLevel === 0 ? 0.5 : spellLevel;
    const cost = 12.5 * casterLevel * effectiveSpellLevel * quantity;
    const theoreticalHours = cost / 125;

    let effectiveHours;
    if (cost <= 250) {
        effectiveHours = 2;
    } else if (cost < 1000) {
        effectiveHours = 8;
    } else {
        effectiveHours = Math.ceil(cost / 1000) * 8;
    }

    return { cost, theoreticalHours, effectiveHours };
}

/**
 * Sum totals from an array of row results.
 * @param {Array<{ cost: number, effectiveHours: number }>} rows
 * @returns {{ totalCost: number, totalHours: number }}
 */
export function calcTotals(rows) {
    let totalCost = 0;
    let totalHours = 0;
    for (const row of rows) {
        totalCost += row.cost;
        totalHours += row.effectiveHours;
    }
    return { totalCost, totalHours };
}

/**
 * Validate a single input value.
 * @param {string} name  - Field name ('caster' | 'spell' | 'quantity')
 * @param {*} rawValue   - The raw value from the input
 * @returns {{ valid: boolean, value: number, error: string|null }}
 */
export function validateInput(name, rawValue) {
    const num = Number(rawValue);

    if (rawValue === '' || rawValue === null || rawValue === undefined || isNaN(num)) {
        return { valid: false, value: 0, error: 'empty' };
    }

    switch (name) {
        case 'caster':
            if (num < 1 || num > 20) return { valid: false, value: num, error: 'out_of_range' };
            if (!Number.isInteger(num)) return { valid: false, value: num, error: 'not_integer' };
            return { valid: true, value: num, error: null };

        case 'spell':
            if (num < 0 || num > 9) return { valid: false, value: num, error: 'out_of_range' };
            if (!Number.isInteger(num)) return { valid: false, value: num, error: 'not_integer' };
            return { valid: true, value: num, error: null };

        case 'quantity':
            if (num < 1 || num > 30) return { valid: false, value: num, error: 'out_of_range' };
            if (!Number.isInteger(num)) return { valid: false, value: num, error: 'not_integer' };
            return { valid: true, value: num, error: null };

        default:
            return { valid: false, value: num, error: 'unknown_field' };
    }
}

/**
 * Check Easter Egg condition (all inputs = 7).
 */
export function isEasterEgg(caster, spell, quantity) {
    return caster === 7 && spell === 7 && quantity === 7;
}
