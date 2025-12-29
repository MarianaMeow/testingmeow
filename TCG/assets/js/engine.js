import { CARD_LIBRARY, HOUSES, STARTING_HAND_RULES, createSampleDeck } from "./data.js";
import { state, resetState } from "./state.js";
import { shuffle, validateDeck } from "./utils.js";
import {
  updateTopBar,
  updateDeckCounts,
  renderPlayerHand,
  renderEnemyHand,
  renderFighterRow,
  renderSupports,
  logMessage,
  clearLog,
  setActionButtons,
  showRoundOverlay,
  hideRoundOverlay,
  showGameOver,
  hideGameOver
} from "./ui.js";

const ROUND_COINS = 10000;
const SWITCH_COST = 400;
const BASIC_COST = 800;
const ULTIMATE_COST = 1600;
const BASIC_DAMAGE = 6;
const ULTIMATE_DAMAGE = 12;
const WEAPON_BONUS = 2;
const ARMORY_BLOCK = 2;
const SUPPORT_DURATION = 2;
const SUPPORT_BONUS_COINS = 500;
const SUPPORT_HEAL = 2;
const EVENT_DAMAGE = 4;
const EVENT_DRAW = 1;

const FAST_ACTION_COSTS = {
  SC: 400,
  WPN: 600,
  ARM: 600,
  EVT: 300
};

const playerFightersEl = document.getElementById("player-fc-row");
const enemyFightersEl = document.getElementById("enemy-fc-row");
const playerSupportsEl = document.getElementById("player-supports");
const enemySupportsEl = document.getElementById("enemy-supports");

function createFighter(card, index) {
  const hp = 28 + index * 2;
  return {
    id: card.id,
    name: card.name,
    maxHp: hp,
    hp,
    exhausted: false,
    cooldown: 0,
    basic: {
      name: "Basic Strike",
      cost: BASIC_COST,
      damage: BASIC_DAMAGE
    },
    ultimate: {
      name: "Ultimate Strike",
      cost: ULTIMATE_COST,
      damage: ULTIMATE_DAMAGE,
      cooldown: 2
    },
    weapon: null,
    armory: null,
    defeated: false
  };
}

function createSupport(card) {
  const number = Number.parseInt(card.id.split("-")[1], 10);
  const even = Number.isFinite(number) && number % 2 === 0;
  return {
    id: card.id,
    name: card.name,
    duration: SUPPORT_DURATION,
    effect: even
      ? { type: "bonus-coins", amount: SUPPORT_BONUS_COINS }
      : { type: "heal-active", amount: SUPPORT_HEAL }
  };
}

function createWeapon(card) {
  return {
    id: card.id,
    name: card.name,
    bonus: WEAPON_BONUS
  };
}

function createArmory(card) {
  return {
    id: card.id,
    name: card.name,
    block: ARMORY_BLOCK
  };
}

function createPlayer(houseKey) {
  const deck = shuffle(createSampleDeck());
  return {
    houseKey,
    deck,
    discard: [],
    hand: [],
    coins: 0,
    combatUsed: false,
    turnsTaken: 0,
    field: {
      activeIndex: 0,
      fighters: [],
      supports: []
    }
  };
}

function drawCards(player, count) {
  const drawn = [];
  for (let i = 0; i < count; i += 1) {
    if (!player.deck.length) {
      break;
    }
    const cardId = player.deck.shift();
    if (cardId) {
      player.hand.push(cardId);
      drawn.push(cardId);
    }
  }
  return drawn;
}

