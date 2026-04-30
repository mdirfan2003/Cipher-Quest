# Cipher Quest

## Vision Statement

Cipher Quest is a browser-based single page application game designed to make cryptography easier to understand through interactive gameplay. The project teaches players how classic ciphers work by asking them to decode encrypted messages under time pressure.

The aim is to create an educational, engaging, and accessible game that introduces basic cryptography concepts through practical challenges rather than only written explanation.

## Project Overview

Cipher Quest challenges players to decode encrypted messages using different cipher techniques. Each level presents cipher text, a cipher type, and a set of limited hints. Players must enter the correct plain text answer before the timer expires.

The game includes scoring, lives, difficulty settings, hints, sound effects, and a local leaderboard stored in the browser.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API
- localStorage

No frameworks, libraries, build tools, or server are required.

## How to Run Locally

1. Download or clone the project folder.
2. Open the project folder.
3. Open `index.html` directly in a modern web browser.
4. Enter a username.
5. Choose a difficulty level.
6. Start decoding cipher messages.

The game runs fully in the browser. No build step, package installation, or server setup is needed.

## Features

### Cipher Challenges

Cipher Quest includes multiple classic cipher types:

- Caesar Cipher
- Vigenere Cipher
- Binary to Text
- Morse Code
- ROT13
- Atbash

### Gameplay System

- Single page application structure
- Multiple game screens controlled with JavaScript
- Username entry
- Easy, Medium, and Hard difficulty modes
- Timed levels
- Answer validation
- Progressive hints
- Lives system
- Game over screen
- Level complete screen

### Scoring System

Players earn points for correct answers and can receive a time bonus. Points can be deducted for wrong answers and hint usage.

Main scoring rules:

- Correct answer base score: 100 points
- Time bonus: remaining time multiplied by 2
- Wrong answer penalty: minus 10 points
- Hint penalty: minus 5 points
- Final lives bonus: remaining lives multiplied by 100

### Leaderboard

Cipher Quest uses `localStorage` to save the top scores in the browser. The leaderboard displays saved player names, scores, and dates.

### Educational Support

The game includes a How to Play screen that explains each cipher type in simple language. Each level also includes a short security or cryptography fact to support learning.

### Visual Design

Cipher Quest uses a dark cyberpunk theme with:

- Dark navy background
- Cyan accent colour
- Orange warning colour
- Green success colour
- Glowing text effects
- Terminal-inspired styling
- Responsive layout for different screen sizes

## Project Structure

```text
cipher-quest/
├── index.html
├── style.css
├── js/
│   ├── app.js
│   ├── cipherEngine.js
│   ├── gameState.js
│   ├── uiController.js
│   ├── scoreManager.js
│   ├── timer.js
│   ├── levels.js
│   └── soundManager.js
└── README.md
```

## Main JavaScript Modules

### app.js

Controls the main game flow, connects modules, handles button clicks, and manages screen transitions.

### cipherEngine.js

Contains the encryption and decoding logic for each cipher type.

### gameState.js

Manages player state, level progress, score, attempts, lives, hints, and saved progress.

### uiController.js

Handles screen switching, feedback messages, leaderboard rendering, and visual UI updates.

### scoreManager.js

Stores and retrieves leaderboard data using `localStorage`.

### timer.js

Controls the countdown timer and time bonus calculation.

### levels.js

Stores all level data, including cipher type, plain text, keys, hints, and educational facts.

### soundManager.js

Uses the Web Audio API to generate sound effects without external audio files.

## Browser Storage

Cipher Quest uses the following `localStorage` keys:

```text
cq_leaderboard
cq_player
cq_progress
cq_sound_muted
```

These keys store leaderboard data, the current player, game progress, and sound settings.

## Academic Context

This project was developed for the COMP1004 Computing Project module at the University of Plymouth. It demonstrates single page application development, modular JavaScript, local browser storage, user interaction design, and basic cyber security education through gameplay.

## Author

Md. Irfan Khan

## License

This project is for academic coursework purposes.
