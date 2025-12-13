// ========== GAME DATA ==========
const HOUSES = {
  stark: {
    name: 'STARK',
    sigil: '🐺',
    champion: 'JON SNOW',
    ability: 'Ice Armor',
    abilityDesc: 'Block the next attack',
    color: '#87ceeb'
  },
  lannister: {
    name: 'LANNISTER', 
    sigil: '🦁',
    champion: 'JAIME LANNISTER',
    ability: 'Gold',
    abilityDesc: 'Draw 2 extra cards',
    color: '#c9a227'
  },
  targaryen: {
    name: 'TARGARYEN',
    sigil: '🐉',
    champion: 'DAENERYS',
    ability: 'Dracarys',
    abilityDesc: 'Deal 25 fire damage',
    color: '#ff4500'
  },
  baratheon: {
    name: 'BARATHEON',
    sigil: '🦌', 
    champion: 'ROBERT BARATHEON',
    ability: 'Fury',
    abilityDesc: 'Double next attack',
    color: '#ffd700'
  }
};

const ENEMIES = [
  { name: 'JOFFREY BARATHEON', sigil: '🦌', hp: 60, deck: 'weak' },
  { name: 'RAMSAY BOLTON', sigil: '🔪', hp: 80, deck: 'aggressive' },
  { name: 'CERSEI LANNISTER', sigil: '🦁', hp: 100, deck: 'balanced' },
  { name: 'THE MOUNTAIN', sigil: '⛰️', hp: 120, deck: 'tank' },
  { name: 'THE NIGHT KING', sigil: '🧊', hp: 150, deck: 'boss' }
];

const CARDS = {
  // Attack cards
  sword: { name: 'Sword Strike', icon: '⚔️', type: 'attack', value: 8, desc: 'Basic attack' },
  dagger: { name: 'Dagger', icon: '🗡️', type: 'attack', value: 5, desc: 'Quick strike' },
  axe: { name: 'Battle Axe', icon: '🪓', type: 'attack', value: 12, desc: 'Heavy blow' },
  arrow: { name: 'Arrow', icon: '🏹', type: 'attack', value: 6, desc: 'Ranged attack' },
  fire: { name: 'Wildfire', icon: '🔥', type: 'attack', value: 15, desc: 'Burns everything' },
  
  // Defense cards
  shield: { name: 'Shield', icon: '🛡️', type: 'defense', value: 8, desc: 'Block damage' },
  armor: { name: 'Armor', icon: '🦺', type: 'defense', value: 12, desc: 'Heavy protection' },
  dodge: { name: 'Dodge', icon: '💨', type: 'defense', value: 5, desc: 'Evade attack' },
  
  // Special cards
  heal: { name: 'Milk of Poppy', icon: '🧪', type: 'special', value: 15, desc: 'Restore health' },
  poison: { name: 'Poison', icon: '☠️', type: 'special', value: 8, desc: 'Damage over time' },
  steal: { name: 'Steal', icon: '👛', type: 'special', value: 0, desc: 'Copy enemy card' },
  dragon: { name: 'Dragon Fire', icon: '🐲', type: 'attack', value: 20, desc: 'Devastating!' }
};

const QUOTES = {
  victory: [
    '"The Iron Throne is yours!"',
    '"You win or you die. You won."',
    '"A Lannister always pays his debts... in blood."',
    '"Fire and Blood! Victory is yours!"',
    '"The North Remembers... your triumph!"'
  ],
  defeat: [
    '"Valar Morghulis. All men must die."',
    '"The things I do for love..."',
    '"Winter came for you."',
    '"You know nothing..."',
    '"Dracarys... but not for you."'
  ]
};

// ========== GAME STATE ==========
let state = {
  screen: 'title',
  playerHouse: null,
  playerHP: 100,
  playerMaxHP: 100,
  enemyHP: 100,
  enemyMaxHP: 100,
  currentEnemy: 0,
  hand: [],
  deckCards: [],
  specialUsed: false,
  shieldActive: false,
  poisonStacks: 0,
  furyActive: false,
  turn: 0,
  enemiesDefeated: 0
};

// ========== DOM ELEMENTS ==========
const screens = {
  title: document.getElementById('title-screen'),
  house: document.getElementById('house-screen'),
  battle: document.getElementById('battle-screen'),
  end: document.getElementById('end-screen')
};

