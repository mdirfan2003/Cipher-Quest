/**
 * Cipher Quest CipherEngine test script.
 * Uses simple console.assert checks with PASS or FAIL output.
 * Load this file after cipherEngine.js.
 */

(function runCipherEngineTests() {
    "use strict";

    let passedTests = 0;
    let failedTests = 0;

    /**
     * Runs one test and prints a PASS or FAIL result.
     * @param {string} functionName - The CipherEngine function being tested.
     * @param {string} testName - The test case description.
     * @param {Function} testFunction - The test function that returns true or false.
     * @returns {void}
     */
    function runTest(functionName, testName, testFunction) {
        let passed = false;

        try {
            passed = Boolean(testFunction());
        } catch (error) {
            console.error(`FAIL ${functionName}: ${testName}`, error);
            console.assert(false, `${functionName}: ${testName}`);
            failedTests += 1;
            return;
        }

        console.assert(passed, `${functionName}: ${testName}`);

        if (passed) {
            console.log(`PASS ${functionName}: ${testName}`);
            passedTests += 1;
        } else {
            console.log(`FAIL ${functionName}: ${testName}`);
            failedTests += 1;
        }
    }

    console.log("Starting CipherEngine tests...");

    runTest("caesarEncrypt", "normal input shifts letters by key", function () {
        return CipherEngine.caesarEncrypt("Attack at dawn", 3) === "Dwwdfn dw gdzq";
    });

    runTest("caesarEncrypt", "edge case empty string stays empty", function () {
        return CipherEngine.caesarEncrypt("", 3) === "";
    });

    runTest("caesarEncrypt", "round trip with caesarDecrypt returns original", function () {
        const original = "Secure Base 7";
        const encrypted = CipherEngine.caesarEncrypt(original, 5);
        return CipherEngine.caesarDecrypt(encrypted, 5) === original;
    });

    runTest("caesarDecrypt", "normal input reverses Caesar shift", function () {
        return CipherEngine.caesarDecrypt("Dwwdfn dw gdzq", 3) === "Attack at dawn";
    });

    runTest("caesarDecrypt", "edge case single character decrypts correctly", function () {
        return CipherEngine.caesarDecrypt("D", 3) === "A";
    });

    runTest("caesarDecrypt", "round trip with caesarEncrypt returns original", function () {
        const original = "Patch the gate";
        const encrypted = CipherEngine.caesarEncrypt(original, 9);
        return CipherEngine.caesarDecrypt(encrypted, 9) === original;
    });

    runTest("vigenereEncrypt", "normal input encrypts using keyword", function () {
        return CipherEngine.vigenereEncrypt("ATTACKATDAWN", "LEMON") === "LXFOPVEFRNHR";
    });

    runTest("vigenereEncrypt", "edge case empty string stays empty", function () {
        return CipherEngine.vigenereEncrypt("", "KEY") === "";
    });

    runTest("vigenereEncrypt", "round trip with vigenereDecrypt returns original", function () {
        const original = "Secure the node";
        const encrypted = CipherEngine.vigenereEncrypt(original, "CYBER");
        return CipherEngine.vigenereDecrypt(encrypted, "CYBER") === original;
    });

    runTest("vigenereDecrypt", "normal input decrypts using keyword", function () {
        return CipherEngine.vigenereDecrypt("LXFOPVEFRNHR", "LEMON") === "ATTACKATDAWN";
    });

    runTest("vigenereDecrypt", "edge case single character decrypts correctly", function () {
        return CipherEngine.vigenereDecrypt("L", "L") === "A";
    });

    runTest("vigenereDecrypt", "round trip with vigenereEncrypt returns original", function () {
        const original = "Firewall stands";
        const encrypted = CipherEngine.vigenereEncrypt(original, "LOCK");
        return CipherEngine.vigenereDecrypt(encrypted, "LOCK") === original;
    });

    runTest("textToBinary", "normal input converts text to 8-bit binary", function () {
        return CipherEngine.textToBinary("Hi") === "01001000 01101001";
    });

    runTest("textToBinary", "edge case empty string stays empty", function () {
        return CipherEngine.textToBinary("") === "";
    });

    runTest("textToBinary", "round trip with binaryToText returns original", function () {
        const original = "Scan port 7";
        const binary = CipherEngine.textToBinary(original);
        return CipherEngine.binaryToText(binary) === original;
    });

    runTest("binaryToText", "normal input converts binary to text", function () {
        return CipherEngine.binaryToText("01001000 01101001") === "Hi";
    });

    runTest("binaryToText", "edge case empty string stays empty", function () {
        return CipherEngine.binaryToText("") === "";
    });

    runTest("binaryToText", "round trip with textToBinary returns original", function () {
        const original = "Access denied";
        const binary = CipherEngine.textToBinary(original);
        return CipherEngine.binaryToText(binary) === original;
    });

    runTest("textToMorse", "normal input converts text to Morse code", function () {
        return CipherEngine.textToMorse("SOS") === "... --- ...";
    });

    runTest("textToMorse", "edge case empty string stays empty", function () {
        return CipherEngine.textToMorse("") === "";
    });

    runTest("textToMorse", "round trip with morseToText returns uppercase original", function () {
        const original = "Signal 5";
        const morse = CipherEngine.textToMorse(original);
        return CipherEngine.morseToText(morse) === original.toUpperCase();
    });

    runTest("morseToText", "normal input converts Morse code to text", function () {
        return CipherEngine.morseToText("... --- ...") === "SOS";
    });

    runTest("morseToText", "edge case empty string stays empty", function () {
        return CipherEngine.morseToText("") === "";
    });

    runTest("morseToText", "round trip with textToMorse returns uppercase original", function () {
        const original = "Code is power";
        const morse = CipherEngine.textToMorse(original);
        return CipherEngine.morseToText(morse) === original.toUpperCase();
    });

    runTest("rot13", "normal input applies ROT13", function () {
        return CipherEngine.rot13("Hello World") === "Uryyb Jbeyq";
    });

    runTest("rot13", "edge case single character transforms correctly", function () {
        return CipherEngine.rot13("A") === "N";
    });

    runTest("rot13", "round trip with ROT13 returns original", function () {
        const original = "Trust no link";
        const encrypted = CipherEngine.rot13(original);
        return CipherEngine.rot13(encrypted) === original;
    });

    runTest("atbashEncrypt", "normal input reverses alphabet positions", function () {
        return CipherEngine.atbashEncrypt("abc XYZ") === "zyx CBA";
    });

    runTest("atbashEncrypt", "edge case single character transforms correctly", function () {
        return CipherEngine.atbashEncrypt("A") === "Z";
    });

    runTest("atbashEncrypt", "round trip with Atbash returns original", function () {
        const original = "Guard the vault";
        const encrypted = CipherEngine.atbashEncrypt(original);
        return CipherEngine.atbashEncrypt(encrypted) === original;
    });

    console.log(`CipherEngine tests complete. Passed: ${passedTests}. Failed: ${failedTests}.`);
})();