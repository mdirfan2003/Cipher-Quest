const SoundManager = (() => {
    const STORAGE_KEY = "cq_sound_muted";
    const TOGGLE_BUTTON_ID = "btn-sound-toggle";
    const MASTER_VOLUME = 0.55;
    const MIN_GAIN = 0.0001;
    const DEFAULT_ATTACK = 0.01;
    const DEFAULT_RELEASE = 0.03;

    let audioContext = null;
    let isMuted = loadMutedState();
    let muteToggleButton = null;

    /**
     * Unlocks the AudioContext after a user interaction.
     * @returns {boolean} True when the AudioContext is available.
     */
    function unlock() {
        const context = getAudioContext();

        if (!context) {
            return false;
        }

        if (context.state === "suspended") {
            context.resume().catch((error) => {
                console.warn("Unable to resume audio context.", error);
            });
        }

        return true;
    }

    /**
     * Plays a short ascending tone for a correct answer.
     * @returns {void}
     */
    function playCorrect() {
        playNotes([
            { frequency: 520, duration: 0.09, type: "sine", volume: 0.22 },
            { frequency: 700, duration: 0.1, type: "sine", volume: 0.22 },
            { frequency: 880, duration: 0.12, type: "triangle", volume: 0.2 }
        ]);
    }

    /**
     * Plays a short buzzer sound for a wrong answer.
     * @returns {void}
     */
    function playWrong() {
        playTone({
            frequency: 170,
            endFrequency: 95,
            duration: 0.32,
            type: "sawtooth",
            volume: 0.2
        });
    }

    /**
     * Plays a short triumphant jingle when the player moves up a level.
     * @returns {void}
     */
    function playLevelUp() {
        playNotes([
            { frequency: 523.25, duration: 0.08, type: "triangle", volume: 0.2 },
            { frequency: 659.25, duration: 0.08, type: "triangle", volume: 0.2 },
            { frequency: 783.99, duration: 0.1, type: "triangle", volume: 0.2 },
            { frequency: 1046.5, duration: 0.18, type: "sine", volume: 0.18 }
        ]);
    }

    /**
     * Plays a descending sad tone for game over.
     * @returns {void}
     */
    function playGameOver() {
        playNotes([
            { frequency: 392, duration: 0.16, type: "sine", volume: 0.2 },
            { frequency: 293.66, duration: 0.18, type: "sine", volume: 0.19 },
            { frequency: 196, duration: 0.24, type: "triangle", volume: 0.18 }
        ]);
    }

    /**
     * Plays a single warning beep when the timer is low.
     * @returns {void}
     */
    function playTimerWarning() {
        playTone({
            frequency: 880,
            duration: 0.09,
            type: "square",
            volume: 0.12
        });
    }

    /**
     * Plays a soft click when a hint is used.
     * @returns {void}
     */
    function playHint() {
        playTone({
            frequency: 360,
            endFrequency: 260,
            duration: 0.055,
            type: "triangle",
            volume: 0.09
        });
    }

    /**
     * Creates or connects a mute toggle button.
     * @param {string} parentSelector - The selector where the button should be added.
     * @returns {HTMLButtonElement|null} The mute toggle button.
     */
    function createMuteToggle(parentSelector = "body") {
        let button = document.getElementById(TOGGLE_BUTTON_ID);

        if (!button) {
            const parent = document.querySelector(parentSelector) || document.body;

            button = document.createElement("button");
            button.type = "button";
            button.id = TOGGLE_BUTTON_ID;
            button.className = "sound-toggle";

            parent.appendChild(button);
        }

        muteToggleButton = button;

        if (!muteToggleButton.dataset.soundListenerAttached) {
            muteToggleButton.addEventListener("click", () => {
                unlock();
                toggleMute();
            });

            muteToggleButton.dataset.soundListenerAttached = "true";
        }

        updateMuteToggleButton();

        return muteToggleButton;
    }

    /**
     * Toggles sound between muted and unmuted.
     * @returns {boolean} True when sound is muted.
     */
    function toggleMute() {
        return setMuted(!isMuted);
    }

    /**
     * Sets the muted state.
     * @param {boolean} shouldMute - Whether the game should be muted.
     * @returns {boolean} True when sound is muted.
     */
    function setMuted(shouldMute) {
        isMuted = Boolean(shouldMute);
        saveMutedState(isMuted);
        updateMuteToggleButton();

        return isMuted;
    }

    /**
     * Gets the current muted state.
     * @returns {boolean} True when sound is muted.
     */
    function getMuted() {
        return isMuted;
    }

    /**
     * Plays a sequence of notes.
     * @param {{frequency: number, endFrequency?: number, duration: number, type?: OscillatorType, volume?: number, gap?: number}[]} notes - Notes to play.
     * @returns {void}
     */
    function playNotes(notes) {
        if (!Array.isArray(notes)) {
            return;
        }

        let delay = 0;

        notes.forEach((note) => {
            const duration = normaliseDuration(note.duration);
            const gap = normaliseGap(note.gap);

            playTone({
                ...note,
                duration,
                delay
            });

            delay += duration + gap;
        });
    }

    /**
     * Plays one oscillator tone with a short gain envelope.
     * @param {{frequency: number, endFrequency?: number, duration: number, type?: OscillatorType, volume?: number, delay?: number}} options - Tone options.
     * @returns {void}
     */
    function playTone(options) {
        if (isMuted) {
            return;
        }

        const context = getAudioContext();

        if (!context) {
            return;
        }

        if (context.state === "suspended") {
            context.resume().catch((error) => {
                console.warn("Unable to resume audio context.", error);
            });
        }

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        const delay = normaliseDelay(options.delay);
        const startTime = context.currentTime + delay;
        const duration = normaliseDuration(options.duration);
        const endTime = startTime + duration;

        const startFrequency = normaliseFrequency(options.frequency);
        const endFrequency = normaliseFrequency(options.endFrequency || startFrequency);
        const volume = normaliseVolume(options.volume);

        oscillator.type = options.type || "sine";
        oscillator.frequency.setValueAtTime(startFrequency, startTime);

        if (endFrequency !== startFrequency) {
            oscillator.frequency.linearRampToValueAtTime(endFrequency, endTime);
        }

        gainNode.gain.setValueAtTime(MIN_GAIN, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * MASTER_VOLUME, startTime + DEFAULT_ATTACK);
        gainNode.gain.exponentialRampToValueAtTime(MIN_GAIN, endTime);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(startTime);
        oscillator.stop(endTime + DEFAULT_RELEASE);

        oscillator.addEventListener("ended", () => {
            oscillator.disconnect();
            gainNode.disconnect();
        });
    }

    /**
     * Gets or creates the AudioContext.
     * @returns {AudioContext|null} The active AudioContext, or null when unsupported.
     */
    function getAudioContext() {
        if (audioContext) {
            return audioContext;
        }

        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextConstructor) {
            console.warn("Web Audio API is not supported in this browser.");
            return null;
        }

        audioContext = new AudioContextConstructor();

        return audioContext;
    }

    /**
     * Updates the mute button text and state.
     * @returns {void}
     */
    function updateMuteToggleButton() {
        if (!muteToggleButton) {
            return;
        }

        muteToggleButton.textContent = isMuted ? "Sound: Off" : "Sound: On";
        muteToggleButton.setAttribute("aria-pressed", String(isMuted));
        muteToggleButton.setAttribute(
            "aria-label",
            isMuted ? "Sound is muted" : "Sound is on"
        );
        muteToggleButton.classList.toggle("is-muted", isMuted);
    }

    /**
     * Loads the saved muted state from localStorage.
     * @returns {boolean} True when sound should start muted.
     */
    function loadMutedState() {
        try {
            return localStorage.getItem(STORAGE_KEY) === "true";
        } catch (error) {
            return false;
        }
    }

    /**
     * Saves the muted state to localStorage.
     * @param {boolean} mutedValue - The muted state to save.
     * @returns {void}
     */
    function saveMutedState(mutedValue) {
        try {
            localStorage.setItem(STORAGE_KEY, String(Boolean(mutedValue)));
        } catch (error) {
            console.warn("Unable to save sound setting.", error);
        }
    }

    /**
     * Converts a duration into a safe value under one second.
     * @param {number} duration - The raw duration.
     * @returns {number} A safe duration in seconds.
     */
    function normaliseDuration(duration) {
        const parsedDuration = Number(duration);

        if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
            return 0.08;
        }

        return Math.min(parsedDuration, 0.95);
    }

    /**
     * Converts a delay into a safe value.
     * @param {number} delay - The raw delay.
     * @returns {number} A safe delay in seconds.
     */
    function normaliseDelay(delay) {
        const parsedDelay = Number(delay);

        if (!Number.isFinite(parsedDelay) || parsedDelay < 0) {
            return 0;
        }

        return Math.min(parsedDelay, 0.95);
    }

    /**
     * Converts a note gap into a safe value.
     * @param {number} gap - The raw gap.
     * @returns {number} A safe gap in seconds.
     */
    function normaliseGap(gap) {
        const parsedGap = Number(gap);

        if (!Number.isFinite(parsedGap) || parsedGap < 0) {
            return 0.025;
        }

        return Math.min(parsedGap, 0.2);
    }

    /**
     * Converts a frequency into a safe audible value.
     * @param {number} frequency - The raw frequency.
     * @returns {number} A safe frequency.
     */
    function normaliseFrequency(frequency) {
        const parsedFrequency = Number(frequency);

        if (!Number.isFinite(parsedFrequency) || parsedFrequency <= 0) {
            return 440;
        }

        return Math.min(Math.max(parsedFrequency, 40), 4000);
    }

    /**
     * Converts volume into a safe gain value.
     * @param {number} volume - The raw volume.
     * @returns {number} A safe volume.
     */
    function normaliseVolume(volume) {
        const parsedVolume = Number(volume);

        if (!Number.isFinite(parsedVolume) || parsedVolume <= 0) {
            return 0.12;
        }

        return Math.min(parsedVolume, 0.35);
    }

    return {
        unlock,
        playCorrect,
        playWrong,
        playLevelUp,
        playGameOver,
        playTimerWarning,
        playHint,
        createMuteToggle,
        toggleMute,
        setMuted,
        getMuted
    };
})();