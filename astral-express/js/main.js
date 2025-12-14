// Main entry point - imports will be added as pages are created
import { initWelcome } from './welcome.js';
import { initEnhancements } from './enhancements.js';

document.addEventListener('DOMContentLoaded', () => {
    initWelcome();
    initEnhancements();
});