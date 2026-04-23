// trys to save tinyfishing progress (TO DO) 
// fix errors with the game not saving
(function () {
  const SAVE_KEY = "tinyfishing_save";

  function getSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveGame() {
    try {
      const data = getSave();

      if (typeof window.money !== "undefined") data.money = window.money;
      if (typeof window.progress !== "undefined") data.progress = window.progress;
      if (typeof window.score !== "undefined") data.score = window.score;

      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function loadGame() {
    try {
      const data = getSave();
      if (typeof data.money !== "undefined") window.money = data.money;
      if (typeof data.progress !== "undefined") window.progress = data.progress;
      if (typeof data.score !== "undefined") window.score = data.score;
    } catch (e) {}
  }

  window.loadTinyFishingSave = loadGame;
  window.saveTinyFishingSave = saveGame;

  setInterval(saveGame, 2500);
})();
