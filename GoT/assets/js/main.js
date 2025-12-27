import { elements } from "./state.js";
import { startMatch, handleEndTurn, handleRestart } from "./engine.js";
import { showSetupOverlay, hideMenuOverlay } from "./ui.js";

document.querySelectorAll(".house-option").forEach((button) => {
  button.addEventListener("click", () => {
    const houseKey = button.dataset.house;
    startMatch(houseKey);
  });
});

elements.singlePlayerBtn.addEventListener("click", () => {
  hideMenuOverlay();
  showSetupOverlay();
});

elements.endTurnBtn.addEventListener("click", handleEndTurn);

elements.restartBtn.addEventListener("click", handleRestart);
