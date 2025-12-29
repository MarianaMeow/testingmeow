export const state = {
  round: 1,
  turn: "player",
  phase: "menu",
  lastDrawn: {
    player: [],
    enemy: []
  },
  selectedCardIndex: null,
  players: {
    player: null,
    enemy: null
  }
};

export function resetState() {
  state.round = 1;
  state.turn = "player";
  state.phase = "menu";
  state.lastDrawn.player = [];
  state.lastDrawn.enemy = [];
  state.selectedCardIndex = null;
  state.players.player = null;
  state.players.enemy = null;
}
