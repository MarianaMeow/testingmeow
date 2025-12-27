export const state = {
  turn: "player",
  round: 1,
  maxEnergy: 3,
  maxHand: 7,
  player: null,
  enemy: null
};

export const elements = {
  menuOverlay: document.getElementById("menu-overlay"),
  setupOverlay: document.getElementById("setup-overlay"),
  endOverlay: document.getElementById("end-overlay"),
  endTitle: document.getElementById("end-title"),
  endText: document.getElementById("end-text"),
  singlePlayerBtn: document.getElementById("single-player-btn"),
  twoPlayerBtn: document.getElementById("two-player-btn"),
  roundBadge: document.getElementById("round-badge"),
  phaseBadge: document.getElementById("phase-badge"),
  energyPips: document.getElementById("energy-pips"),
  enemyHouse: document.getElementById("enemy-house"),
  enemyName: document.getElementById("enemy-name"),
  enemyHp: document.getElementById("enemy-hp"),
  enemyHpMax: document.getElementById("enemy-hp-max"),
  enemyHpFill: document.getElementById("enemy-hp-fill"),
  enemyEffects: document.getElementById("enemy-effects"),
  playerHouse: document.getElementById("player-house"),
  playerName: document.getElementById("player-name"),
  playerHp: document.getElementById("player-hp"),
  playerHpMax: document.getElementById("player-hp-max"),
  playerHpFill: document.getElementById("player-hp-fill"),
  playerEffects: document.getElementById("player-effects"),
  enemyHand: document.getElementById("enemy-hand"),
  hand: document.getElementById("hand"),
  enemyPlayed: document.getElementById("enemy-played"),
  playerPlayed: document.getElementById("player-played"),
  battleLog: document.getElementById("battle-log"),
  endTurnBtn: document.getElementById("end-turn-btn"),
  deckCount: document.getElementById("deck-count"),
  discardCount: document.getElementById("discard-count"),
  restartBtn: document.getElementById("restart-btn")
};

export function resetState() {
  state.turn = "player";
  state.round = 1;
  state.player = null;
  state.enemy = null;
}
