const Timer = (() => {
    const TIME_BONUS_MULTIPLIER = 2;
    const ONE_SECOND_MS = 1000;

    let intervalId = null;
    let timeLeft = 0;
    let tickCallback = null;
    let expireCallback = null;
    let isPaused = false;
    let isRunning = false;

    /**
     * Starts a new countdown timer.
     * @param {number} seconds - The starting time in seconds.
     * @param {Function} onTick - Callback called every second with the remaining seconds.
     * @param {Function} onExpire - Callback called when the timer reaches zero.
     * @returns {void}
     */
    function start(seconds, onTick, onExpire) {
        stop();

        timeLeft = normaliseSeconds(seconds);
        tickCallback = typeof onTick === "function" ? onTick : null;
        expireCallback = typeof onExpire === "function" ? onExpire : null;
        isPaused = false;
        isRunning = true;

        callTickCallback();

        if (timeLeft <= 0) {
            stop();
            callExpireCallback();
            return;
        }

        intervalId = setInterval(() => {
            if (isPaused) {
                return;
            }

            timeLeft = Math.max(0, timeLeft - 1);
            callTickCallback();

            if (timeLeft <= 0) {
                stop();
                callExpireCallback();
            }
        }, ONE_SECOND_MS);
    }

    /**
     * Stops the timer and clears the active interval.
     * @returns {void}
     */
    function stop() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }

        isRunning = false;
        isPaused = false;
    }

    /**
     * Pauses the timer without resetting the remaining time.
     * @returns {void}
     */
    function pause() {
        if (!isRunning || intervalId === null) {
            return;
        }

        isPaused = true;
    }

    /**
     * Resumes the timer from the remaining time.
     * @returns {void}
     */
    function resume() {
        if (!isRunning || intervalId === null || timeLeft <= 0) {
            return;
        }

        isPaused = false;
    }

    /**
     * Gets the remaining time.
     * @returns {number} Remaining seconds.
     */
    function getTimeLeft() {
        return timeLeft;
    }

    /**
     * Calculates the time bonus using the Cipher Quest scoring formula.
     * @returns {number} Bonus points from remaining time.
     */
    function getTimeBonus() {
        return timeLeft * TIME_BONUS_MULTIPLIER;
    }

    /**
     * Converts a value into a safe whole number of seconds.
     * @param {number} seconds - The raw seconds value.
     * @returns {number} A safe countdown value.
     */
    function normaliseSeconds(seconds) {
        const parsedSeconds = Number(seconds);

        if (!Number.isFinite(parsedSeconds) || parsedSeconds < 0) {
            return 0;
        }

        return Math.floor(parsedSeconds);
    }

    /**
     * Safely calls the tick callback.
     * @returns {void}
     */
    function callTickCallback() {
        if (tickCallback) {
            tickCallback(timeLeft);
        }
    }

    /**
     * Safely calls the expire callback.
     * @returns {void}
     */
    function callExpireCallback() {
        if (expireCallback) {
            expireCallback();
        }
    }

    return {
        start,
        stop,
        pause,
        resume,
        getTimeLeft,
        getTimeBonus
    };
})();