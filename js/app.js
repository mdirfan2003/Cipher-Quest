const RESTART_DELAY_MS = 1300;

let pendingPlayerName = "";
let finalScoreSaved = false;
let restartTimeoutId = null;
let lastTimerWarningSecond = null;

const dom = {};

/**
 * Starts the app once the HTML document has fully loaded.
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", initialiseApp);

/**
 * Initialises DOM references, event listeners, and default screen state.
 * @returns {void}
 */
function initialiseApp() {
    cacheDomElements();
    validateRequiredModules();
    attachEventListeners();
    createDidYouKnowDisplay();
    createSoundToggle();
    UIController.showScreen("screen-home");
}

/**
 * Saves commonly used DOM elements into the dom object.
 * @returns {void}
 */
function cacheDomElements() {
    dom.playerForm = document.getElementById("player-form");
    dom.playerNameInput = document.getElementById("player-name");

    dom.homeLeaderboardButton = document.getElementById("btn-home-leaderboard");
    dom.homeHowToPlayButton = document.getElementById("btn-home-howtoplay");

    dom.difficultyButtons = document.querySelectorAll(".btn-difficulty");

    dom.answerForm = document.getElementById("answer-form");
    dom.answerInput = document.getElementById("answer-input");
    dom.hintButton = document.getElementById("btn-use-hint");

    dom.timerDisplay = document.getElementById("timer-display");
    dom.scoreDisplay = document.getElementById("score-display");
    dom.livesDisplay = document.getElementById("lives-display");
    dom.hintCounter = document.getElementById("hint-counter");

    dom.cipherTypeDisplay = document.getElementById("cipher-type-display");
    dom.cipherTextDisplay = document.getElementById("cipher-text-display");
    dom.hintDisplay = document.getElementById("hint-display");

    dom.completedLevelNumber = document.getElementById("completed-level-number");
    dom.scoreEarnedDisplay = document.getElementById("score-earned-display");
    dom.timeBonusDisplay = document.getElementById("time-bonus-display");
    dom.totalScoreDisplay = document.getElementById("total-score-display");
    dom.continueButton = document.getElementById("btn-continue");

    dom.gameOverTitle = document.getElementById("gameover-title");
    dom.finalScoreDisplay = document.getElementById("final-score-display");
    dom.playAgainButton = document.getElementById("btn-play-again");
    dom.gameOverLeaderboardButton = document.getElementById("btn-gameover-leaderboard");

    dom.leaderboardBackButton = document.getElementById("btn-leaderboard-back");
    dom.howToPlayBackButton = document.getElementById("btn-howtoplay-back");
}

/**
 * Confirms that the browser script modules contain the functions and data needed by the app.
 * @returns {void}
 */
function validateRequiredModules() {
    const requiredCipherFunctions = [
        "caesarEncrypt",
        "vigenereEncrypt",
        "textToBinary",
        "textToMorse",
        "rot13",
        "atbashEncrypt"
    ];

    const missingFunctions = requiredCipherFunctions.filter((functionName) => {
        return typeof CipherEngine[functionName] !== "function";
    });

    if (missingFunctions.length > 0) {
        console.warn(`Missing CipherEngine functions: ${missingFunctions.join(", ")}`);
    }

    if (!Array.isArray(LEVELS) || LEVELS.length === 0) {
        console.warn("LEVELS array is missing or empty.");
    }
}

/**
 * Attaches all app event listeners.
 * @returns {void}
 */
