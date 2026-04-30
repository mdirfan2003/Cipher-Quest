const LEVELS = Object.freeze([
    {
        levelNumber: 1,
        cipherType: "caesarEncrypt",
        plainText: "Patch the gate",
        key: 3,
        timeLimit: 120,
        hintsAllowed: 3,
        maxAttempts: 5,
        hints: [
            "This cipher moves letters by the same number each time.",
            "The key tells you how many places each letter was shifted.",
            "Shift each letter back by 3 places."
        ],
        didYouKnow: "The Caesar cipher is named after Julius Caesar, who used letter shifting to protect military messages."
    },
    {
        levelNumber: 2,
        cipherType: "atbashEncrypt",
        plainText: "Guard the vault",
        key: null,
        timeLimit: 120,
        hintsAllowed: 3,
        maxAttempts: 5,
        hints: [
            "This cipher reverses the alphabet.",
            "A becomes Z, B becomes Y, and C becomes X.",
            "Replace each letter with the letter in the opposite alphabet position."
        ],
        didYouKnow: "Atbash is one of the oldest known substitution ciphers and was originally used with the Hebrew alphabet."
    },
    {
        levelNumber: 3,
        cipherType: "rot13",
        plainText: "Trust no link",
        key: null,
        timeLimit: 120,
        hintsAllowed: 3,
        maxAttempts: 5,
        hints: [
            "This cipher always uses the same shift.",
            "The shift is exactly half of the alphabet.",
            "Apply a shift of 13 letters to decode it."
        ],
        didYouKnow: "ROT13 was often used on early internet forums to hide spoilers or joke answers."
    },
    {
        levelNumber: 4,
        cipherType: "textToBinary",
        plainText: "Scan the port",
        key: null,
        timeLimit: 120,
        hintsAllowed: 3,
        maxAttempts: 5,
        hints: [
            "This message is stored using only zeros and ones.",
            "Each group of binary digits represents one character.",
            "Convert each 8-bit binary group into a text character."
        ],
        didYouKnow: "Computers store text as numbers, and those numbers are represented internally using binary."
    },
    {
        levelNumber: 5,
        cipherType: "textToMorse",
        plainText: "Code is power",
        key: null,
        timeLimit: 60,
        hintsAllowed: 2,
        maxAttempts: 3,
        hints: [
            "This cipher uses dots and dashes.",
            "Each group of symbols represents one letter.",
            "Use a Morse code chart to convert each symbol group into text."
        ],
        didYouKnow: "Morse code was widely used in telegraph communication before modern digital communication systems."
    },
    {
        levelNumber: 6,
        cipherType: "vigenereEncrypt",
        plainText: "Secure the node",
        key: "CYBER",
        timeLimit: 60,
        hintsAllowed: 2,
        maxAttempts: 3,
        hints: [
            "This cipher uses a repeated keyword.",
            "Each keyword letter creates a different Caesar shift.",
            "Use the keyword CYBER to reverse the shifts."
        ],
        didYouKnow: "The Vigenere cipher was once called le chiffre indechiffrable because it was believed to be very hard to break."
    },
    {
        levelNumber: 7,
        cipherType: "caesarEncrypt",
        plainText: "Encrypt all files",
        key: 5,
        timeLimit: 60,
        hintsAllowed: 2,
        maxAttempts: 3,
        hints: [
            "This is another fixed-shift alphabet cipher.",
            "The key is larger than the first Caesar level.",
            "Shift each letter back by 5 places."
        ],
        didYouKnow: "Simple substitution ciphers are weak today because computers can test many possible keys very quickly."
    },
    {
        levelNumber: 8,
        cipherType: "atbashEncrypt",
        plainText: "Never share keys",
        key: null,
        timeLimit: 60,
        hintsAllowed: 2,
        maxAttempts: 3,
        hints: [
            "This cipher does not need a numeric key.",
            "The alphabet is mirrored from start to end.",
            "A matches Z, B matches Y, and the same rule continues."
        ],
        didYouKnow: "Modern encryption is much stronger than Atbash because it uses complex mathematical keys instead of simple letter swaps."
    },
    {
        levelNumber: 9,
        cipherType: "vigenereEncrypt",
        plainText: "Firewall stands",
        key: "LOCK",
        timeLimit: 30,
        hintsAllowed: 1,
        maxAttempts: 2,
        hints: [
            "This cipher uses a keyword to change the shift for each letter.",
            "The keyword repeats across the whole message.",
            "Use the keyword LOCK to decrypt the message."
        ],
        didYouKnow: "The Vigenere cipher is stronger than a Caesar cipher because the same letter can encrypt into different letters."
    },
    {
        levelNumber: 10,
        cipherType: "textToBinary",
        plainText: "Access denied",
        key: null,
        timeLimit: 30,
        hintsAllowed: 1,
        maxAttempts: 2,
        hints: [
            "This level uses binary groups.",
            "Each group should be treated as a character code.",
            "Convert every 8-bit group into its matching text character."
        ],
        didYouKnow: "ASCII is a common character encoding system that maps letters, numbers, and symbols to numeric values."
    },
    {
        levelNumber: 11,
        cipherType: "textToMorse",
        plainText: "Signal is safe",
        key: null,
        timeLimit: 30,
        hintsAllowed: 1,
        maxAttempts: 2,
        hints: [
            "Listen for dots and dashes in the pattern.",
            "Letters are separated by spaces, and words are separated by slash symbols.",
            "Decode each Morse symbol group into one letter."
        ],
        didYouKnow: "Morse code is still used by some radio operators because it can work even with weak signal conditions."
    },
    {
        levelNumber: 12,
        cipherType: "rot13",
        plainText: "Final cipher won",
        key: null,
        timeLimit: 30,
        hintsAllowed: 1,
        maxAttempts: 2,
        hints: [
            "This cipher is its own reverse.",
            "Running the same transformation again will reveal the original text.",
            "Use ROT13 to decode the message."
        ],
        didYouKnow: "ROT13 is not secure encryption, but it is useful for demonstrating how simple alphabet shifts work."
    }
]);