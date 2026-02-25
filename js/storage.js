/**
 * storage.js — localStorage wrapper with safe fallback
 */

const PREFIX = 'pf-';

function isAvailable() {
    try {
        const key = '__storage_test__';
        localStorage.setItem(key, '1');
        localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

const available = isAvailable();

export function get(key) {
    if (!available) return null;
    try {
        return localStorage.getItem(PREFIX + key);
    } catch {
        return null;
    }
}

export function set(key, value) {
    if (!available) return;
    try {
        localStorage.setItem(PREFIX + key, value);
    } catch {
        // quota exceeded or other error — silently fail
    }
}

export function remove(key) {
    if (!available) return;
    try {
        localStorage.removeItem(PREFIX + key);
    } catch {
        // silently fail
    }
}
