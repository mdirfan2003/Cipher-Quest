const CipherEngine = (() => {
    const MORSE_CODE = Object.freeze({
        A: ".-",
        B: "-...",
        C: "-.-.",
        D: "-..",
        E: ".",
        F: "..-.",
        G: "--.",
        H: "....",
        I: "..",
        J: ".---",
        K: "-.-",
        L: ".-..",
        M: "--",
        N: "-.",
        O: "---",
        P: ".--.",
        Q: "--.-",
        R: ".-.",
        S: "...",
        T: "-",
        U: "..-",
        V: "...-",
        W: ".--",
        X: "-..-",
        Y: "-.--",
        Z: "--..",
        0: "-----",
        1: ".----",
        2: "..---",
        3: "...--",
        4: "....-",
        5: ".....",
        6: "-....",
        7: "--...",
        8: "---..",
        9: "----.",
        ".": ".-.-.-",
        ",": "--..--",
        "?": "..--..",
        "!": "-.-.--",
        "'": ".----.",
        ":": "---...",
        ";": "-.-.-.",
        "-": "-....-",
        "/": "-..-.",
        "(": "-.--.",
        ")": "-.--.-",
        "&": ".-...",
        " ": "/"
    });

    /**
     * Caesar cipher shifts each alphabet letter by a fixed number of positions.
     * @param {string} text - The plain text to encrypt.
     * @param {number} shift - The number of alphabet positions to shift.
     * @returns {string} The encrypted text.
     */
    function caesarEncrypt(text, shift) {
        return shiftLetters(String(text), Number(shift) || 0);
    }

    /**
     * Caesar decryption reverses the original Caesar shift to recover the plain text.
     * @param {string} text - The encrypted text to decrypt.
     * @param {number} shift - The number of alphabet positions originally used.
     * @returns {string} The decrypted text.
     */
    function caesarDecrypt(text, shift) {
        return shiftLetters(String(text), -(Number(shift) || 0));
    }

    /**
     * Vigenere cipher shifts each letter using repeated letters from a keyword.
     * @param {string} text - The plain text to encrypt.
     * @param {string} key - The keyword used for encryption.
     * @returns {string} The encrypted text.
     */
    function vigenereEncrypt(text, key) {
        return vigenereTransform(String(text), String(key), true);
    }

    /**
     * Vigenere decryption reverses the keyword shifts to recover the original message.
     * @param {string} text - The encrypted text to decrypt.
     * @param {string} key - The keyword originally used for encryption.
     * @returns {string} The decrypted text.
     */
    function vigenereDecrypt(text, key) {
        return vigenereTransform(String(text), String(key), false);
    }

    /**
     * Binary encoding converts each character into an 8-bit binary number.
     * @param {string} text - The text to convert into binary.
     * @returns {string} The binary representation of the text.
     */
    function textToBinary(text) {
        return String(text)
            .split("")
            .map((character) => character.charCodeAt(0).toString(2).padStart(8, "0"))
            .join(" ");
    }

    /**
     * Binary decoding converts groups of binary numbers back into readable text.
     * @param {string} binary - The binary text to decode.
     * @returns {string} The decoded text.
     */
    function binaryToText(binary) {
        return String(binary)
            .trim()
            .split(/\s+/)
            .filter((binaryGroup) => /^[01]{1,8}$/.test(binaryGroup))
            .map((binaryGroup) => String.fromCharCode(parseInt(binaryGroup, 2)))
            .join("");
    }

    /**
     * Morse code converts letters and numbers into dots and dashes.
     * @param {string} text - The text to convert into Morse code.
     * @returns {string} The Morse code version of the text.
     */
    function textToMorse(text) {
        return String(text)
            .toUpperCase()
            .split("")
            .map((character) => MORSE_CODE[character] || "")
            .filter((code) => code !== "")
            .join(" ");
    }

    /**
     * Morse decoding converts dots and dashes back into readable text.
     * @param {string} morse - The Morse code to decode.
     * @returns {string} The decoded text.
     */
    function morseToText(morse) {
        const reversedMorseCode = createReversedMorseCode();

        return String(morse)
            .trim()
            .split(" ")
            .map((code) => reversedMorseCode[code] || "")
            .join("");
    }

    /**
     * ROT13 shifts every alphabet letter by 13 places and uses the same function for encryption and decryption.
     * @param {string} text - The text to transform with ROT13.
     * @returns {string} The transformed text.
     */
    function rot13(text) {
        return shiftLetters(String(text), 13);
    }

    /**
     * Atbash replaces each alphabet letter with its opposite letter in the alphabet.
     * @param {string} text - The text to transform with Atbash.
     * @returns {string} The transformed text.
     */
    function atbashEncrypt(text) {
        return String(text)
            .split("")
            .map((character) => {
                if (!isAlphabetLetter(character)) {
                    return character;
                }

                const baseCode = isUppercaseLetter(character) ? 65 : 97;
                const letterIndex = character.charCodeAt(0) - baseCode;
                const reversedIndex = 25 - letterIndex;

                return String.fromCharCode(baseCode + reversedIndex);
            })
            .join("");
    }

    /**
     * Shifts alphabet letters while preserving uppercase and lowercase characters.
     * @param {string} text - The text to shift.
     * @param {number} shift - The number of positions to shift.
     * @returns {string} The shifted text.
     */
    function shiftLetters(text, shift) {
        return text
            .split("")
            .map((character) => {
                if (!isAlphabetLetter(character)) {
                    return character;
                }

                const baseCode = isUppercaseLetter(character) ? 65 : 97;
                const letterIndex = character.charCodeAt(0) - baseCode;
                const shiftedIndex = mod(letterIndex + shift, 26);

                return String.fromCharCode(baseCode + shiftedIndex);
            })
            .join("");
    }

    /**
     * Applies Vigenere keyword shifting in either encryption or decryption mode.
     * @param {string} text - The text to transform.
     * @param {string} key - The Vigenere keyword.
     * @param {boolean} shouldEncrypt - Whether to encrypt or decrypt.
     * @returns {string} The transformed text.
     */
    function vigenereTransform(text, key, shouldEncrypt) {
        const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");

        if (cleanKey.length === 0) {
            return text;
        }

        let keyIndex = 0;

        return text
            .split("")
            .map((character) => {
                if (!isAlphabetLetter(character)) {
                    return character;
                }

                const baseCode = isUppercaseLetter(character) ? 65 : 97;
                const letterIndex = character.charCodeAt(0) - baseCode;
                const keyShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
                const finalShift = shouldEncrypt ? keyShift : -keyShift;
                const shiftedIndex = mod(letterIndex + finalShift, 26);

                keyIndex += 1;

                return String.fromCharCode(baseCode + shiftedIndex);
            })
            .join("");
    }

    /**
     * Builds a reverse lookup so Morse symbols can be converted back to characters.
     * @returns {Object<string, string>} The reversed Morse lookup object.
     */
    function createReversedMorseCode() {
        const reversedMorseCode = {};

        Object.keys(MORSE_CODE).forEach((character) => {
            reversedMorseCode[MORSE_CODE[character]] = character;
        });

        return reversedMorseCode;
    }

    /**
     * Checks whether a character is an English alphabet letter.
     * @param {string} character - The character to check.
     * @returns {boolean} True when the character is A to Z or a to z.
     */
    function isAlphabetLetter(character) {
        return /^[A-Za-z]$/.test(character);
    }

    /**
     * Checks whether a character is an uppercase English alphabet letter.
     * @param {string} character - The character to check.
     * @returns {boolean} True when the character is A to Z.
     */
    function isUppercaseLetter(character) {
        return /^[A-Z]$/.test(character);
    }

    /**
     * Calculates a positive modulo result for alphabet wrapping.
     * @param {number} value - The value to wrap.
     * @param {number} divisor - The modulo divisor.
     * @returns {number} The wrapped positive result.
     */
    function mod(value, divisor) {
        return ((value % divisor) + divisor) % divisor;
    }

    return {
        MORSE_CODE,
        caesarEncrypt,
        caesarDecrypt,
        vigenereEncrypt,
        vigenereDecrypt,
        textToBinary,
        binaryToText,
        textToMorse,
        morseToText,
        rot13,
        atbashEncrypt
    };
})();