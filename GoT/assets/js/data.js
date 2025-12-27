export const CARD_LIBRARY = {
  strike: { id: "strike", name: "Sword Strike", type: "attack", cost: 1, power: 6, text: "Deal 6 damage." },
  thrust: { id: "thrust", name: "Quick Thrust", type: "attack", cost: 1, power: 4, text: "Deal 4 damage. Draw 1.", draw: 1 },
  cleave: { id: "cleave", name: "Cleave", type: "attack", cost: 2, power: 10, text: "Deal 10 damage." },
  execute: { id: "execute", name: "Execution", type: "attack", cost: 3, power: 16, text: "Deal 16 damage." },
  shieldwall: { id: "shieldwall", name: "Shieldwall", type: "defense", cost: 1, power: 7, text: "Gain 7 block." },
  fortify: { id: "fortify", name: "Fortify", type: "defense", cost: 2, power: 12, text: "Gain 12 block." },
  rally: { id: "rally", name: "Rally", type: "tactic", cost: 1, power: 6, text: "Heal 6.", heal: 6 },
  warcry: { id: "warcry", name: "Warcry", type: "tactic", cost: 1, power: 0, text: "Your next attack gains +4.", nextAttackBonus: 4 },
  wildfire: { id: "wildfire", name: "Wildfire", type: "attack", cost: 2, power: 9, text: "Deal 9 damage and apply 2 burn.", burn: 2 },
  spycraft: { id: "spycraft", name: "Spycraft", type: "tactic", cost: 1, power: 0, text: "Enemy attack -3 next turn.", weaken: 3 },
  supply: { id: "supply", name: "Supply Run", type: "tactic", cost: 1, power: 0, text: "Draw 2 cards.", draw: 2 },
  dragonglass: { id: "dragonglass", name: "Dragonglass", type: "attack", cost: 2, power: 8, text: "Deal 8 damage. If enemy is burned, deal +4.", burnBonus: 4 }
};

const DEFAULT_DECK = [
  "strike", "strike",
  "thrust", "thrust",
  "cleave", "cleave",
  "execute",
  "shieldwall", "shieldwall",
  "fortify",
  "rally", "rally",
  "warcry", "warcry",
  "spycraft",
  "supply", "supply",
  "wildfire",
  "dragonglass",
  "cleave"
];

export const HOUSES = {
  stark: {
    name: "Stark",
    champion: "Jon Snow",
    enemyName: "Stark Ranger",
    color: "#8db6d9",
    passive: "Resilience",
    deck: [
      "strike", "strike", "thrust", "cleave", "cleave",
      "execute", "shieldwall", "shieldwall", "fortify", "fortify",
      "rally", "rally", "warcry", "supply", "spycraft",
      "wildfire", "dragonglass", "thrust", "shieldwall", "rally"
    ]
  },
  lannister: {
    name: "Lannister",
    champion: "Jaime Lannister",
    enemyName: "Lannister Captain",
    color: "#d1b058",
    passive: "Wealth",
    deck: [
      "strike", "strike", "thrust", "cleave", "execute",
      "shieldwall", "fortify", "rally", "warcry", "spycraft",
      "supply", "supply", "supply", "wildfire", "dragonglass",
      "thrust", "warcry", "rally", "cleave", "strike"
    ]
  },
  targaryen: {
    name: "Targaryen",
    champion: "Daenerys",
    enemyName: "Dragon Loyalist",
    color: "#f05a28",
    passive: "Fireblood",
    deck: [
      "strike", "strike", "thrust", "cleave", "cleave",
      "execute", "wildfire", "wildfire", "dragonglass", "dragonglass",
      "warcry", "rally", "shieldwall", "fortify", "spycraft",
      "supply", "thrust", "strike", "cleave", "rally"
    ]
  },
  baratheon: {
    name: "Baratheon",
    champion: "Gendry",
    enemyName: "Stormland Knight",
    color: "#d7b35c",
    passive: "Fury",
    deck: [
      "strike", "strike", "thrust", "cleave", "cleave",
      "execute", "execute", "shieldwall", "fortify", "rally",
      "warcry", "warcry", "wildfire", "dragonglass", "supply",
      "spycraft", "thrust", "strike", "cleave", "rally"
    ]
  },
  tyrell: {
    name: "Tyrell",
    champion: "Loras Tyrell",
    enemyName: "Reach Vanguard",
    color: "#3a7d44",
    passive: "TBD",
    deck: DEFAULT_DECK
  },
  arryn: {
    name: "Arryn",
    champion: "Yohn Royce",
    enemyName: "Vale Sentinel",
    color: "#5b7c99",
    passive: "TBD",
    deck: DEFAULT_DECK
  },
  martell: {
    name: "Martell",
    champion: "Oberyn Martell",
    enemyName: "Dornish Spear",
    color: "#c95a2c",
    passive: "TBD",
    deck: DEFAULT_DECK
  },
  greyjoy: {
    name: "Greyjoy",
    champion: "Yara Greyjoy",
    enemyName: "Ironborn Raider",
    color: "#4a4a4f",
    passive: "TBD",
    deck: DEFAULT_DECK
  }
};