// ========== INITIALIZATION ==========
function init() {
  createEmbers();
  setupEventListeners();
}

function createEmbers() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 50; i++) {
    const ember = document.createElement('div');
    ember.className = 'ember';
    ember.style.left = Math.random() * 100 + '%';
    ember.style.animationDuration = (Math.random() * 2 + 2) + 's';
    ember.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(ember);
  }
}

function setupEventListeners() {
  document.getElementById('start-btn').addEventListener('click', () => showScreen('house'));
  
  document.querySelectorAll('.house-card').forEach(card => {
    card.addEventListener('click', () => selectHouse(card.dataset.house));
  });
  
  document.getElementById('special-btn').addEventListener('click', useSpecialAbility);
  document.getElementById('restart-btn').addEventListener('click', restartGame);
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  state.screen = name;
}


// ========== HOUSE SELECTION ==========
function selectHouse(house) {
  state.playerHouse = house;
  const houseData = HOUSES[house];
  
  document.getElementById('player-avatar').textContent = houseData.sigil;
  document.getElementById('player-name').textContent = houseData.champion;
  
  const specialBtn = document.getElementById('special-btn');
  specialBtn.querySelector('.special-name').textContent = houseData.ability;
  specialBtn.title = houseData.abilityDesc;
  
  startBattle();
}

// ========== BATTLE SYSTEM ==========
function startBattle() {
  const enemy = ENEMIES[state.currentEnemy];
  state.enemyHP = enemy.hp;
  state.enemyMaxHP = enemy.hp;
  state.specialUsed = false;
  state.shieldActive = false;
  state.poisonStacks = 0;
  state.furyActive = false;
  
  document.getElementById('enemy-avatar').textContent = enemy.sigil;
  document.getElementById('enemy-name').textContent = enemy.name;
  updateHealthBars();
  
  document.getElementById('special-btn').disabled = false;
  
  // Build deck
  buildDeck();
  drawCards(5);
  
  clearBattleLog();
  addBattleLog(`⚔️ ${enemy.name} appears!`);
  
  showScreen('battle');
}

function buildDeck() {
  state.deckCards = [];
  const cardTypes = Object.keys(CARDS);
  
  // Add cards to deck
  for (let i = 0; i < 20; i++) {
    const randomCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    state.deckCards.push(randomCard);
  }
  
  // Shuffle
  state.deckCards.sort(() => Math.random() - 0.5);
}

function drawCards(count) {
  for (let i = 0; i < count; i++) {
    if (state.deckCards.length > 0 && state.hand.length < 7) {
      state.hand.push(state.deckCards.pop());
    }
  }
  renderHand();
}