function attachEventListeners() {
    if (dom.playerForm) {
        dom.playerForm.addEventListener("submit", handlePlayerFormSubmit);
    }

    if (dom.homeLeaderboardButton) {
        dom.homeLeaderboardButton.addEventListener("click", showLeaderboardScreen);
    }

    if (dom.homeHowToPlayButton) {
        dom.homeHowToPlayButton.addEventListener("click", showHowToPlayScreen);
    }

    dom.difficultyButtons.forEach((button) => {
        button.addEventListener("click", handleDifficultySelect);
    });

    if (dom.answerForm) {
        dom.answerForm.addEventListener("submit", handleAnswerSubmit);
    }

    if (dom.answerInput) {
        dom.answerInput.addEventListener("keydown", handleAnswerKeyPress);
    }

    if (dom.hintButton) {
        dom.hintButton.addEventListener("click", handleHintRequest);
    }

    if (dom.continueButton) {
        dom.continueButton.addEventListener("click", handleContinueToNextLevel);
    }

    if (dom.playAgainButton) {
        dom.playAgainButton.addEventListener("click", handlePlayAgain);
    }

    if (dom.gameOverLeaderboardButton) {
        dom.gameOverLeaderboardButton.addEventListener("click", showLeaderboardScreen);
    }

    if (dom.leaderboardBackButton) {
        dom.leaderboardBackButton.addEventListener("click", showHomeScreen);
    }

    if (dom.howToPlayBackButton) {
        dom.howToPlayBackButton.addEventListener("click", showHomeScreen);
    }
}

/**
 * Handles username submission from the home screen.
 * @param {SubmitEvent} event - The form submit event.
 * @returns {void}
 */
function handlePlayerFormSubmit(event) {
    event.preventDefault();
    unlockSound();

    const playerName = dom.playerNameInput ? dom.playerNameInput.value.trim() : "";

    if (!playerName) {
        if (dom.playerNameInput) {
            dom.playerNameInput.setCustomValidity("Enter a username to start Cipher Quest.");
            dom.playerNameInput.reportValidity();
        }

        return;
    }

    dom.playerNameInput.setCustomValidity("");
    pendingPlayerName = playerName;

    UIController.showScreen("screen-difficulty");
}

/**
 * Handles difficulty selection and starts a new game.
 * @param {MouseEvent} event - The click event from a difficulty button.
 * @returns {void}
 */
function handleDifficultySelect(event) {
    unlockSound();
    const difficulty = event.currentTarget.dataset.difficulty || "easy";
    const playerName = pendingPlayerName || dom.playerNameInput?.value.trim() || "Agent";

    clearRestartTimeout();
    Timer.stop();

    finalScoreSaved = false;
    GameState.startGame(playerName, difficulty);

    showGameScreenAndStartLevel();
}

/**
 * Displays the active game screen and starts the timer for the current level.
 * @returns {void}
 */
function showGameScreenAndStartLevel() {
    if (!GameState.currentLevel) {
        showFinalScoreScreen(true);
        return;
    }

    renderCurrentLevel();
    updatePlayerDisplays();

    UIController.showScreen("screen-game");

    if (dom.answerInput) {
        dom.answerInput.focus();
    }

    startLevelTimer();
}

/**
 * Renders the current level data on the game screen.
 * @returns {void}
 */
function renderCurrentLevel() {
    const level = GameState.currentLevel;

    if (!level) {
        return;
    }

    if (dom.cipherTypeDisplay) {
        dom.cipherTypeDisplay.textContent = `Cipher Type: ${formatCipherType(level.cipherType)}`;
    }

    if (dom.cipherTextDisplay) {
        dom.cipherTextDisplay.textContent = GameState.encryptedText || "";
    }

    if (dom.answerInput) {
        dom.answerInput.value = "";
    }

    if (dom.hintDisplay) {
        dom.hintDisplay.textContent = "No hint used yet.";
    }

    updateDidYouKnowDisplay(level);
}

/**
 * Starts the countdown timer for the active level.
 * @returns {void}
 */
function startLevelTimer() {
    Timer.stop();
    lastTimerWarningSecond = null;

    const startingSeconds = GameState.timeLeft || GameState.currentLevel?.timeLimit || 60;

    Timer.start(
        startingSeconds,
        handleTimerTick,
        handleTimerExpired
    );
}

/**
 * Handles every timer tick and updates the UI.
 * @param {number} seconds - Remaining seconds.
 * @returns {void}
 */
