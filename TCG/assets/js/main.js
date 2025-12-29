import {
  startMatch,
  chooseRoundAction,
  handleBasicSkill,
  handleUltimateSkill,
  handleSwitchAction,
  handleEndTurn,
  handlePlayerCardClick,
  handlePlayerFighterClick
} from "./engine.js";

const menuOverlay = document.getElementById("menu-overlay");
const houseOverlay = document.getElementById("house-overlay");
const singleBtn = document.getElementById("menu-single");
const basicBtn = document.getElementById("basic-skill-btn");
const ultimateBtn = document.getElementById("ultimate-skill-btn");
const switchBtn = document.getElementById("switch-btn");
const endTurnBtn = document.getElementById("end-turn-btn");
const roundSwitchBtn = document.getElementById("round-switch");
const roundRedrawBtn = document.getElementById("round-redraw");
const roundOverlay = document.getElementById("round-overlay");
const playerHand = document.getElementById("player-hand");
const playerFighters = document.getElementById("player-fc-row");
const gameoverOverlay = document.getElementById("gameover-overlay");
const gameoverMenuBtn = document.getElementById("gameover-menu");

function showHouseSelection() {
  if (menuOverlay) {
    menuOverlay.classList.remove("active");
  }
  if (houseOverlay) {
    houseOverlay.classList.add("active");
  }
  document.body.classList.remove("screen-menu");
  document.body.classList.add("screen-house");
}

function enterBattle(houseKey) {
  if (houseOverlay) {
    houseOverlay.classList.remove("active");
  }
  document.body.classList.remove("screen-house");
  startMatch(houseKey);
}

function returnToMenu() {
  if (gameoverOverlay) {
    gameoverOverlay.classList.remove("active");
  }
  if (roundOverlay) {
    roundOverlay.classList.remove("active");
  }
  if (houseOverlay) {
    houseOverlay.classList.remove("active");
  }
  if (menuOverlay) {
    menuOverlay.classList.add("active");
  }
  document.body.classList.add("screen-menu");
  document.body.classList.remove("screen-house");
}

if (singleBtn) {
  singleBtn.addEventListener("click", showHouseSelection);
}

document.querySelectorAll(".house-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const houseKey = button.dataset.house;
    if (!houseKey) {
      return;
    }
    enterBattle(houseKey);
  });
});

if (basicBtn) {
  basicBtn.addEventListener("click", handleBasicSkill);
}

if (ultimateBtn) {
  ultimateBtn.addEventListener("click", handleUltimateSkill);
}

if (switchBtn) {
  switchBtn.addEventListener("click", handleSwitchAction);
}

if (endTurnBtn) {
  endTurnBtn.addEventListener("click", handleEndTurn);
}

if (roundSwitchBtn) {
  roundSwitchBtn.addEventListener("click", () => chooseRoundAction("switch"));
}

if (roundRedrawBtn) {
  roundRedrawBtn.addEventListener("click", () => chooseRoundAction("redraw"));
}

if (playerHand) {
  playerHand.addEventListener("click", (event) => {
    const card = event.target.closest(".card");
    if (!card) {
      return;
    }
    const index = Number.parseInt(card.dataset.index, 10);
    if (!Number.isFinite(index)) {
      return;
    }
    handlePlayerCardClick(index);
  });
}

if (playerFighters) {
  playerFighters.addEventListener("click", (event) => {
    const slot = event.target.closest(".fc-slot");
    if (!slot) {
      return;
    }
    const index = Number.parseInt(slot.dataset.index, 10);
    if (!Number.isFinite(index)) {
      return;
    }
    handlePlayerFighterClick(index);
  });
}

if (gameoverMenuBtn) {
  gameoverMenuBtn.addEventListener("click", returnToMenu);
}
