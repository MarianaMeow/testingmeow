export const CARD_TYPES = {
  FC: "FC",
  SC: "SC",
  WPN: "WPN",
  ARM: "ARM",
  EVT: "EVT"
};

export const DECK_RULES = {
  FC: 10,
  SC: 20,
  WPN: 10,
  ARM: 10,
  EVT: 10
};

export const STARTING_HAND_RULES = {
  FC: 3,
  SC: 7,
  EVT: 3,
  WPN: 2,
  ARM: 2
};

export const HOUSES = [
  { key: "stark", name: "Stark" },
  { key: "baratheon", name: "Baratheon" },
  { key: "lannister", name: "Lannister" },
  { key: "targaryen", name: "Targaryen" },
  { key: "tyrell", name: "Tyrell" },
  { key: "arryn", name: "Arryn" },
  { key: "martell", name: "Martell" },
  { key: "greyjoy", name: "Greyjoy" }
];

function buildBatch(prefix, type, count, label) {
  const items = [];
  for (let i = 1; i <= count; i += 1) {
    const id = prefix + "-" + String(i).padStart(2, "0");
    items.push({
      id,
      name: label + " " + i,
      type
    });
  }
  return items;
}

const CARD_POOL = [
  ...buildBatch("fc", CARD_TYPES.FC, DECK_RULES.FC, "Fighting Character"),
  ...buildBatch("sc", CARD_TYPES.SC, DECK_RULES.SC, "Supporting Character"),
  ...buildBatch("wpn", CARD_TYPES.WPN, DECK_RULES.WPN, "Weapon"),
  ...buildBatch("arm", CARD_TYPES.ARM, DECK_RULES.ARM, "Armory"),
  ...buildBatch("evt", CARD_TYPES.EVT, DECK_RULES.EVT, "Event")
];

export const CARD_LIBRARY = Object.fromEntries(
  CARD_POOL.map((card) => [card.id, card])
);

export function createSampleDeck() {
  return CARD_POOL.map((card) => card.id);
}