function handleTimerTick(seconds) {
    UIController.updateTimer(seconds);
    GameState.setTimeLeft(seconds);

    if (seconds > 0 && seconds < 10 && seconds !== lastTimerWarningSecond) {
        playSound("playTimerWarning");
        lastTimerWarningSecond = seconds;
    }
}

/**
 * Handles the timer expiry event.
 * @returns {void}
 */
function handleTimerExpired() {
    const livesLeft = GameState.loseLife();

    updatePlayerDisplays();

    if (livesLeft > 0) {
        playSound("playWrong");
    }

    if (livesLeft <= 0) {
        UIController.showFeedback("Time expired. No lives remaining.", "wrong");
        setTimeout(() => showFinalScoreScreen(false), RESTART_DELAY_MS);
        return;
    }

    UIController.showFeedback("Time expired. One life lost. Restarting level.", "wrong");
    scheduleCurrentLevelRestart();
}

/**
 * Handles Enter key submission from the answer input.
 * @param {KeyboardEvent} event - The keydown event.
 * @returns {void}
 */
function handleAnswerKeyPress(event) {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    handleAnswerSubmit(event);
}

/**
 * Handles answer submission from the game screen.
 * @param {SubmitEvent|KeyboardEvent} event - The submit or key event.
 * @returns {void}
 */
function handleAnswerSubmit(event) {
    event.preventDefault();
    unlockSound();

    if (!dom.answerInput || GameState.status !== "playing") {
        return;
    }

    GameState.setTimeLeft(Timer.getTimeLeft());

    const livesBeforeAnswer = GameState.player.lives;
    const answer = dom.answerInput.value;
    const result = GameState.submitAnswer(answer);

    updatePlayerDisplays();

    if (result.correct) {
        handleCorrectAnswer(result);
        return;
    }

    handleWrongAnswer(result, livesBeforeAnswer);
}

/**
 * Handles the correct answer flow.
 * @param {{correct: boolean, pointsEarned: number, message: string}} result - The answer result.
 * @returns {void}
 */
function handleCorrectAnswer(result) {
    Timer.stop();

    const timeBonus = Timer.getTimeBonus();

    GameState.lastLevelScore = {
        ...GameState.lastLevelScore,
        timeBonus,
        pointsEarned: result.pointsEarned
    };

    GameState.saveToStorage();

    playSound("playCorrect");
    UIController.showFeedback(result.message, "correct");
    showLevelCompleteScreen();
}

/**
 * Handles the wrong answer flow.
 * @param {{correct: boolean, pointsEarned: number, message: string}} result - The answer result.
 * @param {number} livesBeforeAnswer - The number of lives before the answer was checked.
 * @returns {void}
 */
function handleWrongAnswer(result, livesBeforeAnswer) {
    const lostLife = GameState.player.lives < livesBeforeAnswer;
    const feedbackType = result.pointsEarned < 0 ? "wrong" : "info";

    playSound("playWrong");
    UIController.showFeedback(result.message, feedbackType);

    if (GameState.status === "gameover") {
        Timer.stop();
        setTimeout(() => showFinalScoreScreen(false), RESTART_DELAY_MS);
        return;
    }

    if (lostLife) {
        Timer.stop();
        scheduleCurrentLevelRestart();
    }
}

/**
 * Handles hint button clicks.
 * @returns {void}
 */
function handleHintRequest() {
    unlockSound();
    const hint = GameState.useHint();

    updatePlayerDisplays();

    if (!hint) {
        playSound("playHint");
        UIController.showFeedback("No hints remaining for this level.", "info");
        return;
    }

    if (dom.hintDisplay) {
        dom.hintDisplay.textContent = hint;
    }

    UIController.showFeedback("Hint unlocked. 5 points deducted.", "info");
}

/**
 * Shows the level complete screen with score breakdown.
 * @returns {void}
 */
