const UIController = (() => {
    const SCREEN_SELECTOR = ".screen";
    const ACTIVE_CLASS = "active";
    const HIDDEN_CLASS = "hidden";
    const TIMER_WARNING_CLASS = "timer-warning";
    const SCREEN_ANIMATION_CLASS = "screen-animating";

    const SCREEN_ANIMATION_DURATION_MS = 220;
    const FEEDBACK_VISIBLE_DURATION_MS = 2200;
    const CORRECT_FLASH_DURATION_MS = 250;
    const WRONG_SHAKE_DURATION_MS = 220;

    let feedbackTimeoutId = null;
    let screenAnimationTimeoutId = null;
    const temporaryClassTimeouts = new WeakMap();

    /**
     * Hides all SPA screens and shows only the selected screen.
     * @param {string} screenId - The ID of the screen to display.
     * @returns {void}
     */
    function showScreen(screenId) {
        const screens = document.querySelectorAll(SCREEN_SELECTOR);
        const targetScreen = document.getElementById(screenId);

        if (!targetScreen) {
            console.warn(`Screen not found: ${screenId}`);
            return;
        }

        screens.forEach((screen) => {
            screen.classList.remove(ACTIVE_CLASS);
            screen.classList.add(HIDDEN_CLASS);
        });

        targetScreen.classList.remove(HIDDEN_CLASS);
        targetScreen.classList.add(ACTIVE_CLASS);

        animateTransition();
    }

    /**
     * Updates the visible countdown timer and applies warning styling under 10 seconds.
     * @param {number} seconds - The number of seconds remaining.
     * @returns {void}
     */
    function updateTimer(seconds) {
        const timerDisplay = document.getElementById("timer-display");

        if (!timerDisplay) {
            return;
        }

        const safeSeconds = Math.max(0, Number(seconds) || 0);
        timerDisplay.textContent = String(safeSeconds).padStart(2, "0");

        if (safeSeconds < 10 && safeSeconds > 0) {
            timerDisplay.classList.add(TIMER_WARNING_CLASS);
        } else {
            timerDisplay.classList.remove(TIMER_WARNING_CLASS);
        }
    }

    /**
     * Shows a short feedback message for player actions.
     * @param {string} message - The feedback text to display.
     * @param {"correct"|"wrong"|"info"} type - The feedback type.
     * @returns {void}
     */
    function showFeedback(message, type = "info") {
        const feedback = document.getElementById("game-feedback");
        const gameScreen = document.getElementById("screen-game");
        const answerInput = document.getElementById("answer-input");

        if (!feedback) {
            return;
        }

        const validTypes = ["correct", "wrong", "info"];
        const feedbackType = validTypes.includes(type) ? type : "info";

        clearTimeout(feedbackTimeoutId);

        feedback.textContent = message;
        feedback.className = "feedback-message";

        if (feedbackType === "correct") {
            feedback.classList.add("success");
            triggerTemporaryClass(gameScreen, "correct-flash", CORRECT_FLASH_DURATION_MS);
        } else if (feedbackType === "wrong") {
            feedback.classList.add("warning");
            triggerTemporaryClass(answerInput, "wrong-shake", WRONG_SHAKE_DURATION_MS);
        }

        feedbackTimeoutId = setTimeout(() => {
            feedback.textContent = "";
            feedback.className = "feedback-message";
        }, FEEDBACK_VISIBLE_DURATION_MS);
    }

    /**
     * Renders leaderboard entries inside the leaderboard table body.
     * @param {{name: string, score: number, date: string}[]} entries - Leaderboard data.
     * @returns {void}
     */
    function renderLeaderboard(entries) {
        const leaderboardBody = document.getElementById("leaderboard-body");

        if (!leaderboardBody) {
            return;
        }

        if (!Array.isArray(entries) || entries.length === 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="4">No scores saved yet.</td>
                </tr>
            `;
            return;
        }

        const topEntries = entries.slice(0, 10);

        leaderboardBody.innerHTML = topEntries
            .map((entry, index) => {
                const rank = index + 1;
                const name = escapeHTML(entry.name || "Unknown");
                const score = Number(entry.score) || 0;
                const date = escapeHTML(entry.date || "No date");

                return `
                    <tr>
                        <td>${rank}</td>
                        <td>${name}</td>
                        <td>${score}</td>
                        <td>${date}</td>
                    </tr>
                `;
            })
            .join("");
    }

    /**
     * Starts the lightweight transition animation for the currently active screen.
     * @returns {void}
     */
    function animateTransition() {
        const activeScreenContent = document.querySelector(`.${ACTIVE_CLASS} .screen-content`);

        if (!activeScreenContent) {
            return;
        }

        clearTimeout(screenAnimationTimeoutId);
        activeScreenContent.classList.remove(SCREEN_ANIMATION_CLASS);

        requestAnimationFrame(() => {
            activeScreenContent.classList.add(SCREEN_ANIMATION_CLASS);

            screenAnimationTimeoutId = setTimeout(() => {
                activeScreenContent.classList.remove(SCREEN_ANIMATION_CLASS);
            }, SCREEN_ANIMATION_DURATION_MS);
        });
    }

    /**
     * Adds a class briefly, then removes it after a delay without forcing layout.
     * @param {HTMLElement|null} element - The element receiving the class.
     * @param {string} className - The class to apply temporarily.
     * @param {number} duration - Duration in milliseconds.
     * @returns {void}
     */
    function triggerTemporaryClass(element, className, duration) {
        if (!element) {
            return;
        }

        const existingTimeouts = temporaryClassTimeouts.get(element) || {};

        if (existingTimeouts[className]) {
            clearTimeout(existingTimeouts[className]);
        }

        element.classList.remove(className);

        requestAnimationFrame(() => {
            element.classList.add(className);

            existingTimeouts[className] = setTimeout(() => {
                element.classList.remove(className);
                delete existingTimeouts[className];
            }, duration);

            temporaryClassTimeouts.set(element, existingTimeouts);
        });
    }

    /**
     * Escapes text before inserting it into table HTML.
     * @param {string} value - The text to escape.
     * @returns {string} Safe HTML text.
     */
    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    return {
        showScreen,
        updateTimer,
        showFeedback,
        renderLeaderboard,
        animateTransition
    };
})();