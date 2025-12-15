// ========================================
// SESSION STORAGE PROGRESS SYSTEM
// Progress is cleared when tab/browser is closed
// ========================================
const STORAGE_KEY = 'astralExpressProgress';

export function saveProgress(gameState) {
    const progress = {
        unlockedPlanets: [],
        completedTrials: {
            belobog1: gameState.trial1Complete,
            belobog2: gameState.trial2Complete,
            belobog3: gameState.trial3Complete
        },
        penaconyShards: gameState.problemsSolved,
        xianzhouRedShardText: document.getElementById('xianzhou-red-shard')?.getAttribute('data-memory') || '',
        jariloCollectedPieces: gameState.collectedCount,
        penaconyTicketReady: gameState.penaconyTicketReady || false,
        collectedKeys: gameState.collectedKeys || {
            belobog: false,
            xianzhou: false,
            penacony: false,
            jarilo: false,
            herta: false,
            luofu: false,
            stellaron: false,
            terminus: false
        }
    };

    // Collect unlocked planets
    document.querySelectorAll('.planet-option.unlocked').forEach(planet => {
        const planetKey = planet.getAttribute('data-planet');
        if (planetKey) progress.unlockedPlanets.push(planetKey);
    });

    // Use sessionStorage instead of localStorage
    // This clears when the tab/browser is closed
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadProgress() {
    // Load from sessionStorage (cleared on tab close)
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load progress:', e);
        return null;
    }
}

export function applyProgress(progress, gameState) {
    if (!progress) return;

    // Unlock planets
    (progress.unlockedPlanets || []).forEach(planetKey => {
        const planet = document.querySelector(`.planet-option[data-planet="${planetKey}"]`);
        if (planet) {
            planet.classList.remove('locked');
            planet.classList.add('unlocked');
        }
    });

    // Restore Belobog trials
    if (progress.completedTrials) {
        gameState.trial1Complete = progress.completedTrials.belobog1 || false;
        gameState.trial2Complete = progress.completedTrials.belobog2 || false;
        gameState.trial3Complete = progress.completedTrials.belobog3 || false;

        if (gameState.trial1Complete && gameState.trial2Complete && gameState.trial3Complete) {
            const statusEl = document.getElementById('belobog-mission-status');
            if (statusEl) {
                statusEl.textContent = 'Complete — All trials cleared.';
                statusEl.classList.remove('status-pending');
                statusEl.classList.add('status-complete');
            }
            const belobogMissionPill = document.getElementById('belobog-mission-pill');
            if (belobogMissionPill) {
                belobogMissionPill.textContent = 'Complete';
                belobogMissionPill.classList.remove('mission-pill-pending');
                belobogMissionPill.classList.add('mission-pill-complete');
            }
        }
    }

    // Restore Penacony shards
    if (progress.penaconyShards) {
        gameState.problemsSolved = progress.penaconyShards;
        for (let i = 1; i <= progress.penaconyShards; i++) {
            const shard = document.getElementById(`shard-${i}`);
            if (shard) {
                shard.classList.remove('locked');
                shard.classList.add('collected');
            }
        }
    }

    // Restore Xianzhou red shard
    if (progress.xianzhouRedShardText) {
        const redShard = document.getElementById('xianzhou-red-shard');
        if (redShard) {
            redShard.setAttribute('data-memory', progress.xianzhouRedShardText);
            redShard.setAttribute('data-active', 'true');
        }
    }

    // Restore Jarilo puzzle progress
    if (progress.jariloCollectedPieces) {
        gameState.collectedCount = progress.jariloCollectedPieces;
        const piecesCollectedEl = document.getElementById('pieces-collected');
        if (piecesCollectedEl) {
            piecesCollectedEl.textContent = gameState.collectedCount;
        }
    }

    // Restore collected keys
    if (progress.collectedKeys) {
        Object.assign(gameState.collectedKeys, progress.collectedKeys);
    }

    if (typeof progress.penaconyTicketReady === 'boolean') {
        gameState.penaconyTicketReady = progress.penaconyTicketReady;
        
        // If penacony ticket is ready, unlock the penacony planet
        if (gameState.penaconyTicketReady) {
            const penaconyOrb = document.querySelector('.planet-option[data-planet="penacony"]');
            if (penaconyOrb) {
                penaconyOrb.classList.remove('locked');
                penaconyOrb.classList.add('unlocked');
            }
        }
    }
}

export function clearProgress() {
    sessionStorage.removeItem(STORAGE_KEY);
}
