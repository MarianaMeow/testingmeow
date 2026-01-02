import { CARD_LIBRARY } from "./data.js";

const elements = {
  roundLabel: document.getElementById("round-label"),
  turnLabel: document.getElementById("turn-label"),
  coinValue: document.getElementById("coin-value"),
  deckCount: document.getElementById("deck-count"),
  discardCount: document.getElementById("discard-count"),
  battleLog: document.getElementById("battle-log"),
  playerHand: document.getElementById("player-hand"),
  enemyHand: document.getElementById("enemy-hand"),
  playerFighters: document.getElementById("player-fc-row"),
  enemyFighters: document.getElementById("enemy-fc-row"),
  playerSupports: document.getElementById("player-supports"),
  enemySupports: document.getElementById("enemy-supports"),
  basicBtn: document.getElementById("basic-skill-btn"),
  ultimateBtn: document.getElementById("ultimate-skill-btn"),
  switchBtn: document.getElementById("switch-btn"),
  endTurnBtn: document.getElementById("end-turn-btn"),
  roundOverlay: document.getElementById("round-overlay"),
  roundMessage: document.getElementById("round-message"),
  gameOverOverlay: document.getElementById("gameover-overlay"),
  gameOverTitle: document.getElementById("gameover-title"),
  gameOverSub: document.getElementById("gameover-sub")
};

export function updateTopBar(round, turn, coins) {
  if (elements.roundLabel) {
    elements.roundLabel.textContent = "Round " + round;
  }
  if (elements.turnLabel) {
    elements.turnLabel.textContent = turn === "player" ? "Player Turn" : "Enemy Turn";
  }
  if (elements.coinValue) {
    elements.coinValue.textContent = coins.toLocaleString();
  }
}

export function updateDeckCounts(deckSize, discardSize) {
  if (elements.deckCount) {
    elements.deckCount.textContent = deckSize;
  }
  if (elements.discardCount) {
    elements.discardCount.textContent = discardSize;
  }
}

export function renderFighterRow(container, fighters, activeIndex, selectableIndexes = []) {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  fighters.forEach((fighter, index) => {
    const slot = document.createElement("div");
    slot.className = "fc-slot";
    if (index === activeIndex) {
      slot.classList.add("active");
    }
    if (fighter.exhausted) {
      slot.classList.add("exhausted");
    }
    if (fighter.defeated) {
      slot.classList.add("defeated");
    }
    if (selectableIndexes.includes(index)) {
      slot.classList.add("selectable");
    }
    slot.dataset.index = String(index);
    const statusBits = [];
    if (fighter.exhausted) {
      statusBits.push("Exhausted");
    }
    if (fighter.cooldown > 0) {
      statusBits.push("CD " + fighter.cooldown);
    }
    if (fighter.defeated) {
      statusBits.push("Defeated");
    }
    slot.innerHTML =
      "<div class=\"fc-badge\">" + (index === activeIndex ? "Active" : "Standby") + "</div>" +
      "<div class=\"fc-name\">" + fighter.name + "</div>" +
      "<div class=\"fc-hp\">HP " + fighter.hp + "/" + fighter.maxHp + "</div>" +
      "<div class=\"fc-status\">" + statusBits.join(" ") + "</div>";
    container.appendChild(slot);
  });
}

export function renderSupports(container, supports) {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  supports.forEach((support) => {
    const chip = document.createElement("div");
    chip.className = "support-chip";
    chip.textContent = support.name + " (" + support.duration + ")";
    container.appendChild(chip);
  });
}

export function renderPlayerHand(hand, selectedIndex, isSelecting) {
  if (!elements.playerHand) {
    return;
  }
  elements.playerHand.classList.toggle("selecting", Boolean(isSelecting));
  elements.playerHand.innerHTML = "";
  hand.forEach((cardId, index) => {
    const card = CARD_LIBRARY[cardId];
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    if (selectedIndex === index) {
      cardEl.classList.add("selected");
    }
    cardEl.dataset.index = String(index);
    cardEl.dataset.cardId = cardId;
    cardEl.innerHTML =
      "<div class=\"card-title\">" + card.name + "</div>" +
      "<div class=\"card-type\">" + card.type + "</div>" +
      "<div class=\"card-text\">Placeholder text</div>";
    elements.playerHand.appendChild(cardEl);
  });
}

export function renderEnemyHand(count) {
  if (!elements.enemyHand) {
    return;
  }
  elements.enemyHand.innerHTML = "";
  const visible = Math.min(count, 5);
  for (let i = 0; i < visible; i += 1) {
    const cardBack = document.createElement("div");
    cardBack.className = "card-back";
    elements.enemyHand.appendChild(cardBack);
  }
}

export function logMessage(message) {
  if (!elements.battleLog) {
    return;
  }
  if (!elements.battleLog.childElementCount) {
    elements.battleLog.innerHTML = "";
  }
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = message;
  elements.battleLog.appendChild(entry);
  elements.battleLog.scrollTop = elements.battleLog.scrollHeight;
}

export function clearLog() {
  if (elements.battleLog) {
    elements.battleLog.innerHTML = "";
  }
}

export function setActionButtons({ canBasic, canUltimate, canSwitch, canEnd }) {
  if (elements.basicBtn) {
    elements.basicBtn.disabled = !canBasic;
  }
  if (elements.ultimateBtn) {
    elements.ultimateBtn.disabled = !canUltimate;
  }
  if (elements.switchBtn) {
    elements.switchBtn.disabled = !canSwitch;
  }
  if (elements.endTurnBtn) {
    elements.endTurnBtn.disabled = !canEnd;
  }
}

export function showRoundOverlay(message) {
  if (elements.roundMessage && message) {
    elements.roundMessage.textContent = message;
  }
  if (elements.roundOverlay) {
    elements.roundOverlay.classList.add("active");
  }
}

export function hideRoundOverlay() {
  if (elements.roundOverlay) {
    elements.roundOverlay.classList.remove("active");
  }
}

export function showGameOver(title, subtitle) {
  if (elements.gameOverTitle && title) {
    elements.gameOverTitle.textContent = title;
  }
  if (elements.gameOverSub && subtitle) {
    elements.gameOverSub.textContent = subtitle;
  }
  if (elements.gameOverOverlay) {
    elements.gameOverOverlay.classList.add("active");
  }
}

export function hideGameOver() {
  if (elements.gameOverOverlay) {
    elements.gameOverOverlay.classList.remove("active");
  }
}