function showLevelCompleteScreen() {
    const scoreData = GameState.lastLevelScore;

    if (dom.completedLevelNumber) {
        dom.completedLevelNumber.textContent = String(scoreData.levelNumber);
    }

    if (dom.scoreEarnedDisplay) {
        dom.scoreEarnedDisplay.textContent = String(scoreData.basePoints);
    }

    if (dom.timeBonusDisplay) {
        dom.timeBonusDisplay.textContent = String(scoreData.timeBonus);
    }

    if (dom.totalScoreDisplay) {
        dom.totalScoreDisplay.textContent = String(GameState.player.totalScore);
    }

    const levelCompleteScreen = document.getElementById("screen-level-complete");

    if (levelCompleteScreen) {
        levelCompleteScreen.classList.remove("celebrate");
        levelCompleteScreen.offsetHeight;
        levelCompleteScreen.classList.add("celebrate");
    }

    UIController.showScreen("screen-level-complete");
}

/**
 * Continues to the next level or completes the game.
 * @returns {void}
 */
function handleContinueToNextLevel() {
    const nextLevel = GameState.nextLevel();

    if (!nextLevel || GameState.status === "complete") {
        showFinalScoreScreen(true);
        return;
    }

    playSound("playLevelUp");
    showGameScreenAndStartLevel();
}

/**
 * Updates score, lives, timer, and hint counter displays.
 * @returns {void}
 */
function updatePlayerDisplays() {
    if (dom.scoreDisplay) {
        dom.scoreDisplay.textContent = String(GameState.player.totalScore);
    }

    if (dom.livesDisplay) {
        dom.livesDisplay.textContent = String(GameState.player.lives);
    }

    if (dom.hintCounter) {
        dom.hintCounter.textContent = String(GameState.getHintsRemaining());
    }

    UIController.updateTimer(GameState.timeLeft);
}

/**
 * Restarts the current level after a short delay.
 * @returns {void}
 */
function scheduleCurrentLevelRestart() {
    clearRestartTimeout();

    restartTimeoutId = setTimeout(() => {
        restartCurrentLevel();
    }, RESTART_DELAY_MS);
}

/**
 * Reloads the current level after losing a life.
 * @returns {void}
 */
function restartCurrentLevel() {
    if (GameState.status === "gameover") {
        showFinalScoreScreen(false);
        return;
    }

    const levelNumber = GameState.currentLevel?.levelNumber || GameState.player.currentLevel || 1;

    GameState.loadLevel(levelNumber);
    showGameScreenAndStartLevel();
}

/**
 * Clears any scheduled level restart.
 * @returns {void}
 */
function clearRestartTimeout() {
    if (restartTimeoutId !== null) {
        clearTimeout(restartTimeoutId);
        restartTimeoutId = null;
    }
}

/**
 * Shows the final score screen for game over or game complete.
 * @param {boolean} completed - Whether the player completed all levels.
 * @returns {void}
 */
function showFinalScoreScreen(completed) {
    clearRestartTimeout();
    Timer.stop();

    saveFinalScoreOnce();

    if (dom.gameOverTitle) {
        dom.gameOverTitle.textContent = completed ? "Game Complete" : "Game Over";
    }

    if (dom.finalScoreDisplay) {
        dom.finalScoreDisplay.textContent = String(GameState.player.totalScore);
    }

    playSound(completed ? "playLevelUp" : "playGameOver");
    UIController.showScreen("screen-gameover");
}

/**
 * Handles the play again button.
 * @returns {void}
 */
function handlePlayAgain() {
    clearRestartTimeout();
    Timer.stop();

    finalScoreSaved = false;

    if (dom.gameOverTitle) {
        dom.gameOverTitle.textContent = "Game Over";
    }

    UIController.showScreen("screen-home");

    if (dom.playerNameInput) {
        dom.playerNameInput.focus();
    }
}

/**
 * Shows the leaderboard screen.
 * @returns {void}
 */
function showLeaderboardScreen() {
    clearRestartTimeout();
    Timer.stop();

    const leaderboard = ScoreManager.getLeaderboard();

    UIController.renderLeaderboard(leaderboard);
    UIController.showScreen("screen-leaderboard");
}

/**
 * Shows the how to play screen.
 * @returns {void}
 */
