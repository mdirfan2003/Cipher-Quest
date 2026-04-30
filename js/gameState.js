const GameState = (() => {
    const STORAGE_KEYS = Object.freeze({
        PLAYER: "cq_player",
        PROGRESS: "cq_progress"
    });

    const GAME_STATUS = Object.freeze({
        IDLE: "idle",
        PLAYING: "playing",
        PAUSED: "paused",
        GAMEOVER: "gameover",
        COMPLETE: "complete"
    });

    const DIFFICULTY_SETTINGS = Object.freeze({
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

    const state = {
        player: createDefaultPlayer(),
        currentLevel: null,
        encryptedText: "",
        solution: "",
        difficulty: "easy",
        status: GAME_STATUS.IDLE,
        attempts: 0,
        timeLeft: 0,
        levelHintsUsed: 0,
        lastLevelScore: {
            levelNumber: 0,
            basePoints: 0,
            timeBonus: 0,
            pointsEarned: 0
        },
        livesBonusApplied: false,

        /**
         * Starts a new game session and loads level 1.
         * @param {string} playerName - The name entered by the player.
         * @param {"easy"|"medium"|"hard"} difficulty - The selected difficulty.
         * @returns {object|null} The loaded level object, or null if no level is available.
         */
        startGame(playerName, difficulty) {
            const cleanName = sanitisePlayerName(playerName);

            this.player = {
                name: cleanName,
                totalScore: 0,
                lives: 3,
                currentLevel: 1,
                hintsUsed: 0
            };

            this.difficulty = getValidDifficulty(difficulty);
            this.status = GAME_STATUS.PLAYING;
            this.attempts = 0;
            this.timeLeft = 0;
            this.levelHintsUsed = 0;
            this.livesBonusApplied = false;

            const loadedLevel = this.loadLevel(1);
            this.saveToStorage();

            return loadedLevel;
        },

        /**
         * Loads a level by level number and prepares the encrypted challenge text.
         * @param {number} levelNumber - The level number to load.
         * @returns {object|null} The matching level object, or null if not found.
         */
        loadLevel(levelNumber) {
            const level = findLevelByNumber(levelNumber);

            if (!level) {
                this.status = GAME_STATUS.COMPLETE;
                this.currentLevel = null;
                this.saveToStorage();
                return null;
            }

            this.currentLevel = level;
            this.player.currentLevel = level.levelNumber;
            this.encryptedText = generateEncryptedText(level);
            this.solution = String(level.plainText);
            this.attempts = 0;
            this.levelHintsUsed = 0;
            this.timeLeft = getTimeLimit(this.difficulty, level);
            this.status = GAME_STATUS.PLAYING;

            this.lastLevelScore = {
                levelNumber: level.levelNumber,
                basePoints: 0,
                timeBonus: 0,
                pointsEarned: 0
            };

            this.saveToStorage();

            return this.currentLevel;
        },

        /**
         * Validates the player's answer against the current level solution.
         * @param {string} answer - The answer entered by the player.
         * @returns {{correct: boolean, pointsEarned: number, message: string}} The answer result.
         */
        submitAnswer(answer) {
            if (this.status !== GAME_STATUS.PLAYING) {
                return {
                    correct: false,
                    pointsEarned: 0,
                    message: "The game is not currently accepting answers."
                };
            }

            if (!this.currentLevel) {
                return {
                    correct: false,
                    pointsEarned: 0,
                    message: "No level is currently loaded."
                };
            }

            const cleanAnswer = normaliseAnswer(answer);
            const cleanSolution = normaliseAnswer(this.solution);

            if (cleanAnswer.length === 0) {
                return {
                    correct: false,
                    pointsEarned: 0,
                    message: "Enter an answer before submitting."
                };
            }

            if (cleanAnswer === cleanSolution) {
                const basePoints = BASE_POINTS;
                const timeBonus = Math.max(0, this.timeLeft) * TIME_BONUS_MULTIPLIER;
                const pointsEarned = basePoints + timeBonus;

                this.player.totalScore += pointsEarned;
                this.status = GAME_STATUS.PAUSED;

                this.lastLevelScore = {
                    levelNumber: this.currentLevel.levelNumber,
                    basePoints,
                    timeBonus,
                    pointsEarned
                };

                this.saveToStorage();

                return {
                    correct: true,
                    pointsEarned,
                    message: "Correct. Cipher decoded."
                };
            }

            this.attempts += 1;
            this.player.totalScore -= WRONG_ANSWER_PENALTY;

            if (this.attempts >= getMaxAttempts(this.difficulty, this.currentLevel)) {
                const livesLeft = this.loseLife();

                if (livesLeft <= 0) {
                    return {
                        correct: false,
                        pointsEarned: -WRONG_ANSWER_PENALTY,
                        message: "Maximum attempts reached. Game over."
                    };
                }

                return {
                    correct: false,
                    pointsEarned: -WRONG_ANSWER_PENALTY,
                    message: "Maximum attempts reached. One life lost. Try the level again."
                };
            }

            this.saveToStorage();

            return {
                correct: false,
                pointsEarned: -WRONG_ANSWER_PENALTY,
                message: `Incorrect. Attempts remaining: ${this.getAttemptsRemaining()}.`
            };
        },

        /**
         * Gives the next available hint and applies the hint score penalty.
         * @returns {string|null} The next hint text, or null if no hints remain.
         */
        useHint() {
            if (this.status !== GAME_STATUS.PLAYING || !this.currentLevel) {
                return null;
            }

            const hintsAllowed = getHintsAllowed(this.difficulty, this.currentLevel);
            const availableHints = Array.isArray(this.currentLevel.hints) ? this.currentLevel.hints : [];

            if (this.levelHintsUsed >= hintsAllowed || this.levelHintsUsed >= availableHints.length) {
                return null;
            }

            const hint = availableHints[this.levelHintsUsed];

            this.levelHintsUsed += 1;
            this.player.hintsUsed += 1;
            this.player.totalScore -= HINT_PENALTY;

            this.saveToStorage();

            return hint;
        },

        /**
         * Advances the player to the next level or completes the game.
         * @returns {object|null} The next level object, or null when the game is complete.
         */
        nextLevel() {
            if (!this.currentLevel || this.status === GAME_STATUS.GAMEOVER) {
                return null;
            }

            const nextLevelNumber = this.currentLevel.levelNumber + 1;

            if (nextLevelNumber > LEVELS.length) {
                this.completeGame();
                return null;
            }

            return this.loadLevel(nextLevelNumber);
        },

        /**
         * Deducts one life and triggers game over when no lives remain.
         * @returns {number} The number of lives remaining.
         */
        loseLife() {
            this.player.lives = Math.max(0, this.player.lives - 1);
            this.attempts = 0;

            if (this.currentLevel) {
                this.timeLeft = getTimeLimit(this.difficulty, this.currentLevel);
            }

            if (this.player.lives <= 0) {
                this.status = GAME_STATUS.GAMEOVER;
            } else {
                this.status = GAME_STATUS.PLAYING;
            }

            this.saveToStorage();

            return this.player.lives;
        },

        /**
         * Marks the game as complete and adds the final lives bonus once.
         * @returns {void}
         */
        completeGame() {
            if (!this.livesBonusApplied) {
                this.player.totalScore += this.player.lives * LIVES_BONUS_MULTIPLIER;
                this.livesBonusApplied = true;
            }

            this.status = GAME_STATUS.COMPLETE;
            this.saveToStorage();
        },

        /**
         * Saves the current player and progress data to localStorage.
         * @returns {boolean} True if saving succeeded, otherwise false.
         */
        saveToStorage() {
            if (!isLocalStorageAvailable()) {
                return false;
            }

            const progress = {
                player: this.player,
                currentLevelNumber: this.player.currentLevel,
                difficulty: this.difficulty,
                status: this.status,
                attempts: this.attempts,
                timeLeft: this.timeLeft,
                levelHintsUsed: this.levelHintsUsed,
                lastLevelScore: this.lastLevelScore,
                livesBonusApplied: this.livesBonusApplied
            };

            try {
                localStorage.setItem(STORAGE_KEYS.PLAYER, this.player.name);
                localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
                return true;
            } catch (error) {
                console.warn("Unable to save game progress.", error);
                return false;
            }
        },

        /**
         * Loads saved player and progress data from localStorage.
         * @returns {object|null} The restored GameState object, or null when no save exists.
         */
        loadFromStorage() {
            if (!isLocalStorageAvailable()) {
                return null;
            }

            try {
                const savedProgress = localStorage.getItem(STORAGE_KEYS.PROGRESS);

                if (!savedProgress) {
                    return null;
                }

                const progress = JSON.parse(savedProgress);
                const storedPlayerName = localStorage.getItem(STORAGE_KEYS.PLAYER);

                this.player = {
                    ...createDefaultPlayer(),
                    ...progress.player,
                    name: storedPlayerName || progress.player?.name || "Agent"
                };

                this.difficulty = getValidDifficulty(progress.difficulty);
                this.status = getValidStatus(progress.status);
                this.attempts = Number(progress.attempts) || 0;
                this.levelHintsUsed = Number(progress.levelHintsUsed) || 0;
                this.lastLevelScore = progress.lastLevelScore || {
                    levelNumber: 0,
                    basePoints: 0,
                    timeBonus: 0,
                    pointsEarned: 0
                };
                this.livesBonusApplied = Boolean(progress.livesBonusApplied);

                const levelNumber = Number(progress.currentLevelNumber || this.player.currentLevel || 1);
                const level = findLevelByNumber(levelNumber);

                if (!level) {
                    this.currentLevel = null;
                    this.encryptedText = "";
                    this.solution = "";
                    return this;
                }

                this.currentLevel = level;
                this.player.currentLevel = level.levelNumber;
                this.encryptedText = generateEncryptedText(level);
                this.solution = String(level.plainText);
                this.timeLeft = Number(progress.timeLeft) || getTimeLimit(this.difficulty, level);

                return this;
            } catch (error) {
                console.warn("Unable to load saved game progress.", error);
                return null;
            }
        },

        /**
         * Updates the stored time left value from the timer module.
         * @param {number} seconds - The number of seconds remaining.
         * @returns {void}
         */
        setTimeLeft(seconds) {
            this.timeLeft = Math.max(0, Number(seconds) || 0);
            this.saveToStorage();
        },

        /**
         * Gets the number of attempts remaining for the current level.
         * @returns {number} Attempts remaining.
         */
        getAttemptsRemaining() {
            if (!this.currentLevel) {
                return 0;
            }

            return Math.max(0, getMaxAttempts(this.difficulty, this.currentLevel) - this.attempts);
        },

        /**
         * Gets the number of hints remaining for the current level.
         * @returns {number} Hints remaining.
         */
        getHintsRemaining() {
            if (!this.currentLevel) {
                return 0;
            }

            return Math.max(0, getHintsAllowed(this.difficulty, this.currentLevel) - this.levelHintsUsed);
        }
    };

    /**
     * Creates a default player object.
     * @returns {{name: string, totalScore: number, lives: number, currentLevel: number, hintsUsed: number}} Default player data.
     */
    function createDefaultPlayer() {
        return {
            name: "Agent",
            totalScore: 0,
            lives: 3,
            currentLevel: 1,
            hintsUsed: 0
        };
    }

    /**
     * Finds a level object from the LEVELS array.
     * @param {number} levelNumber - The level number to find.
     * @returns {object|null} The matching level object, or null.
     */
    function findLevelByNumber(levelNumber) {
        return LEVELS.find((level) => level.levelNumber === Number(levelNumber)) || null;
    }

    /**
     * Generates the encrypted text for a level using the matching CipherEngine function.
     * @param {object} level - The level object.
     * @returns {string} The encrypted text.
     */
    function generateEncryptedText(level) {
        const cipherFunction = CipherEngine[level.cipherType];

        if (typeof cipherFunction !== "function") {
            console.warn(`Cipher function not found: ${level.cipherType}`);
            return String(level.plainText);
        }

        return cipherFunction(level.plainText, level.key);
    }

    /**
     * Cleans and limits the player name.
     * @param {string} playerName - The raw player name.
     * @returns {string} The cleaned player name.
     */
    function sanitisePlayerName(playerName) {
        const cleanName = String(playerName || "").trim();

        if (cleanName.length === 0) {
            return "Agent";
        }

        return cleanName.slice(0, 20);
    }

    /**
     * Normalises answer text for fair validation.
     * @param {string} value - The text to normalise.
     * @returns {string} The normalised answer.
     */
    function normaliseAnswer(value) {
        return String(value || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }

    /**
     * Gets a safe difficulty value.
     * @param {string} difficulty - The requested difficulty.
     * @returns {"easy"|"medium"|"hard"} A valid difficulty.
     */
    function getValidDifficulty(difficulty) {
        return Object.prototype.hasOwnProperty.call(DIFFICULTY_SETTINGS, difficulty)
            ? difficulty
            : "easy";
    }

    /**
     * Gets a safe game status value.
     * @param {string} status - The requested status.
     * @returns {"idle"|"playing"|"paused"|"gameover"|"complete"} A valid game status.
     */
    function getValidStatus(status) {
        return Object.values(GAME_STATUS).includes(status) ? status : GAME_STATUS.IDLE;
    }

    /**
     * Gets the difficulty settings object.
     * @param {string} difficulty - The selected difficulty.
     * @returns {{timeLimit: number, hintsAllowed: number, maxAttempts: number}} Difficulty settings.
     */
    function getDifficultySettings(difficulty) {
        return DIFFICULTY_SETTINGS[getValidDifficulty(difficulty)];
    }

    /**
     * Gets the time limit for the current difficulty.
     * @param {string} difficulty - The selected difficulty.
     * @param {object} level - The current level object.
     * @returns {number} Time limit in seconds.
     */
    function getTimeLimit(difficulty, level) {
        return getDifficultySettings(difficulty).timeLimit || Number(level.timeLimit) || 60;
    }

    /**
     * Gets the allowed hint count for the current difficulty.
     * @param {string} difficulty - The selected difficulty.
     * @param {object} level - The current level object.
     * @returns {number} Number of hints allowed.
     */
    function getHintsAllowed(difficulty, level) {
        return getDifficultySettings(difficulty).hintsAllowed || Number(level.hintsAllowed) || 1;
    }

    /**
     * Gets the maximum attempt count for the current difficulty.
     * @param {string} difficulty - The selected difficulty.
     * @param {object} level - The current level object.
     * @returns {number} Maximum attempts allowed.
     */
    function getMaxAttempts(difficulty, level) {
        return getDifficultySettings(difficulty).maxAttempts || Number(level.maxAttempts) || 3;
    }

    /**
     * Checks whether localStorage can be used safely.
     * @returns {boolean} True if localStorage is available.
     */
    function isLocalStorageAvailable() {
        try {
            const testKey = "__cq_storage_test__";
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    return state;
})();