function countHandTypes(hand) {
  return hand.reduce((acc, cardId) => {
    const card = CARD_LIBRARY[cardId];
    if (!card) {
      return acc;
    }
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {});
}

function handMeetsRules(hand) {
  const counts = countHandTypes(hand);
  return Object.entries(STARTING_HAND_RULES).every(([type, amount]) => {
    return (counts[type] || 0) === amount;
  });
}

function findOverrepresentedIndex(hand) {
  const counts = countHandTypes(hand);
  for (let i = 0; i < hand.length; i += 1) {
    const card = CARD_LIBRARY[hand[i]];
    if (!card) {
      continue;
    }
    if ((counts[card.type] || 0) > STARTING_HAND_RULES[card.type]) {
      return i;
    }
  }
  return -1;
}

function buildStartingHand(player) {
  player.hand = [];
  drawCards(player, 10);
  let safety = 0;
  const targetSize = Object.values(STARTING_HAND_RULES).reduce((sum, value) => sum + value, 0);
  while ((player.hand.length !== targetSize || !handMeetsRules(player.hand)) && safety < 400) {
    safety += 1;
    if (player.hand.length < targetSize) {
      drawCards(player, 1);
      continue;
    }
    const removeIndex = findOverrepresentedIndex(player.hand);
    const removed = removeIndex === -1 ? player.hand.pop() : player.hand.splice(removeIndex, 1)[0];
    if (removed) {
      player.discard.push(removed);
    }
    drawCards(player, 1);
  }
}

function deployStartingFighters(player) {
  const fighters = [];
  const usedIds = new Set();
  for (const cardId of player.hand) {
    const card = CARD_LIBRARY[cardId];
    if (card && card.type === "FC" && fighters.length < 3) {
      fighters.push(createFighter(card, fighters.length));
      usedIds.add(cardId);
    }
  }
  player.field.fighters = fighters;
  player.field.activeIndex = 0;
  player.hand = player.hand.filter((cardId) => !usedIds.has(cardId));
}

function getActiveFighter(player) {
  if (!player || !player.field.fighters.length) {
    return null;
  }
  const fighter = player.field.fighters[player.field.activeIndex];
  if (fighter && !fighter.defeated) {
    return fighter;
  }
  return null;
}

function getSwitchTargets(player) {
  return player.field.fighters
    .map((fighter, index) => ({ fighter, index }))
    .filter(({ fighter, index }) => {
      return index !== player.field.activeIndex && !fighter.defeated && !fighter.exhausted;
    })
    .map(({ index }) => index);
}

function setActiveIndex(player, index) {
  player.field.activeIndex = index;
}

function applyDamage(targetPlayerKey, amount) {
  const targetPlayer = state.players[targetPlayerKey];
  const target = getActiveFighter(targetPlayer);
  if (!target) {
    return;
  }
  const block = target.armory ? target.armory.block : 0;
  const finalDamage = Math.max(0, amount - block);
  target.hp = Math.max(0, target.hp - finalDamage);
  logMessage(
    (targetPlayerKey === "player" ? "Player" : "Enemy") +
      " takes " +
      finalDamage +
      " damage."
  );
  if (target.hp === 0) {
    target.defeated = true;
    logMessage((targetPlayerKey === "player" ? "Player" : "Enemy") + " fighter is defeated.");
    const nextIndex = targetPlayer.field.fighters.findIndex((fighter) => !fighter.defeated);
    if (nextIndex === -1) {
      finishMatch(targetPlayerKey === "player" ? "enemy" : "player");
      return;
    }
    setActiveIndex(targetPlayer, nextIndex);
  }
}

function applySupportEffects(playerKey) {
  const player = state.players[playerKey];
  if (!player) {
    return;
  }
  player.field.supports.forEach((support) => {
    if (support.effect.type === "bonus-coins") {
      player.coins += support.effect.amount;
    }
    if (support.effect.type === "heal-active") {
      const active = getActiveFighter(player);
      if (active && !active.defeated) {
        active.hp = Math.min(active.maxHp, active.hp + support.effect.amount);
      }
    }
  });
  player.field.supports.forEach((support) => {
    support.duration -= 1;
  });
  player.field.supports = player.field.supports.filter((support) => support.duration > 0);
}

function tickCooldowns(playerKey) {
  const player = state.players[playerKey];
  player.field.fighters.forEach((fighter) => {
    if (fighter.cooldown > 0) {
      fighter.cooldown -= 1;
    }
  });
}

function clearExhaust(playerKey) {
  const player = state.players[playerKey];
  player.field.fighters.forEach((fighter) => {
    fighter.exhausted = false;
  });
}

function allocateCoins() {
  state.players.player.coins = ROUND_COINS;
  state.players.enemy.coins = ROUND_COINS;
}

function updateUI() {
  const player = state.players.player;
  const enemy = state.players.enemy;
  if (!player || !enemy) {
    return;
  }
  updateTopBar(state.round, state.turn, player.coins);
  updateDeckCounts(player.deck.length, player.discard.length);
  const switchTargets = state.phase === "switch-target" ? getSwitchTargets(player) : [];
  renderFighterRow(playerFightersEl, player.field.fighters, player.field.activeIndex, switchTargets);
  renderFighterRow(enemyFightersEl, enemy.field.fighters, enemy.field.activeIndex, []);
  renderSupports(playerSupportsEl, player.field.supports);
  renderSupports(enemySupportsEl, enemy.field.supports);
  renderPlayerHand(player.hand, state.selectedCardIndex, state.phase === "switch-select");
  renderEnemyHand(enemy.hand.length);
  const active = getActiveFighter(player);
  const canAct = state.phase === "battle" && state.turn === "player" && !player.combatUsed;
  const canBasic =
    canAct && active && !active.exhausted && player.coins >= active.basic.cost;
  const canUltimate =
    canAct &&
    active &&
    !active.exhausted &&
    active.cooldown === 0 &&
    player.coins >= active.ultimate.cost;
  const canSwitch = canAct && player.coins >= SWITCH_COST && getSwitchTargets(player).length > 0;
  const canEnd = state.phase === "battle" && state.turn === "player";
  setActionButtons({
    canBasic,
    canUltimate,
    canSwitch,
    canEnd
  });
}

function finishMatch(winnerKey) {
  state.phase = "game-over";
  const winnerName = winnerKey === "player" ? "Victory" : "Defeat";
  const house = winnerKey === "player" ? state.players.player.houseKey : state.players.enemy.houseKey;
  hideRoundOverlay();
  showGameOver(winnerName, "House " + house + " prevails.");
  updateUI();
}

function performBasic(playerKey) {
  const actor = state.players[playerKey];
  const active = getActiveFighter(actor);
  if (!active || active.exhausted) {
    return false;
  }
  if (actor.coins < active.basic.cost) {
    logMessage("Not enough coins for a basic skill.");
    return false;
  }
  actor.coins -= active.basic.cost;
  const bonus = active.weapon ? active.weapon.bonus : 0;
  const damage = active.basic.damage + bonus;
  applyDamage(playerKey === "player" ? "enemy" : "player", damage);
  return true;
}

function performUltimate(playerKey) {
  const actor = state.players[playerKey];
  const active = getActiveFighter(actor);
  if (!active || active.exhausted) {
    return false;
  }
  if (active.cooldown > 0) {
    logMessage("Ultimate is on cooldown.");
    return false;
  }
  if (actor.coins < active.ultimate.cost) {
    logMessage("Not enough coins for an ultimate skill.");
    return false;
  }
  actor.coins -= active.ultimate.cost;
  const bonus = active.weapon ? active.weapon.bonus : 0;
  const damage = active.ultimate.damage + bonus;
  applyDamage(playerKey === "player" ? "enemy" : "player", damage);
  active.cooldown = active.ultimate.cooldown;
  active.exhausted = true;
  return true;
}

function performSwitch(playerKey, targetIndex) {
  const actor = state.players[playerKey];
  if (actor.coins < SWITCH_COST) {
    logMessage("Not enough coins to switch.");
    return false;
  }
  const fighter = actor.field.fighters[targetIndex];
  if (!fighter || fighter.defeated || fighter.exhausted) {
    return false;
  }
  actor.coins -= SWITCH_COST;
  setActiveIndex(actor, targetIndex);
  logMessage((playerKey === "player" ? "Player" : "Enemy") + " switches active fighter.");
  return true;
}

function endTurn() {
  const current = state.turn;
  if (current === "player") {
    startTurn("enemy");
  } else {
    state.round += 1;
    beginRound();
  }
}

function startTurn(turnKey) {
  state.turn = turnKey;
  const actor = state.players[turnKey];
  if (actor) {
    actor.combatUsed = false;
  }
  updateUI();
  if (turnKey === "enemy" && state.phase === "battle") {
    window.setTimeout(enemyTurn, 700);
  }
}

function applySwitchOne(player, index) {
  const removed = player.hand.splice(index, 1)[0];
  if (removed) {
    player.discard.push(removed);
  }
  drawCards(player, 1);
}

function applyRedraw(player) {
  const drawn = state.lastDrawn.player;
  drawn.forEach((cardId) => {
    const handIndex = player.hand.indexOf(cardId);
    if (handIndex !== -1) {
      player.hand.splice(handIndex, 1);
      player.discard.push(cardId);
    }
  });
  drawCards(player, drawn.length);
}

function beginRound() {
  state.phase = "round-start";
  state.lastDrawn.player = drawCards(state.players.player, 3);
  state.lastDrawn.enemy = drawCards(state.players.enemy, 3);
  if (state.players.enemy.hand.length) {
    const randomIndex = Math.floor(Math.random() * state.players.enemy.hand.length);
    applySwitchOne(state.players.enemy, randomIndex);
  }
  showRoundOverlay("Choose one action for your hand adjustment.");
  updateUI();
}

function finalizeRoundStart() {
  allocateCoins();
  applySupportEffects("player");
  applySupportEffects("enemy");
  tickCooldowns("player");
  tickCooldowns("enemy");
  clearExhaust("player");
  clearExhaust("enemy");
  hideRoundOverlay();
  logMessage("Round " + state.round + " begins.");
  state.phase = "battle";
  startTurn(state.turn);
}

function playSupport(player, card) {
  player.field.supports.push(createSupport(card));
  return true;
}

function playWeapon(player, card) {
  const active = getActiveFighter(player);
  if (!active) {
    return false;
  }
  if (active.weapon) {
    logMessage("Weapon slot is full.");
    return false;
  }
  active.weapon = createWeapon(card);
  return true;
}

function playArmory(player, card) {
  const active = getActiveFighter(player);
  if (!active) {
    return false;
  }
  if (active.armory) {
    logMessage("Armory slot is full.");
    return false;
  }
  active.armory = createArmory(card);
  return true;
}

function playEvent(playerKey, player, card) {
  const number = Number.parseInt(card.id.split("-")[1], 10);
  if (Number.isFinite(number) && number % 2 === 0) {
    drawCards(player, EVENT_DRAW);
    logMessage("Event draws " + EVENT_DRAW + " card.");
  } else {
    applyDamage(playerKey === "player" ? "enemy" : "player", EVENT_DAMAGE);
    logMessage("Event strikes for " + EVENT_DAMAGE + " damage.");
  }
  player.discard.push(card.id);
  return true;
}

function handleFastAction(card, index) {
  const player = state.players.player;
  const cost = FAST_ACTION_COSTS[card.type];
  if (cost === undefined) {
    return;
  }
  if (player.coins < cost) {
    logMessage("Not enough coins to play " + card.type + ".");
    return;
  }
  let played = false;
  if (card.type === "SC") {
    played = playSupport(player, card);
  }
  if (card.type === "WPN") {
    played = playWeapon(player, card);
  }
  if (card.type === "ARM") {
    played = playArmory(player, card);
  }
  if (card.type === "EVT") {
    played = playEvent("player", player, card);
  }
  if (played) {
    player.coins -= cost;
    player.hand.splice(index, 1);
    logMessage("Player plays " + card.name + ".");
    updateUI();
  }
}

function enemyTurn() {
  if (state.phase !== "battle" || state.turn !== "enemy") {
    return;
  }
  const enemy = state.players.enemy;
  const active = getActiveFighter(enemy);
  if (active && !active.exhausted) {
    const wantsUltimate = active.cooldown === 0 && enemy.coins >= active.ultimate.cost && Math.random() < 0.35;
    const acted = wantsUltimate ? performUltimate("enemy") : performBasic("enemy");
    if (acted) {
      if (state.phase === "game-over") {
        return;
      }
      enemy.combatUsed = true;
      updateUI();
      endTurn();
      return;
    }
  }
  const targets = getSwitchTargets(enemy);
  if (targets.length && enemy.coins >= SWITCH_COST) {
    performSwitch("enemy", targets[0]);
    enemy.combatUsed = true;
    updateUI();
    endTurn();
    return;
  }
  logMessage("Enemy ends the turn.");
  endTurn();
}

export function startMatch(playerHouseKey) {
  resetState();
  hideGameOver();
  state.phase = "setup";
  const enemyOptions = HOUSES.filter((house) => house.key !== playerHouseKey);
  const enemyHouse = enemyOptions[Math.floor(Math.random() * enemyOptions.length)];
  state.players.player = createPlayer(playerHouseKey);
  state.players.enemy = createPlayer(enemyHouse.key);

  buildStartingHand(state.players.player);
  buildStartingHand(state.players.enemy);
  deployStartingFighters(state.players.player);
  deployStartingFighters(state.players.enemy);
  clearLog();
  const deckValidation = validateDeck(state.players.player.deck);
  if (!deckValidation.valid) {
    logMessage(deckValidation.errors.join(" "));
  }
  logMessage("Match begins. Starting hand locked.");
  state.turn = Math.random() < 0.5 ? "player" : "enemy";
  beginRound();
}

export function chooseRoundAction(action) {
  if (state.phase !== "round-start") {
    return;
  }
  if (action === "switch") {
    if (!state.players.player.hand.length) {
      finalizeRoundStart();
      return;
    }
    hideRoundOverlay();
    state.phase = "switch-select";
    logMessage("Select one card to discard for Switch 1.");
    updateUI();
    return;
  }
  if (action === "redraw") {
    applyRedraw(state.players.player);
    finalizeRoundStart();
  }
}

export function handlePlayerCardClick(index) {
  const player = state.players.player;
  if (!player) {
    return;
  }
  if (state.phase === "switch-select") {
    if (index >= 0 && index < player.hand.length) {
      applySwitchOne(player, index);
      finalizeRoundStart();
    }
    return;
  }
  if (state.phase !== "battle" || state.turn !== "player") {
    return;
  }
  const cardId = player.hand[index];
  const card = CARD_LIBRARY[cardId];
  if (!card) {
    return;
  }
  if (card.type === "FC") {
    logMessage("Fighting Characters are locked after setup.");
    return;
  }
  handleFastAction(card, index);
}

export function handleBasicSkill() {
  if (state.phase !== "battle" || state.turn !== "player") {
    return;
  }
  const acted = performBasic("player");
  if (acted) {
    if (state.phase === "game-over") {
      return;
    }
    state.players.player.combatUsed = true;
    updateUI();
    endTurn();
  }
}

export function handleUltimateSkill() {
  if (state.phase !== "battle" || state.turn !== "player") {
    return;
  }
  const acted = performUltimate("player");
  if (acted) {
    if (state.phase === "game-over") {
      return;
    }
    state.players.player.combatUsed = true;
    updateUI();
    endTurn();
  }
}

export function handleSwitchAction() {
  if (state.phase !== "battle" || state.turn !== "player") {
    return;
  }
  if (state.players.player.coins < SWITCH_COST) {
    return;
  }
  if (getSwitchTargets(state.players.player).length === 0) {
    return;
  }
  state.phase = "switch-target";
  logMessage("Select a standby fighter to switch in.");
  updateUI();
}

export function handlePlayerFighterClick(index) {
  if (state.phase !== "switch-target") {
    return;
  }
  const player = state.players.player;
  if (!player) {
    return;
  }
  if (performSwitch("player", index)) {
    player.combatUsed = true;
    state.phase = "battle";
    updateUI();
    endTurn();
  }
}

export function handleEndTurn() {
  if (state.phase !== "battle" || state.turn !== "player") {
    return;
  }
  logMessage("Player ends the turn.");
  endTurn();
}
