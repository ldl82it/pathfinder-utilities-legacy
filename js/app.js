/**
 * app.js — Application bootstrap
 * Single entry point. Imports modules and initialises the app.
 */

import { init as initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    initUI();
});
