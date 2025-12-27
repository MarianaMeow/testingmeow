import { state, elements } from "./state.js";
import { CARD_LIBRARY, HOUSES } from "./data.js";

export function addLog(message) {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = message;
  elements.battleLog.appendChild(entry);
  const entries = elements.battleLog.querySelectorAll(".log-entry");
  if (entries.length > 10) {
    elements.battleLog.removeChild(entries[0]);
  }
  elements.battleLog.scrollTop = elements.battleLog.scrollHeight;
}

export function showPlayedCard(sideKey, card) {
  const slot = sideKey === "player" ? elements.playerPlayed : elements.enemyPlayed;
  slot.innerHTML = "";
  const name = document.createElement("div");
  name.className = "played-name";
  name.textContent = card.name;
  const meta = document.createElement("div");
  meta.className = "played-meta";
  meta.textContent = "Type: " + card.type + " | Cost: " + card.cost;
  slot.appendChild(name);
  slot.appendChild(meta);
  slot.classList.add("active");
}

export function clearPlayedCards() {
  elements.playerPlayed.textContent = "Your play";
  elements.enemyPlayed.textContent = "Enemy play";
  elements.playerPlayed.classList.remove("active");
  elements.enemyPlayed.classList.remove("active");
}

export function setPhase(phase) {
  elements.phaseBadge.textContent = phase;
}

export function showEndOverlay(victory) {
  elements.phaseBadge.textContent = victory ? "Victory" : "Defeat";
  elements.endTitle.textContent = victory ? "Victory" : "Defeat";
  elements.endText.textContent = victory
    ? "The throne is yours."
    : "Your banner falls in defeat.";
  elements.endOverlay.classList.add("active");
}

export function hideEndOverlay() {
  elements.endOverlay.classList.remove("active");
}

export function showMenuOverlay() {
  elements.menuOverlay.classList.add("active");
}

export function hideMenuOverlay() {
  elements.menuOverlay.classList.remove("active");
}

export function showSetupOverlay() {
  elements.setupOverlay.classList.add("active");
}

export function hideSetupOverlay() {
  elements.setupOverlay.classList.remove("active");
}

function updateEnergy() {
  elements.energyPips.innerHTML = "";
  for (let i = 0; i < state.maxEnergy; i += 1) {
    const pip = document.createElement("div");
    pip.className = "pip" + (i < state.player.energy ? " active" : "");
    elements.energyPips.appendChild(pip);
  }
}

function updateHealthBars() {
  elements.playerHp.textContent = state.player.hp;
  elements.playerHpMax.textContent = state.player.maxHp;
  elements.enemyHp.textContent = state.enemy.hp;
  elements.enemyHpMax.textContent = state.enemy.maxHp;
  elements.playerHpFill.style.width = (state.player.hp / state.player.maxHp) * 100 + "%";
  elements.enemyHpFill.style.width = (state.enemy.hp / state.enemy.maxHp) * 100 + "%";
}

function renderEffects(sideKey) {
  const unit = state[sideKey];
  const container = sideKey === "player" ? elements.playerEffects : elements.enemyEffects;
  container.innerHTML = "";
  if (unit.block > 0) {
    const block = document.createElement("div");
    block.className = "effect-tag";
    block.textContent = "Block " + unit.block;
    container.appendChild(block);
  }
  if (unit.effects.burn > 0) {
    const burn = document.createElement("div");
    burn.className = "effect-tag";
    burn.textContent = "Burn " + unit.effects.burn;
    container.appendChild(burn);
  }
  if (unit.attackPenalty > 0) {
    const weaken = document.createElement("div");
    weaken.className = "effect-tag";
    weaken.textContent = "Weaken " + unit.attackPenalty;
    container.appendChild(weaken);
  }
  if (unit.nextAttackBonus > 0) {
    const buff = document.createElement("div");
    buff.className = "effect-tag";
    buff.textContent = "Rally " + unit.nextAttackBonus;
    container.appendChild(buff);
  }
}

function renderHand(onPlayCard) {
  elements.hand.innerHTML = "";
  const total = state.player.hand.length;
  const mid = (total - 1) / 2;
  const maxAngle = Math.min(24, 6 + total * 2);
  state.player.hand.forEach((cardId, index) => {
    const card = CARD_LIBRARY[cardId];
    const cardBtn = document.createElement("button");
    cardBtn.className = "card " + card.type;
    cardBtn.style.animationDelay = (index * 0.05) + "s";
    if (total > 1) {
      const angle = ((index - mid) / mid) * maxAngle;
      const offset = -Math.abs(index - mid) * 10;
      cardBtn.style.setProperty("--card-rotate", angle.toFixed(2) + "deg");
      cardBtn.style.setProperty("--card-offset", offset.toFixed(2) + "px");
    }
    cardBtn.disabled = state.turn !== "player" || card.cost > state.player.energy;
    cardBtn.innerHTML =
      "<div class=\"card-cost\">" + card.cost + "</div>" +
      "<div class=\"card-title\">" + card.name + "</div>" +
      "<div class=\"card-type\">" + card.type + "</div>" +
      "<div class=\"card-text\">" + card.text + "</div>";
    if (onPlayCard) {
      cardBtn.addEventListener("click", () => {
        onPlayCard(index);
      });
    }
    elements.hand.appendChild(cardBtn);
  });
}

function renderEnemyHand() {
  elements.enemyHand.innerHTML = "";
  const total = state.enemy.hand.length;
  const mid = (total - 1) / 2;
  const maxAngle = Math.min(18, 4 + total * 2);
  state.enemy.hand.forEach((_, index) => {
    const cardBack = document.createElement("div");
    cardBack.className = "card-back";
    if (total > 1) {
      const angle = ((index - mid) / mid) * maxAngle;
      const offset = Math.abs(index - mid) * 8;
      cardBack.style.setProperty("--card-rotate", angle.toFixed(2) + "deg");
      cardBack.style.setProperty("--card-offset", offset.toFixed(2) + "px");
    }
    elements.enemyHand.appendChild(cardBack);
  });
}

export function updateUI(onPlayCard) {
  if (!state.player || !state.enemy) {
    return;
  }
  elements.roundBadge.textContent = "Round " + state.round;
  elements.playerHouse.textContent = "House " + HOUSES[state.player.houseKey].name;
  elements.playerName.textContent = state.player.name;
  elements.enemyHouse.textContent = "House " + HOUSES[state.enemy.houseKey].name;
  elements.enemyName.textContent = state.enemy.name;
  elements.deckCount.textContent = state.player.deck.length;
  elements.discardCount.textContent = state.player.discard.length;
  updateHealthBars();
  updateEnergy();
  renderEffects("player");
  renderEffects("enemy");
  renderEnemyHand();
  renderHand(onPlayCard);
}
