import './state.js';
import { initNavigation } from './navigation.js';
import { initWelcome } from './welcome.js';
import { initBelobogScene } from './scenes/belobog.js';
import { initXianzhouScene } from './scenes/xianzhou.js';
import { initPenaconyScene } from './scenes/penacony.js';
import { initJariloScene } from './scenes/jarilo.js';
import { initHertaScene } from './scenes/herta.js';
import { initLuofuScene } from './scenes/luofu.js';
import { initStellaronScene } from './scenes/stellaron.js';
import { initTerminusScene } from './scenes/terminus.js';
import { initEnhancements } from './enhancements.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initWelcome();
    initBelobogScene();
    initXianzhouScene();
    initPenaconyScene();
    initJariloScene();
    initHertaScene();
    initLuofuScene();
    initStellaronScene();
    initTerminusScene();
    initEnhancements();
});
