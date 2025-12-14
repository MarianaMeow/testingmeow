import { collectedKeys } from './state.js';
import { initEnhancements } from './enhancements.js';

document.addEventListener('DOMContentLoaded', () => {
    initEnhancements();
    initMainMenu();
});

function initMainMenu() {
    const mapStand = document.getElementById('map-stand');
    const logStand = document.getElementById('log-stand');
    const invStand = document.getElementById('inv-stand');

    if (mapStand) {
        mapStand.addEventListener('click', () => {
            window.location.href = 'planet-selection.html';
        });
    }

    if (logStand) {
        logStand.addEventListener('click', () => {
            showMissionLog();
        });
    }

    if (invStand) {
        invStand.addEventListener('click', () => {
            showInventory();
        });
    }
}

function showMissionLog() {
    let modal = document.getElementById('mission-log-modal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'mission-log-modal';
    modal.className = 'stand-modal';
    modal.innerHTML = `
        <div class="stand-modal-panel">
            <div class="stand-modal-header">
                <h2>📜 Mission Log</h2>
                <button class="close-stand-modal">✕</button>
            </div>
            <div class="stand-modal-content">
                <div class="mission-entry">
                    <div class="mission-title">🚂 Astral Express Journey</div>
                    <div class="mission-status">Status: <span class="status-active">In Progress</span></div>
                    <div class="mission-desc">
                        Travel across the universe, collecting keys from each world to unlock the path to Terminus.
                    </div>
                    <div class="mission-objectives">
                        <div class="objective-title">Objectives:</div>
                        ${Object.keys(collectedKeys).map(planet => `
                            <div class="objective-item ${collectedKeys[planet] ? 'complete' : ''}">
                                ${collectedKeys[planet] ? '✓' : '○'} Collect ${planet.charAt(0).toUpperCase() + planet.slice(1)} Key
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="mission-entry">
                    <div class="mission-title">🛰 Progress Summary</div>
                    <div class="progress-stats">
                        <div class="stat-item">
                            <span class="stat-label">Keys Collected:</span>
                            <span class="stat-value">${Object.values(collectedKeys).filter(v => v).length}/8</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.close-stand-modal').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    modal.classList.add('show');
}

function showInventory() {
    let modal = document.getElementById('inventory-modal');
    if (modal) modal.remove();
    
    const keyDescriptions = {
        belobog: { name: 'Belobog Candy Key', icon: '🍬' },
        xianzhou: { name: 'Xianzhou Memory Key', icon: '📜' },
        penacony: { name: 'Penacony Fortune Key', icon: '🎲' },
        jarilo: { name: 'Jarilo-VI Frozen Key', icon: '❄️' },
        herta: { name: 'Herta Dimension Key', icon: '🧊' },
        luofu: { name: 'Luofu Lotus Key', icon: '🌸' },
        stellaron: { name: 'Stellaron Key', icon: '⭐' },
        terminus: { name: 'Terminus Key', icon: '🚪' }
    };
    
    modal = document.createElement('div');
    modal.id = 'inventory-modal';
    modal.className = 'stand-modal';
    
    let keysHTML = Object.keys(collectedKeys).map(planet => {
        const isCollected = collectedKeys[planet];
        const keyInfo = keyDescriptions[planet];
        return `
            <div style="padding: 15px; background: ${isCollected ? 'rgba(255, 215, 0, 0.15)' : 'rgba(100, 100, 100, 0.1)'}; 
                 border: 2px solid ${isCollected ? '#ffd700' : '#666'}; border-radius: 10px; 
                 display: flex; gap: 15px; align-items: center; opacity: ${isCollected ? '1' : '0.5'}; margin-bottom: 10px;">
                <div style="font-size: 40px;">${keyInfo.icon}</div>
                <div style="flex: 1;">
                    <div style="color: ${isCollected ? '#ffd700' : '#666'}; font-weight: 700; margin-bottom: 5px;">${keyInfo.name}</div>
                    <div style="color: #9ca3af; font-size: 12px;">${isCollected ? '✓ Collected' : '🔒 Locked'}</div>
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="stand-modal-panel">
            <div class="stand-modal-header">
                <h2>🧳 Inventory</h2>
                <button class="close-stand-modal">✕</button>
            </div>
            <div class="stand-modal-content">
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 10px;">
                    <div style="color: #ffd700; font-size: 18px; font-weight: 700;">
                        Keys Collected: ${Object.values(collectedKeys).filter(v => v).length}/8
                    </div>
                </div>
                ${keysHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.close-stand-modal').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    modal.classList.add('show');
}