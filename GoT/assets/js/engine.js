import { CARD_LIBRARY, HOUSES } from "./data.js";
import { state, resetState, elements } from "./state.js";
import { shuffle } from "./utils.js";
import {
  addLog,
  showPlayedCard,
  clearPlayedCards,
  updateUI,
  setPhase,
  showEndOverlay,
  hideEndOverlay,
  hideMenuOverlay,
  hideSetupOverlay,
  showMenuOverlay
} from "./ui.js";

function createCombatant(houseKey, isPlayer) {
  const house = HOUSES[houseKey];
  return {
    side: isPlayer ? "player" : "enemy",
    houseKey,
    name: isPlayer ? house.champion : house.enemyName,
    hp: 40,
    maxHp: 40,
    block: 0,
    effects: {
      burn: 0
    },
    nextAttackBonus: 0,
    attackPenalty: 0,
    furyReady: false,
    deck: shuffle(house.deck),
    discard: [],
    hand: [],
    energy: 0
  };
}

function refreshUI() {
  updateUI((index) => playCard("player", index));
}

function drawCards(sideKey, count) {
  const unit = state[sideKey];
  for (let i = 0; i < count; i += 1) {
    if (unit.hand.length >= state.maxHand) {
      return;
    }
    if (unit.deck.length === 0 && unit.discard.length > 0) {
      unit.deck = shuffle(unit.discard);
      unit.discard = [];
    }
    if (unit.deck.length === 0) {
      return;
    }
    unit.hand.push(unit.deck.pop());
  }
}

function dealDamage(targetKey, amount) {
  const target = state[targetKey];
  let remaining = amount;
  if (target.block > 0) {
    const absorbed = Math.min(target.block, remaining);
    target.block -= absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) {
    target.hp = Math.max(0, target.hp - remaining);
  }
  return remaining;
}

function applyAttackModifiers(source, baseDamage) {
  let damage = baseDamage;
  if (source.attackPenalty > 0) {
    damage = Math.max(0, damage - source.attackPenalty);
    addLog("Weakened strike reduces damage by " + source.attackPenalty + ".");
    source.attackPenalty = 0;
  }
  if (source.nextAttackBonus > 0) {
    damage += source.nextAttackBonus;
    addLog("Battle shout adds " + source.nextAttackBonus + " damage.");
    source.nextAttackBonus = 0;
  }
  if (source.houseKey === "targaryen") {
    damage += 2;
  }
  if (source.houseKey === "baratheon" && source.furyReady) {
    damage += 3;
    source.furyReady = false;
    addLog("Fury empowers the strike.");
  }
  return damage;
}

function applyCard(card, sourceKey, targetKey) {
  const source = state[sourceKey];
  const target = state[targetKey];

  if (card.type === "attack") {
    let damage = applyAttackModifiers(source, card.power);
    if (card.burnBonus && target.effects.burn > 0) {
      damage += card.burnBonus;
      addLog("Dragonglass bites deeper into burned flesh.");
    }
    const dealt = dealDamage(targetKey, damage);
    addLog(source.name + " deals " + dealt + " damage.");
    if (card.burn) {
      target.effects.burn += card.burn;
      addLog(target.name + " suffers " + card.burn + " burn.");
    }
    if (card.draw) {
      drawCards(sourceKey, card.draw);
      addLog(source.name + " draws " + card.draw + " card(s).");
    }
  }

  if (card.type === "defense") {
    let block = card.power;
    if (source.houseKey === "stark") {
      block += 2;
    }
    source.block += block;
    addLog(source.name + " gains " + block + " block.");
  }

  if (card.type === "tactic") {
    if (card.heal) {
      source.hp = Math.min(source.maxHp, source.hp + card.heal);
      addLog(source.name + " heals " + card.heal + " health.");
    }
    if (card.draw) {
      drawCards(sourceKey, card.draw);
      addLog(source.name + " draws " + card.draw + " card(s).");
    }
    if (card.weaken) {
      target.attackPenalty = Math.max(target.attackPenalty, card.weaken);
      addLog(target.name + " is weakened.");
    }
    if (card.nextAttackBonus) {
      source.nextAttackBonus += card.nextAttackBonus;
      addLog(source.name + " prepares a stronger attack.");
    }
  }
}