function showHowToPlayScreen() {
    clearRestartTimeout();
    Timer.stop();
    UIController.showScreen("screen-howtoplay");
}

/**
 * Shows the home screen.
 * @returns {void}
 */
function showHomeScreen() {
    clearRestartTimeout();
    Timer.stop();
    UIController.showScreen("screen-home");
}

/**
 * Saves the final score only once per finished game.
 * @returns {void}
 */
function saveFinalScoreOnce() {
    if (finalScoreSaved) {
        return;
    }

    ScoreManager.addEntry(GameState.player.name, GameState.player.totalScore);

    finalScoreSaved = true;
}

/**
 * Creates the did you know display area inside the game screen if it does not exist.
 * @returns {HTMLElement|null} The did you know element.
 */
function createDidYouKnowDisplay() {
    const existingElement = document.getElementById("did-you-know-display");

    if (existingElement) {
        dom.didYouKnowDisplay = existingElement;
        return existingElement;
    }

    const cipherPanel = document.querySelector("#screen-game .cipher-panel");

    if (!cipherPanel) {
        return null;
    }

    const factElement = document.createElement("p");
    factElement.id = "did-you-know-display";
    factElement.className = "did-you-know";
    factElement.setAttribute("aria-live", "polite");
    factElement.textContent = "Did you know: Level fact will appear here.";

    cipherPanel.appendChild(factElement);
    dom.didYouKnowDisplay = factElement;

    return factElement;
}

/**
 * Updates the did you know fact for the active level.
 * @param {object} level - The active level object.
 * @returns {void}
 */
function updateDidYouKnowDisplay(level) {
    const didYouKnowDisplay = dom.didYouKnowDisplay || createDidYouKnowDisplay();

    if (!didYouKnowDisplay) {
        return;
    }

    didYouKnowDisplay.textContent = `Did you know: ${level.didYouKnow || "Every cipher has a pattern you can learn."}`;
}

/**
 * Converts a cipher function name into a player friendly label.
 * @param {string} cipherType - The cipher function name from the level data.
 * @returns {string} A readable cipher name.
 */
function formatCipherType(cipherType) {
    const labels = {
        caesarEncrypt: "Caesar Cipher",
        vigenereEncrypt: "Vigenere Cipher",
        textToBinary: "Binary to Text",
        textToMorse: "Morse Code",
        rot13: "ROT13",
        atbashEncrypt: "Atbash"
    };

    return labels[cipherType] || cipherType || "Unknown Cipher";
}

/**
 * Creates the sound mute toggle when the SoundManager module is available.
 * @returns {void}
 */
function createSoundToggle() {
    if (typeof SoundManager === "undefined" || typeof SoundManager.createMuteToggle !== "function") {
        return;
    }

    SoundManager.createMuteToggle();
}

/**
 * Unlocks browser audio after a user interaction.
 * @returns {void}
 */
function unlockSound() {
    if (typeof SoundManager === "undefined" || typeof SoundManager.unlock !== "function") {
        return;
    }

    SoundManager.unlock();
}

/**
 * Safely unlocks audio and plays a sound effect when SoundManager is available.
 * @param {string} soundName - The SoundManager sound function name.
 * @returns {void}
 */
function playSound(soundName) {
    if (typeof SoundManager === "undefined") {
        console.warn("SoundManager is not loaded.");
        return;
    }

    if (typeof SoundManager.unlock === "function") {
        SoundManager.unlock();
    }

    if (typeof SoundManager[soundName] !== "function") {
        console.warn(`Sound function not found: ${soundName}`);
        return;
    }

    SoundManager[soundName]();
}

/**
 * Unlocks browser audio after the first real user interaction.
 * This is needed because browsers block audio before the user clicks or presses a key.
 * @returns {void}
 */
function attachSoundUnlockListeners() {
    const unlockOnce = () => {
        unlockSound();
    };

    document.addEventListener("pointerdown", unlockOnce, { once: true });
    document.addEventListener("keydown", unlockOnce, { once: true });
    document.addEventListener("touchstart", unlockOnce, { once: true });
}