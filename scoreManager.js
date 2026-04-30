const ScoreManager = (() => {
    const LEADERBOARD_KEY = "cq_leaderboard";
    const PROGRESS_KEY = "cq_progress";
    const MAX_LEADERBOARD_ENTRIES = 10;
    const LIFE_BONUS_POINTS = 100;

    /**
     * Adds a new score entry to the leaderboard, sorts by highest score, and keeps only the top 10.
     * @param {string} name - The player's name.
     * @param {number} score - The player's final score.
     * @returns {{name: string, score: number, date: string, levelsCompleted: number}[]} The updated leaderboard.
     */
    function addEntry(name, score) {
        const leaderboard = getLeaderboard();

        const newEntry = {
            name: sanitiseName(name),
            score: sanitiseScore(score),
            date: formatDate(),
            levelsCompleted: getStoredLevelsCompleted()
        };

        leaderboard.push(newEntry);

        const sortedLeaderboard = sortLeaderboard(leaderboard).slice(0, MAX_LEADERBOARD_ENTRIES);
        saveLeaderboard(sortedLeaderboard);

        return sortedLeaderboard;
    }

    /**
     * Gets the saved leaderboard sorted by score from highest to lowest.
     * @returns {{name: string, score: number, date: string, levelsCompleted: number}[]} The top 10 leaderboard entries.
     */
    function getLeaderboard() {
        const leaderboard = loadLeaderboard();
        return sortLeaderboard(leaderboard).slice(0, MAX_LEADERBOARD_ENTRIES);
    }

    /**
     * Clears all leaderboard entries from localStorage.
     * @returns {void}
     */
    function clearLeaderboard() {
        try {
            localStorage.removeItem(LEADERBOARD_KEY);
        } catch (error) {
            console.warn("Unable to clear leaderboard.", error);
        }
    }

    /**
     * Formats today's date as DD/MM/YYYY.
     * @returns {string} Today's date.
     */
    function formatDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();

        return `${day}/${month}/${year}`;
    }

    /**
     * Calculates the final lives bonus using 100 points per remaining life.
     * @param {number} livesRemaining - The number of lives left at the end of the game.
     * @returns {number} The final lives bonus.
     */
    function calculateFinalBonus(livesRemaining) {
        const safeLives = Math.max(0, Number(livesRemaining) || 0);
        return safeLives * LIFE_BONUS_POINTS;
    }

    /**
     * Loads leaderboard data from localStorage.
     * @returns {{name: string, score: number, date: string, levelsCompleted: number}[]} Saved leaderboard entries.
     */
    function loadLeaderboard() {
        try {
            const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY);

            if (!savedLeaderboard) {
                return [];
            }

            const parsedLeaderboard = JSON.parse(savedLeaderboard);

            if (!Array.isArray(parsedLeaderboard)) {
                return [];
            }

            return parsedLeaderboard.map((entry) => ({
                name: sanitiseName(entry.name),
                score: sanitiseScore(entry.score),
                date: String(entry.date || "No date"),
                levelsCompleted: sanitiseLevelsCompleted(entry.levelsCompleted)
            }));
        } catch (error) {
            console.warn("Unable to load leaderboard.", error);
            return [];
        }
    }

    /**
     * Saves leaderboard data to localStorage.
     * @param {{name: string, score: number, date: string, levelsCompleted: number}[]} leaderboard - The leaderboard entries to save.
     * @returns {void}
     */
    function saveLeaderboard(leaderboard) {
        try {
            localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
        } catch (error) {
            console.warn("Unable to save leaderboard.", error);
        }
    }

    /**
     * Sorts leaderboard entries by score in descending order.
     * @param {{name: string, score: number, date: string, levelsCompleted: number}[]} leaderboard - The leaderboard entries.
     * @returns {{name: string, score: number, date: string, levelsCompleted: number}[]} Sorted leaderboard entries.
     */
    function sortLeaderboard(leaderboard) {
        return [...leaderboard].sort((a, b) => b.score - a.score);
    }

    /**
     * Cleans the player name before saving it.
     * @param {string} name - The raw player name.
     * @returns {string} A safe player name.
     */
    function sanitiseName(name) {
        const cleanName = String(name || "").trim();

        if (cleanName.length === 0) {
            return "Agent";
        }

        return cleanName.slice(0, 20);
    }

    /**
     * Converts a score value into a safe whole number.
     * @param {number} score - The raw score value.
     * @returns {number} A safe score.
     */
    function sanitiseScore(score) {
        const parsedScore = Number(score);

        if (!Number.isFinite(parsedScore)) {
            return 0;
        }

        return Math.max(0, Math.floor(parsedScore));
    }

    /**
     * Converts completed level data into a safe whole number.
     * @param {number} levelsCompleted - The raw completed level count.
     * @returns {number} A safe completed level count.
     */
    function sanitiseLevelsCompleted(levelsCompleted) {
        const parsedLevels = Number(levelsCompleted);

        if (!Number.isFinite(parsedLevels)) {
            return 0;
        }

        return Math.max(0, Math.floor(parsedLevels));
    }

    /**
     * Gets completed level count from saved game progress.
     * @returns {number} The number of completed levels.
     */
    function getStoredLevelsCompleted() {
        try {
            const savedProgress = localStorage.getItem(PROGRESS_KEY);

            if (!savedProgress) {
                return 0;
            }

            const progress = JSON.parse(savedProgress);
            const currentLevelNumber = Number(progress.currentLevelNumber || progress.player?.currentLevel || 1);

            if (progress.status === "complete") {
                return currentLevelNumber;
            }

            return Math.max(0, currentLevelNumber - 1);
        } catch (error) {
            console.warn("Unable to read completed levels.", error);
            return 0;
        }
    }

    return {
        addEntry,
        getLeaderboard,
        clearLeaderboard,
        formatDate,
        calculateFinalBonus
    };
})();