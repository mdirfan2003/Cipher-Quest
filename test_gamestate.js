/**
 * Cipher Quest aggressive GameState test script.
 * Uses only console.assert statements and browser console output.
 * Load this file after cipherEngine.js, levels.js, and gameState.js.
 */

(function runAggressiveGameStateTests() {
    "use strict";

    const TEST_NAME = "GameState";
    const STORAGE_KEYS = Object.freeze({
        PLAYER: "cq_player",
        PROGRESS: "cq_progress",
        LEADERBOARD: "cq_leaderboard"
    });

    const EXPECTED_DIFFICULTY_SETTINGS = Object.freeze({
        easy: {
            timeLimit: 120,
            hintsAllowed: 3,
            maxAttempts: 5
        },
        medium: {
            timeLimit: 60,
            hintsAllowed: 2,
            maxAttempts: 3
        },
        hard: {
            timeLimit: 30,
            hintsAllowed: 1,
            maxAttempts: 2
        }
    });

    const BASE_POINTS = 100;
    const TIME_BONUS_MULTIPLIER = 2;
    const WRONG_ANSWER_PENALTY = 10;
    const HINT_PENALTY = 5;
    const LIVES_BONUS_MULTIPLIER = 100;

    let passedTests = 0;
    let failedTests = 0;

    /**
     * Runs one test safely and records the result.
     * @param {string} testName - The test description.
     * @param {Function} testFunction - The function that returns true when the test passes.
     * @returns {void}
     */
    function runTest(testName, testFunction) {
        let passed = false;

        try {
            passed = Boolean(testFunction());
        } catch (error) {
            console.error(`FAIL ${TEST_NAME}: ${testName}`, error);
            console.assert(false, `${TEST_NAME}: ${testName}`);
            failedTests += 1;
            return;
        }

        console.assert(passed, `${TEST_NAME}: ${testName}`);

        if (passed) {
            console.log(`PASS ${TEST_NAME}: ${testName}`);
            passedTests += 1;
        } else {
            console.log(`FAIL ${TEST_NAME}: ${testName}`);
            failedTests += 1;
        }
    }

    /**
     * Checks whether all required global modules exist.
     * @returns {boolean} True when required modules are available.
     */
    function requiredModulesExist() {
        return (
            typeof GameState !== "undefined" &&
            typeof CipherEngine !== "undefined" &&
            Array.isArray(LEVELS) &&
            LEVELS.length > 0
        );
    }

    /**
     * Backs up localStorage values used by Cipher Quest.
     * @returns {object} The localStorage backup object.
     */
    function backupStorage() {
        return {
            player: localStorage.getItem(STORAGE_KEYS.PLAYER),
            progress: localStorage.getItem(STORAGE_KEYS.PROGRESS),
            leaderboard: localStorage.getItem(STORAGE_KEYS.LEADERBOARD)
        };
    }

    /**
     * Restores localStorage values used by Cipher Quest.
     * @param {object} backup - The localStorage backup object.
     * @returns {void}
     */
    function restoreStorage(backup) {
        restoreStorageValue(STORAGE_KEYS.PLAYER, backup.player);
        restoreStorageValue(STORAGE_KEYS.PROGRESS, backup.progress);
        restoreStorageValue(STORAGE_KEYS.LEADERBOARD, backup.leaderboard);
    }

    /**
     * Restores one localStorage value.
     * @param {string} key - The storage key.
     * @param {string|null} value - The storage value, or null if it should be removed.
     * @returns {void}
     */
    function restoreStorageValue(key, value) {
        if (value === null) {
            localStorage.removeItem(key);
            return;
        }

        localStorage.setItem(key, value);
    }

    /**
     * Backs up the current exposed GameState values.
     * @returns {object} The GameState backup object.
     */
    function backupGameState() {
        return {
            player: { ...GameState.player },
            currentLevel: GameState.currentLevel,
            encryptedText: GameState.encryptedText,
            solution: GameState.solution,
            difficulty: GameState.difficulty,
            status: GameState.status,
            attempts: GameState.attempts,
            timeLeft: GameState.timeLeft,
            levelHintsUsed: GameState.levelHintsUsed,
            lastLevelScore: { ...GameState.lastLevelScore },
            livesBonusApplied: GameState.livesBonusApplied
        };
    }

    /**
     * Restores exposed GameState values after the tests finish.
     * @param {object} backup - The GameState backup object.
     * @returns {void}
     */
    function restoreGameState(backup) {
        GameState.player = backup.player;
        GameState.currentLevel = backup.currentLevel;
        GameState.encryptedText = backup.encryptedText;
        GameState.solution = backup.solution;
        GameState.difficulty = backup.difficulty;
        GameState.status = backup.status;
        GameState.attempts = backup.attempts;
        GameState.timeLeft = backup.timeLeft;
        GameState.levelHintsUsed = backup.levelHintsUsed;
        GameState.lastLevelScore = backup.lastLevelScore;
        GameState.livesBonusApplied = backup.livesBonusApplied;
    }

    /**
     * Clears Cipher Quest storage before each isolated test.
     * @returns {void}
     */
    function clearCipherQuestStorage() {
        localStorage.removeItem(STORAGE_KEYS.PLAYER);
        localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    }

    /**
     * Gets the expected encrypted text for a level.
     * @param {object} level - The level object.
     * @returns {string} The expected encrypted text.
     */
    function getExpectedEncryptedText(level) {
        const cipherFunction = CipherEngine[level.cipherType];

        if (typeof cipherFunction !== "function") {
            return String(level.plainText);
        }

        return cipherFunction(level.plainText, level.key);
    }

    /**
     * Calculates the expected correct-answer score for the current GameState time.
     * @returns {number} The expected score.
     */
    function getExpectedCorrectAnswerScore() {
        return BASE_POINTS + (GameState.timeLeft * TIME_BONUS_MULTIPLIER);
    }

    /**
     * Submits wrong answers until the selected difficulty reaches max attempts.
     * @param {string} difficulty - The difficulty being tested.
     * @returns {void}
     */
    function useAllWrongAttempts(difficulty) {
        const maxAttempts = EXPECTED_DIFFICULTY_SETTINGS[difficulty].maxAttempts;

        for (let attemptIndex = 0; attemptIndex < maxAttempts; attemptIndex += 1) {
            GameState.submitAnswer(`wrong answer ${attemptIndex}`);
        }
    }

    /**
     * Uses hints until no hints remain.
     * @returns {Array<string|null>} The returned hint values.
     */
    function useAllHints() {
        const returnedHints = [];
        const startingHints = GameState.getHintsRemaining();

        for (let hintIndex = 0; hintIndex < startingHints; hintIndex += 1) {
            returnedHints.push(GameState.useHint());
        }

        returnedHints.push(GameState.useHint());

        return returnedHints;
    }

    if (!requiredModulesExist()) {
        console.assert(false, "GameState tests require GameState, CipherEngine, and LEVELS.");
        console.error("FAIL GameState: Required modules are missing.");
        return;
    }

    const storageBackup = backupStorage();
    const gameStateBackup = backupGameState();

    console.log("Starting aggressive GameState gameflow tests...");

    try {
        clearCipherQuestStorage();

        runTest("startGame() initialises player correctly on easy", function () {
            GameState.startGame("TestAgent", "easy");

            return (
                GameState.player.name === "TestAgent" &&
                GameState.player.totalScore === 0 &&
                GameState.player.lives === 3 &&
                GameState.player.currentLevel === 1 &&
                GameState.player.hintsUsed === 0 &&
                GameState.currentLevel.levelNumber === 1 &&
                GameState.difficulty === "easy" &&
                GameState.status === "playing" &&
                GameState.attempts === 0 &&
                GameState.levelHintsUsed === 0 &&
                GameState.timeLeft === 120
            );
        });

        runTest("startGame() trims player name", function () {
            GameState.startGame("   AgentTrim   ", "easy");

            return GameState.player.name === "AgentTrim";
        });

        runTest("startGame() uses Agent when player name is empty", function () {
            GameState.startGame("   ", "easy");

            return GameState.player.name === "Agent";
        });

        runTest("startGame() limits long player name to 20 characters", function () {
            GameState.startGame("ABCDEFGHIJKLMNOPQRSTUVWXYZ", "easy");

            return GameState.player.name === "ABCDEFGHIJKLMNOPQRST";
        });

        runTest("startGame() defaults invalid difficulty to easy", function () {
            GameState.startGame("InvalidDifficultyAgent", "extreme");

            return (
                GameState.difficulty === "easy" &&
                GameState.timeLeft === 120 &&
                GameState.getHintsRemaining() === 3 &&
                GameState.getAttemptsRemaining() === 5
            );
        });

        Object.keys(EXPECTED_DIFFICULTY_SETTINGS).forEach((difficulty) => {
            runTest(`startGame() applies ${difficulty} difficulty settings`, function () {
                const expected = EXPECTED_DIFFICULTY_SETTINGS[difficulty];

                GameState.startGame(`${difficulty}Agent`, difficulty);

                return (
                    GameState.difficulty === difficulty &&
                    GameState.timeLeft === expected.timeLimit &&
                    GameState.getHintsRemaining() === expected.hintsAllowed &&
                    GameState.getAttemptsRemaining() === expected.maxAttempts
                );
            });
        });

        runTest("loadLevel() loads level 1 correctly", function () {
            GameState.startGame("LoadAgent", "easy");
            const loadedLevel = GameState.loadLevel(1);
            const expectedText = getExpectedEncryptedText(LEVELS[0]);

            return (
                loadedLevel !== null &&
                GameState.currentLevel.levelNumber === 1 &&
                GameState.player.currentLevel === 1 &&
                GameState.encryptedText === expectedText &&
                GameState.solution === LEVELS[0].plainText &&
                GameState.status === "playing"
            );
        });

        runTest("loadLevel() returns null and completes game for missing level", function () {
            GameState.startGame("MissingLevelAgent", "easy");
            const loadedLevel = GameState.loadLevel(999);

            return (
                loadedLevel === null &&
                GameState.currentLevel === null &&
                GameState.status === "complete"
            );
        });

        LEVELS.forEach((level) => {
            runTest(`loadLevel() encrypts level ${level.levelNumber} using ${level.cipherType}`, function () {
                GameState.startGame("EncryptionAgent", "easy");
                GameState.loadLevel(level.levelNumber);

                return (
                    GameState.currentLevel.levelNumber === level.levelNumber &&
                    GameState.encryptedText === getExpectedEncryptedText(level) &&
                    GameState.solution === level.plainText
                );
            });
        });

        runTest("submitAnswer() correct answer returns correct true and positive points", function () {
            GameState.startGame("CorrectAgent", "easy");

            const expectedPoints = getExpectedCorrectAnswerScore();
            const result = GameState.submitAnswer(GameState.solution);

            return (
                result.correct === true &&
                result.pointsEarned === expectedPoints &&
                result.pointsEarned > 0 &&
                GameState.player.totalScore === expectedPoints &&
                GameState.status === "paused"
            );
        });

        runTest("submitAnswer() accepts answer with different case and extra spacing", function () {
            GameState.startGame("NormaliseAgent", "easy");

            const result = GameState.submitAnswer("   PATCH    THE    GATE   ");

            return (
                result.correct === true &&
                GameState.status === "paused"
            );
        });

        runTest("submitAnswer() empty answer returns false with no penalty", function () {
            GameState.startGame("EmptyAnswerAgent", "easy");

            const scoreBefore = GameState.player.totalScore;
            const attemptsBefore = GameState.attempts;
            const result = GameState.submitAnswer("   ");

            return (
                result.correct === false &&
                result.pointsEarned === 0 &&
                GameState.player.totalScore === scoreBefore &&
                GameState.attempts === attemptsBefore &&
                GameState.status === "playing"
            );
        });

        runTest("submitAnswer() wrong answer returns false and deducts points", function () {
            GameState.startGame("WrongAgent", "easy");

            const scoreBefore = GameState.player.totalScore;
            const result = GameState.submitAnswer("wrong answer");

            return (
                result.correct === false &&
                result.pointsEarned === -WRONG_ANSWER_PENALTY &&
                GameState.player.totalScore === scoreBefore - WRONG_ANSWER_PENALTY &&
                GameState.attempts === 1 &&
                GameState.status === "playing"
            );
        });

        runTest("submitAnswer() does not accept answers when game is paused", function () {
            GameState.startGame("PausedAgent", "easy");
            GameState.submitAnswer(GameState.solution);

            const scoreBefore = GameState.player.totalScore;
            const result = GameState.submitAnswer(GameState.solution);

            return (
                result.correct === false &&
                result.pointsEarned === 0 &&
                GameState.player.totalScore === scoreBefore &&
                GameState.status === "paused"
            );
        });

        runTest("submitAnswer() handles no loaded level safely", function () {
            GameState.startGame("NoLevelAgent", "easy");
            GameState.currentLevel = null;

            const result = GameState.submitAnswer("anything");

            return (
                result.correct === false &&
                result.pointsEarned === 0
            );
        });

        Object.keys(EXPECTED_DIFFICULTY_SETTINGS).forEach((difficulty) => {
            runTest(`wrong answers reach max attempts and lose one life on ${difficulty}`, function () {
                const expected = EXPECTED_DIFFICULTY_SETTINGS[difficulty];

                GameState.startGame(`WrongFlow${difficulty}`, difficulty);
                useAllWrongAttempts(difficulty);

                return (
                    GameState.player.lives === 2 &&
                    GameState.attempts === 0 &&
                    GameState.player.totalScore === -(expected.maxAttempts * WRONG_ANSWER_PENALTY) &&
                    GameState.status === "playing" &&
                    GameState.timeLeft === expected.timeLimit
                );
            });
        });

        Object.keys(EXPECTED_DIFFICULTY_SETTINGS).forEach((difficulty) => {
            runTest(`three failed level attempts trigger gameover on ${difficulty}`, function () {
                GameState.startGame(`GameOver${difficulty}`, difficulty);

                useAllWrongAttempts(difficulty);
                useAllWrongAttempts(difficulty);
                useAllWrongAttempts(difficulty);

                return (
                    GameState.player.lives === 0 &&
                    GameState.status === "gameover"
                );
            });
        });

        runTest("useHint() reduces hints remaining by 1 and returns a string", function () {
            GameState.startGame("HintAgent", "easy");

            const hintsBefore = GameState.getHintsRemaining();
            const scoreBefore = GameState.player.totalScore;
            const hint = GameState.useHint();

            return (
                typeof hint === "string" &&
                hint.length > 0 &&
                GameState.getHintsRemaining() === hintsBefore - 1 &&
                GameState.levelHintsUsed === 1 &&
                GameState.player.hintsUsed === 1 &&
                GameState.player.totalScore === scoreBefore - HINT_PENALTY
            );
        });

        Object.keys(EXPECTED_DIFFICULTY_SETTINGS).forEach((difficulty) => {
            runTest(`useHint() allows correct number of hints on ${difficulty}`, function () {
                const expectedHints = EXPECTED_DIFFICULTY_SETTINGS[difficulty].hintsAllowed;

                GameState.startGame(`HintLimit${difficulty}`, difficulty);
                const returnedHints = useAllHints();
                const validHintCount = returnedHints
                    .slice(0, expectedHints)
                    .filter((hint) => typeof hint === "string" && hint.length > 0)
                    .length;

                return (
                    validHintCount === expectedHints &&
                    returnedHints[returnedHints.length - 1] === null &&
                    GameState.getHintsRemaining() === 0 &&
                    GameState.levelHintsUsed === expectedHints &&
                    GameState.player.hintsUsed === expectedHints
                );
            });
        });

        runTest("useHint() returns null when no hints remain", function () {
            GameState.startGame("NoHintsAgent", "easy");

            GameState.useHint();
            GameState.useHint();
            GameState.useHint();

            return GameState.useHint() === null;
        });

        runTest("useHint() returns null when game is paused", function () {
            GameState.startGame("PausedHintAgent", "easy");
            GameState.submitAnswer(GameState.solution);

            return GameState.useHint() === null;
        });

        runTest("useHint() returns null when game is over", function () {
            GameState.startGame("GameOverHintAgent", "hard");

            GameState.loseLife();
            GameState.loseLife();
            GameState.loseLife();

            return GameState.useHint() === null;
        });

        runTest("loseLife() reduces lives by 1", function () {
            GameState.startGame("LifeAgent", "easy");

            const livesBefore = GameState.player.lives;
            const livesAfter = GameState.loseLife();

            return (
                livesAfter === livesBefore - 1 &&
                GameState.player.lives === livesBefore - 1 &&
                GameState.status === "playing"
            );
        });

        runTest("loseLife() resets attempts to 0", function () {
            GameState.startGame("AttemptResetAgent", "easy");

            GameState.submitAnswer("wrong answer");
            GameState.submitAnswer("wrong answer");

            const attemptsBeforeLifeLoss = GameState.attempts;
            GameState.loseLife();

            return (
                attemptsBeforeLifeLoss === 2 &&
                GameState.attempts === 0
            );
        });

        runTest("loseLife() restores timeLeft to current difficulty limit", function () {
            GameState.startGame("TimeResetAgent", "medium");

            GameState.setTimeLeft(12);
            GameState.loseLife();

            return GameState.timeLeft === EXPECTED_DIFFICULTY_SETTINGS.medium.timeLimit;
        });

        runTest("loseLife() triggers gameover when lives reach 0", function () {
            GameState.startGame("LifeGameOverAgent", "easy");

            GameState.loseLife();
            GameState.loseLife();
            const livesAfter = GameState.loseLife();

            return (
                livesAfter === 0 &&
                GameState.player.lives === 0 &&
                GameState.status === "gameover"
            );
        });

        runTest("loseLife() does not reduce lives below 0", function () {
            GameState.startGame("BelowZeroAgent", "easy");

            GameState.loseLife();
            GameState.loseLife();
            GameState.loseLife();
            GameState.loseLife();

            return (
                GameState.player.lives === 0 &&
                GameState.status === "gameover"
            );
        });

        runTest("nextLevel() advances levelNumber correctly", function () {
            GameState.startGame("NextAgent", "easy");

            const currentLevelNumber = GameState.currentLevel.levelNumber;
            const nextLevel = GameState.nextLevel();

            return (
                nextLevel !== null &&
                nextLevel.levelNumber === currentLevelNumber + 1 &&
                GameState.currentLevel.levelNumber === 2 &&
                GameState.player.currentLevel === 2
            );
        });

        runTest("nextLevel() returns null if game is over", function () {
            GameState.startGame("NextGameOverAgent", "easy");

            GameState.loseLife();
            GameState.loseLife();
            GameState.loseLife();

            return GameState.nextLevel() === null;
        });

        runTest("nextLevel() returns null when no current level exists", function () {
            GameState.startGame("NoCurrentLevelAgent", "easy");
            GameState.currentLevel = null;

            return GameState.nextLevel() === null;
        });

        runTest("full correct-answer flow completes all levels and applies lives bonus", function () {
            GameState.startGame("FullFlowAgent", "easy");

            let allAnswersCorrect = true;
            let lastScoreBeforeCompletion = 0;

            LEVELS.forEach((level, index) => {
                if (!GameState.currentLevel || GameState.currentLevel.levelNumber !== level.levelNumber) {
                    allAnswersCorrect = false;
                    return;
                }

                const result = GameState.submitAnswer(level.plainText);

                if (!result.correct) {
                    allAnswersCorrect = false;
                    return;
                }

                lastScoreBeforeCompletion = GameState.player.totalScore;

                if (index < LEVELS.length - 1) {
                    const nextLevel = GameState.nextLevel();

                    if (!nextLevel || nextLevel.levelNumber !== level.levelNumber + 1) {
                        allAnswersCorrect = false;
                    }
                }
            });

            const finalNextLevel = GameState.nextLevel();
            const expectedBonus = GameState.player.lives * LIVES_BONUS_MULTIPLIER;

            return (
                allAnswersCorrect &&
                finalNextLevel === null &&
                GameState.status === "complete" &&
                GameState.livesBonusApplied === true &&
                GameState.player.totalScore === lastScoreBeforeCompletion + expectedBonus
            );
        });

        runTest("completeGame() does not apply lives bonus twice", function () {
            GameState.startGame("BonusAgent", "easy");

            GameState.completeGame();
            const scoreAfterFirstComplete = GameState.player.totalScore;

            GameState.completeGame();
            const scoreAfterSecondComplete = GameState.player.totalScore;

            return (
                scoreAfterFirstComplete === 300 &&
                scoreAfterSecondComplete === scoreAfterFirstComplete &&
                GameState.livesBonusApplied === true
            );
        });

        runTest("setTimeLeft() stores positive time correctly", function () {
            GameState.startGame("TimeAgent", "easy");

            GameState.setTimeLeft(45);

            return GameState.timeLeft === 45;
        });

        runTest("setTimeLeft() converts invalid time to 0", function () {
            GameState.startGame("InvalidTimeAgent", "easy");

            GameState.setTimeLeft("not a number");

            return GameState.timeLeft === 0;
        });

        runTest("setTimeLeft() prevents negative time", function () {
            GameState.startGame("NegativeTimeAgent", "easy");

            GameState.setTimeLeft(-50);

            return GameState.timeLeft === 0;
        });

        runTest("getAttemptsRemaining() decreases after wrong answer", function () {
            GameState.startGame("AttemptsRemainingAgent", "medium");

            const before = GameState.getAttemptsRemaining();
            GameState.submitAnswer("wrong answer");
            const after = GameState.getAttemptsRemaining();

            return (
                before === 3 &&
                after === 2
            );
        });

        runTest("getHintsRemaining() returns 0 when no current level exists", function () {
            GameState.startGame("NoLevelHintsAgent", "easy");
            GameState.currentLevel = null;

            return GameState.getHintsRemaining() === 0;
        });

        runTest("getAttemptsRemaining() returns 0 when no current level exists", function () {
            GameState.startGame("NoLevelAttemptsAgent", "easy");
            GameState.currentLevel = null;

            return GameState.getAttemptsRemaining() === 0;
        });

        runTest("saveToStorage() saves player and progress", function () {
            clearCipherQuestStorage();
            GameState.startGame("StorageAgent", "medium");
            GameState.setTimeLeft(33);

            const savedPlayer = localStorage.getItem(STORAGE_KEYS.PLAYER);
            const savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS));

            return (
                savedPlayer === "StorageAgent" &&
                savedProgress.player.name === "StorageAgent" &&
                savedProgress.difficulty === "medium" &&
                savedProgress.timeLeft === 33 &&
                savedProgress.status === "playing"
            );
        });

        runTest("loadFromStorage() restores saved player and progress", function () {
            clearCipherQuestStorage();

            GameState.startGame("RestoreAgent", "hard");
            GameState.loadLevel(3);
            GameState.setTimeLeft(22);
            GameState.submitAnswer("wrong answer");

            const restoredState = GameState.loadFromStorage();

            return (
                restoredState !== null &&
                GameState.player.name === "RestoreAgent" &&
                GameState.difficulty === "hard" &&
                GameState.currentLevel.levelNumber === 3 &&
                GameState.timeLeft === 22 &&
                GameState.attempts === 1
            );
        });

        runTest("loadFromStorage() returns null when no progress exists", function () {
            clearCipherQuestStorage();

            return GameState.loadFromStorage() === null;
        });

        runTest("loadFromStorage() returns null for invalid JSON progress", function () {
            clearCipherQuestStorage();
            localStorage.setItem(STORAGE_KEYS.PROGRESS, "{ broken json");

            return GameState.loadFromStorage() === null;
        });

        runTest("correct answer score includes edited timeLeft value", function () {
            GameState.startGame("EditedTimeScoreAgent", "easy");
            GameState.setTimeLeft(10);

            const result = GameState.submitAnswer(GameState.solution);

            return (
                result.correct === true &&
                result.pointsEarned === BASE_POINTS + 20 &&
                GameState.player.totalScore === BASE_POINTS + 20
            );
        });

        runTest("hint penalty and wrong answer penalty can both affect score", function () {
            GameState.startGame("PenaltyAgent", "easy");

            GameState.useHint();
            GameState.submitAnswer("wrong answer");

            return GameState.player.totalScore === -(HINT_PENALTY + WRONG_ANSWER_PENALTY);
        });

        runTest("loadLevel() resets attempts and level hints used", function () {
            GameState.startGame("ResetLevelAgent", "easy");

            GameState.useHint();
            GameState.submitAnswer("wrong answer");

            const hintsUsedBefore = GameState.levelHintsUsed;
            const attemptsBefore = GameState.attempts;

            GameState.loadLevel(2);

            return (
                hintsUsedBefore === 1 &&
                attemptsBefore === 1 &&
                GameState.levelHintsUsed === 0 &&
                GameState.attempts === 0 &&
                GameState.currentLevel.levelNumber === 2
            );
        });

        runTest("all levels accept their plainText as the correct answer", function () {
            let allLevelsPassed = true;

            LEVELS.forEach((level) => {
                GameState.startGame("AllLevelsAnswerAgent", "easy");
                GameState.loadLevel(level.levelNumber);

                const result = GameState.submitAnswer(level.plainText);

                if (!result.correct || result.pointsEarned <= 0) {
                    allLevelsPassed = false;
                }
            });

            return allLevelsPassed;
        });

        runTest("all difficulty options can complete level 1 with correct answer", function () {
            let allDifficultiesPassed = true;

            Object.keys(EXPECTED_DIFFICULTY_SETTINGS).forEach((difficulty) => {
                GameState.startGame(`CompleteLevelOne${difficulty}`, difficulty);

                const result = GameState.submitAnswer(GameState.solution);

                if (!result.correct || GameState.status !== "paused") {
                    allDifficultiesPassed = false;
                }
            });

            return allDifficultiesPassed;
        });
    } finally {
        restoreGameState(gameStateBackup);
        restoreStorage(storageBackup);
    }

    console.log(`Aggressive GameState tests complete. Passed: ${passedTests}. Failed: ${failedTests}.`);

    if (failedTests === 0) {
        console.log("All aggressive GameState tests passed.");
    } else {
        console.warn(`${failedTests} aggressive GameState test or tests failed. Check the FAIL messages above.`);
    }
})();