function renderHand() {
  const handEl = document.getElementById('hand');
  handEl.innerHTML = '';
  
  state.hand.forEach((cardKey, index) => {
    const card = CARDS[cardKey];
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.type}`;
    cardEl.innerHTML = `
      <div class="card-icon">${card.icon}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-value">${card.type === 'attack' ? '⚔️' : card.type === 'defense' ? '🛡️' : '✨'} ${card.value}</div>
      <div class="card-desc">${card.desc}</div>
    `;
    
    cardEl.addEventListener('click', () => playCard(index));
    handEl.appendChild(cardEl);
  });
}

function playCard(index) {
  const cardKey = state.hand[index];
  const card = CARDS[cardKey];
  
  // Show played card
  const playerPlayed = document.getElementById('player-played');
  playerPlayed.innerHTML = `<div class="card-icon">${card.icon}</div><div class="card-name">${card.name}</div>`;
  playerPlayed.classList.add('active');
  
  // Remove from hand
  state.hand.splice(index, 1);
  renderHand();
  
  // Process card effect
  setTimeout(() => {
    processPlayerCard(card, cardKey);
  }, 500);
}

function processPlayerCard(card, cardKey) {
  let damage = card.value;
  
  // Apply fury bonus
  if (state.furyActive && card.type === 'attack') {
    damage *= 2;
    state.furyActive = false;
    addBattleLog(`⚡ FURY! Double damage!`, 'special');
  }
  
  // Targaryen bonus
  if (state.playerHouse === 'targaryen' && card.type === 'attack') {
    damage += 3;
  }
  
  switch(card.type) {
    case 'attack':
      dealDamageToEnemy(damage);
      addBattleLog(`You deal ${damage} damage!`, 'damage');
      break;
    case 'defense':
      state.shieldActive = true;
      state.shieldValue = card.value;
      addBattleLog(`You raise your shield! (${card.value} block)`, 'heal');
      break;
    case 'special':
      if (cardKey === 'heal') {
        state.playerHP = Math.min(state.playerMaxHP, state.playerHP + card.value);
        addBattleLog(`You heal ${card.value} HP!`, 'heal');
        updateHealthBars();
      } else if (cardKey === 'poison') {
        state.poisonStacks += 3;
        addBattleLog(`Enemy is poisoned!`, 'special');
      }
      break;
  }
  
  // Check if enemy dead
  if (state.enemyHP <= 0) {
    enemyDefeated();
    return;
  }
  
  // Enemy turn
  setTimeout(enemyTurn, 1000);
}

function dealDamageToEnemy(damage) {
  state.enemyHP = Math.max(0, state.enemyHP - damage);
  updateHealthBars();
  
  // Visual feedback
  document.getElementById('enemy-avatar').classList.add('hit');
  setTimeout(() => document.getElementById('enemy-avatar').classList.remove('hit'), 500);
}

function enemyTurn() {
  // Apply poison
  if (state.poisonStacks > 0) {
    const poisonDmg = state.poisonStacks * 3;
    state.enemyHP = Math.max(0, state.enemyHP - poisonDmg);
    state.poisonStacks--;
    addBattleLog(`Poison deals ${poisonDmg} damage!`, 'special');
    updateHealthBars();
    
    if (state.enemyHP <= 0) {
      enemyDefeated();
      return;
    }
  }
  
  // Enemy attacks
  const enemy = ENEMIES[state.currentEnemy];
  let damage = Math.floor(Math.random() * 10 + 5);
  
  // Scale with enemy difficulty
  damage += state.currentEnemy * 3;
  
  // Random enemy card
  const enemyCards = ['sword', 'axe', 'dagger', 'fire'];
  const enemyCard = CARDS[enemyCards[Math.floor(Math.random() * enemyCards.length)]];
  
  // Show enemy card
  const enemyPlayed = document.getElementById('enemy-played');
  enemyPlayed.innerHTML = `<div class="card-icon">${enemyCard.icon}</div><div class="card-name">${enemyCard.name}</div>`;
  enemyPlayed.classList.add('active');
  
  setTimeout(() => {
    // Apply shield
    if (state.shieldActive) {
      damage = Math.max(0, damage - state.shieldValue);
      state.shieldActive = false;
      addBattleLog(`Shield blocks ${state.shieldValue} damage!`, 'heal');
    }
    
    // Stark defense bonus
    if (state.playerHouse === 'stark') {
      damage = Math.floor(damage * 0.85);
    }
    
    if (damage > 0) {
      state.playerHP = Math.max(0, state.playerHP - damage);
      addBattleLog(`${enemy.name} deals ${damage} damage!`, 'damage');
      
      // Blood effect
      document.getElementById('blood-overlay').classList.add('active');
      setTimeout(() => document.getElementById('blood-overlay').classList.remove('active'), 500);
      
      document.getElementById('player-avatar').classList.add('hit');
      setTimeout(() => document.getElementById('player-avatar').classList.remove('hit'), 500);
    }
    
    updateHealthBars();
    
    // Check player death
    if (state.playerHP <= 0) {
      gameOver(false);
      return;
    }
    
    // Draw new card
    drawCards(1);
    
    // Lannister bonus
    if (state.playerHouse === 'lannister' && Math.random() > 0.7) {
      drawCards(1);
      addBattleLog(`💰 Lannister gold! Extra card drawn.`, 'special');
    }
    
    // Clear played cards
    setTimeout(() => {
      document.getElementById('player-played').classList.remove('active');
      document.getElementById('player-played').innerHTML = '';
      document.getElementById('enemy-played').classList.remove('active');
      document.getElementById('enemy-played').innerHTML = '';
    }, 500);
    
  }, 500);
}


// ========== SPECIAL ABILITIES ==========
function useSpecialAbility() {
  if (state.specialUsed) return;
  
  state.specialUsed = true;
  document.getElementById('special-btn').disabled = true;
  
  const house = state.playerHouse;
  
  switch(house) {
    case 'stark':
      // Ice Armor - block next attack completely
      state.shieldActive = true;
      state.shieldValue = 999;
      addBattleLog(`❄️ ICE ARMOR! Next attack blocked!`, 'special');
      break;
      
    case 'lannister':
      // Draw extra cards
      drawCards(3);
      addBattleLog(`💰 LANNISTER GOLD! Drew 3 cards!`, 'special');
      break;
      
    case 'targaryen':
      // Dracarys - massive damage
      dealDamageToEnemy(25);
      addBattleLog(`🔥 DRACARYS! 25 fire damage!`, 'special');
      
      // Fire animation
      document.body.style.animation = 'none';
      document.body.offsetHeight;
      document.body.style.animation = 'fireFlash 0.5s ease';
      
      if (state.enemyHP <= 0) {
        enemyDefeated();
      }
      break;
      
    case 'baratheon':
      // Fury - double next attack
      state.furyActive = true;
      addBattleLog(`⚡ OURS IS THE FURY! Next attack doubled!`, 'special');
      break;
  }
}

// ========== GAME FLOW ==========
function enemyDefeated() {
  state.enemiesDefeated++;
  state.currentEnemy++;
  
  addBattleLog(`☠️ ${ENEMIES[state.currentEnemy - 1].name} defeated!`, 'special');
  
  // Heal between battles
  state.playerHP = Math.min(state.playerMaxHP, state.playerHP + 20);
  updateHealthBars();
  
  if (state.currentEnemy >= ENEMIES.length) {
    // Won the game!
    setTimeout(() => gameOver(true), 1500);
  } else {
    // Next enemy
    setTimeout(() => {
      addBattleLog(`--- NEXT CHALLENGER ---`, 'special');
      startBattle();
    }, 2000);
  }
}

function gameOver(victory) {
  const endIcon = document.getElementById('end-icon');
  const endTitle = document.getElementById('end-title');
  const endQuote = document.getElementById('end-quote');
  const endStats = document.getElementById('end-stats');
  
  if (victory) {
    endIcon.textContent = '👑';
    endTitle.textContent = 'VICTORY';
    endTitle.className = 'end-title victory';
    endQuote.textContent = QUOTES.victory[Math.floor(Math.random() * QUOTES.victory.length)];
  } else {
    endIcon.textContent = '💀';
    endTitle.textContent = 'DEFEAT';
    endTitle.className = 'end-title defeat';
    endQuote.textContent = QUOTES.defeat[Math.floor(Math.random() * QUOTES.defeat.length)];
  }
  
  endStats.innerHTML = `
    <p>House: ${HOUSES[state.playerHouse].name}</p>
    <p>Enemies Defeated: ${state.enemiesDefeated}/${ENEMIES.length}</p>
  `;
  
  showScreen('end');
}

function restartGame() {
  state = {
    screen: 'title',
    playerHouse: null,
    playerHP: 100,
    playerMaxHP: 100,
    enemyHP: 100,
    enemyMaxHP: 100,
    currentEnemy: 0,
    hand: [],
    deckCards: [],
    specialUsed: false,
    shieldActive: false,
    poisonStacks: 0,
    furyActive: false,
    turn: 0,
    enemiesDefeated: 0
  };
  
  showScreen('title');
}

// ========== UI HELPERS ==========
function updateHealthBars() {
  const playerPercent = (state.playerHP / state.playerMaxHP) * 100;
  const enemyPercent = (state.enemyHP / state.enemyMaxHP) * 100;
  
  document.getElementById('player-health-bar').style.width = playerPercent + '%';
  document.getElementById('enemy-health-bar').style.width = enemyPercent + '%';
  
  document.getElementById('player-hp').textContent = Math.max(0, state.playerHP);
  document.getElementById('enemy-hp').textContent = Math.max(0, state.enemyHP);
}

function addBattleLog(message, type = '') {
  const log = document.getElementById('battle-log');
  const p = document.createElement('p');
  p.className = type;
  p.textContent = message;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

function clearBattleLog() {
  document.getElementById('battle-log').innerHTML = '';
}

// Add fire flash animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fireFlash {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(255, 69, 0, 0.3); }
  }
`;
document.head.appendChild(style);

// ========== START GAME ==========
init();
