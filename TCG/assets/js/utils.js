import { CARD_LIBRARY, DECK_RULES } from "./data.js";

export function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function countByType(deck) {
  return deck.reduce((acc, cardId) => {
    const card = CARD_LIBRARY[cardId];
    if (!card) {
      return acc;
    }
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {});
}

export function validateDeck(deck) {
  const errors = [];
  const counts = countByType(deck);
  const expectedTotal = Object.values(DECK_RULES).reduce((sum, value) => sum + value, 0);
  if (deck.length !== expectedTotal) {
    errors.push("Deck size must be " + expectedTotal + " cards.");
  }
  Object.entries(DECK_RULES).forEach(([type, required]) => {
    const actual = counts[type] || 0;
    if (actual !== required) {
      errors.push("Deck must contain " + required + " " + type + " cards.");
    }
  });
  return {
    valid: errors.length === 0,
    errors
  };
}