function playCard(sideKey, index) {
  const unit = state[sideKey];
  if (state.turn !== sideKey) {
    return;
  }
  const cardId = unit.hand[index];
  if (!cardId) {
    return;
  }
  const card = CARD_LIBRARY[cardId];
  if (card.cost > unit.energy) {
    return;
  }
  unit.energy -= card.cost;
  unit.hand.splice(index, 1);
  unit.discard.push(cardId);
  showPlayedCard(sideKey, card);
  applyCard(card, sideKey, sideKey === "player" ? "enemy" : "player");
  refreshUI();
  if (checkGameOver()) {
    return;
  }
}

function applyStartOfTurn(sideKey) {
  const unit = state[sideKey];
  if (unit.effects.burn > 0) {
    const burnDamage = unit.effects.burn * 2;
    unit.effects.burn = Math.max(0, unit.effects.burn - 1);
    dealDamage(sideKey, burnDamage);
    addLog(unit.name + " takes " + burnDamage + " burn damage.");
  }
}

function startPlayerTurn() {
  state.turn = "player";
  clearPlayedCards();
  applyStartOfTurn("player");
  if (checkGameOver()) {
    return;
  }
  const drawCount = state.player.houseKey === "lannister" ? 2 : 1;
  drawCards("player", drawCount);
  state.player.energy = state.maxEnergy;
  state.player.furyReady = state.player.houseKey === "baratheon";
  setPhase("Your turn");
  elements.endTurnBtn.disabled = false;
  addLog("Your turn begins.");
  refreshUI();
}

function startEnemyTurn() {
  state.turn = "enemy";
  clearPlayedCards();
  applyStartOfTurn("enemy");
  if (checkGameOver()) {
    return;
  }
  drawCards("enemy", 1);
  state.enemy.energy = state.maxEnergy;
  state.enemy.furyReady = state.enemy.houseKey === "baratheon";
  setPhase("Enemy turn");
  elements.endTurnBtn.disabled = true;
  refreshUI();
  window.setTimeout(enemyPlay, 700);
}

function chooseEnemyCard() {
  const unit = state.enemy;
  const playable = unit.hand
    .map((cardId, index) => ({
      index,
      card: CARD_LIBRARY[cardId]
    }))
    .filter((entry) => entry.card.cost <= unit.energy);

  if (playable.length === 0) {
    return null;
  }

  if (unit.hp < 14) {
    const healCard = playable.find((entry) => entry.card.heal);
    if (healCard) {
      return healCard.index;
    }
  }

  playable.sort((a, b) => b.card.power - a.card.power);
  return playable[0].index;
}

function enemyPlay() {
  if (state.turn !== "enemy") {
    return;
  }
  const choice = chooseEnemyCard();
  if (choice === null) {
    endEnemyTurn();
    return;
  }
  playCard("enemy", choice);
  window.setTimeout(endEnemyTurn, 800);
}

function endEnemyTurn() {
  if (checkGameOver()) {
    return;
  }
  state.round += 1;
  startPlayerTurn();
}

function checkGameOver() {
  if (!state.player || !state.enemy) {
    return false;
  }
  if (state.player.hp <= 0 || state.enemy.hp <= 0) {
    const victory = state.player.hp > 0;
    finishMatch(victory);
    return true;
  }
  return false;
}

function finishMatch(victory) {
  showEndOverlay(victory);
  elements.endTurnBtn.disabled = true;
  state.turn = "over";
}

export function startMatch(playerHouseKey) {
  resetState();
  const enemyOptions = Object.keys(HOUSES).filter((key) => key !== playerHouseKey);
  const enemyHouseKey = enemyOptions[Math.floor(Math.random() * enemyOptions.length)];
  state.player = createCombatant(playerHouseKey, true);
  state.enemy = createCombatant(enemyHouseKey, false);
  drawCards("player", 5);
  drawCards("enemy", 5);
  elements.battleLog.innerHTML = "";
  addLog("The banners rise. Battle begins.");
  hideMenuOverlay();
  hideSetupOverlay();
  hideEndOverlay();
  refreshUI();
  startPlayerTurn();
}

export function handleEndTurn() {
  if (state.turn !== "player") {
    return;
  }
  startEnemyTurn();
}

export function handleRestart() {
  hideEndOverlay();
  showMenuOverlay();
  hideSetupOverlay();
}
