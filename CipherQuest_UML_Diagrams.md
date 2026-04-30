# Cipher Quest UML Diagrams

This UML set is based on the current Cipher Quest implementation. The JavaScript code uses IIFE module objects rather than ES6 classes, so each module is represented as a UML class or component for design documentation.

## 1. Use Case Diagram

```mermaid
flowchart LR
    Player([Player])

    StartGame((Start game))
    EnterName((Enter username))
    SelectDifficulty((Select difficulty))
    DecodeCipher((Decode cipher message))
    SubmitAnswer((Submit answer))
    UseHint((Use hint))
    ViewFact((View cipher fact))
    LoseLife((Lose life))
    CompleteLevel((Complete level))
    FinishGame((Finish or fail game))
    ViewLeaderboard((View leaderboard))
    ViewHowToPlay((View how to play))
    ToggleSound((Toggle sound))

    Player --> StartGame
    Player --> ViewLeaderboard
    Player --> ViewHowToPlay
    Player --> ToggleSound

    StartGame --> EnterName
    StartGame --> SelectDifficulty
    SelectDifficulty --> DecodeCipher
    DecodeCipher --> SubmitAnswer
    DecodeCipher --> UseHint
    DecodeCipher --> ViewFact
    SubmitAnswer --> CompleteLevel
    SubmitAnswer --> LoseLife
    LoseLife --> DecodeCipher
    CompleteLevel --> DecodeCipher
    CompleteLevel --> FinishGame
    LoseLife --> FinishGame
    FinishGame --> ViewLeaderboard
```

## 2. Class Diagram

```mermaid
classDiagram
    direction LR

    class App {
        -pendingPlayerName: string
        -finalScoreSaved: boolean
        -restartTimeoutId: number
        -lastTimerWarningSecond: number
        +initialiseApp(): void
        +cacheDomElements(): void
        +validateRequiredModules(): void
        +attachEventListeners(): void
        +handlePlayerFormSubmit(event): void
        +handleDifficultySelect(event): void
        +showGameScreenAndStartLevel(): void
        +renderCurrentLevel(): void
        +startLevelTimer(): void
        +handleTimerTick(seconds): void
        +handleTimerExpired(): void
        +handleAnswerSubmit(event): void
        +handleCorrectAnswer(result): void
        +handleWrongAnswer(result, livesBeforeAnswer): void
        +handleHintRequest(): void
        +showLevelCompleteScreen(): void
        +handleContinueToNextLevel(): void
        +showFinalScoreScreen(completed): void
        +saveFinalScoreOnce(): void
    }

    class GameState {
        -STORAGE_KEYS: object
        -GAME_STATUS: object
        -DIFFICULTY_SETTINGS: object
        -BASE_POINTS: number
        -WRONG_ANSWER_PENALTY: number
        -HINT_PENALTY: number
        -LIVES_BONUS_MULTIPLIER: number
        +player: Player
        +currentLevel: Level
        +encryptedText: string
        +solution: string
        +difficulty: string
        +status: string
        +attempts: number
        +timeLeft: number
        +levelHintsUsed: number
        +lastLevelScore: object
        +startGame(playerName, difficulty): Level
        +loadLevel(levelNumber): Level
        +submitAnswer(answer): AnswerResult
        +useHint(): string
        +nextLevel(): Level
        +loseLife(): number
        +completeGame(): void
        +saveToStorage(): boolean
        +loadFromStorage(): object
        +setTimeLeft(seconds): void
        +getAttemptsRemaining(): number
        +getHintsRemaining(): number
    }

    class Player {
        +name: string
        +totalScore: number
        +lives: number
        +currentLevel: number
        +hintsUsed: number
    }

    class Level {
        +levelNumber: number
        +cipherType: string
        +plainText: string
        +key: string|number|null
        +timeLimit: number
        +hintsAllowed: number
        +maxAttempts: number
        +hints: string[]
        +didYouKnow: string
    }

    class AnswerResult {
        +correct: boolean
        +pointsEarned: number
        +message: string
    }

    class LEVELS {
        <<data store>>
        +Level[12]
    }

    class CipherEngine {
        <<module>>
        +MORSE_CODE: object
        +caesarEncrypt(text, shift): string
        +caesarDecrypt(text, shift): string
        +vigenereEncrypt(text, key): string
        +vigenereDecrypt(text, key): string
        +textToBinary(text): string
        +binaryToText(binary): string
        +textToMorse(text): string
        +morseToText(morse): string
        +rot13(text): string
        +atbashEncrypt(text): string
    }

    class Timer {
        <<module>>
        -TIME_BONUS_MULTIPLIER: number
        -intervalId: number
        -timeLeft: number
        -tickCallback: Function
        -expireCallback: Function
        -isPaused: boolean
        -isRunning: boolean
        +start(seconds, onTick, onExpire): void
        +stop(): void
        +pause(): void
        +resume(): void
        +getTimeLeft(): number
        +getTimeBonus(): number
    }

    class UIController {
        <<module>>
        +showScreen(screenId): void
        +updateTimer(seconds): void
        +showFeedback(message, type): void
        +renderLeaderboard(entries): void
        +animateTransition(): void
    }

    class ScoreManager {
        <<module>>
        -LEADERBOARD_KEY: string
        -PROGRESS_KEY: string
        -MAX_LEADERBOARD_ENTRIES: number
        +addEntry(name, score): object[]
        +getLeaderboard(): object[]
        +clearLeaderboard(): void
        +formatDate(): string
        +calculateFinalBonus(livesRemaining): number
    }

    class SoundManager {
        <<module>>
        -STORAGE_KEY: string
        -audioContext: AudioContext
        -isMuted: boolean
        +unlock(): boolean
        +playCorrect(): void
        +playWrong(): void
        +playLevelUp(): void
        +playGameOver(): void
        +playTimerWarning(): void
        +playHint(): void
        +createMuteToggle(parentSelector): HTMLButtonElement
        +toggleMute(): boolean
        +setMuted(shouldMute): boolean
        +getMuted(): boolean
    }

    class LocalStorage {
        <<browser API>>
        +cq_player
        +cq_progress
        +cq_leaderboard
        +cq_sound_muted
    }

    class DOM {
        <<browser document>>
        +screen-home
        +screen-difficulty
        +screen-game
        +screen-level-complete
        +screen-gameover
        +screen-leaderboard
        +screen-howtoplay
    }

    class WebAudioAPI {
        <<browser API>>
        +AudioContext
        +OscillatorNode
        +GainNode
    }

    App --> GameState : controls gameplay
    App --> Timer : starts and stops countdown
    App --> UIController : updates screens
    App --> ScoreManager : saves final score
    App --> SoundManager : plays effects
    App --> DOM : reads user input

    GameState --> Player : owns
    GameState --> Level : loads current level
    GameState --> LEVELS : finds level data
    LEVELS "1" --> "12" Level : contains
    GameState --> CipherEngine : generates encrypted text
    GameState --> LocalStorage : saves progress

    Timer ..> App : onTick and onExpire callbacks
    UIController --> DOM : manipulates view
    ScoreManager --> LocalStorage : saves leaderboard
    SoundManager --> WebAudioAPI : creates sounds
    SoundManager --> LocalStorage : saves mute setting

    GameState ..> AnswerResult : returns
```

## 3. Main Gameplay Activity Diagram

```mermaid
flowchart TD
    A([Open index.html]) --> B[Show home screen]
    B --> C{Player chooses action}
    C -->|Leaderboard| D[Render top 10 leaderboard]
    D --> B
    C -->|How to play| E[Show cipher explanations]
    E --> B
    C -->|Start game| F[Validate username]
    F --> G{Username valid?}
    G -->|No| F1[Show browser validation]
    F1 --> F
    G -->|Yes| H[Show difficulty screen]
    H --> I[Player selects Easy, Medium, or Hard]
    I --> J[GameState.startGame]
    J --> K[Load level 1 and encrypt text]
    K --> L[Show game screen]
    L --> M[Start timer]
    M --> N{Player action}

    N -->|Use hint| O[GameState.useHint]
    O --> P[Deduct 5 points and update hint display]
    P --> N

    N -->|Submit answer| Q[GameState.submitAnswer]
    Q --> R{Answer correct?}
    R -->|Yes| S[Stop timer]
    S --> T[Add base points and time bonus]
    T --> U[Show level complete screen]
    U --> V{More levels?}
    V -->|Yes| W[Load next level]
    W --> L
    V -->|No| X[Apply lives bonus]
    X --> Y[Save final score once]
    Y --> Z[Show game complete screen]

    R -->|No| AA[Deduct 10 points and increase attempts]
    AA --> AB{Max attempts reached?}
    AB -->|No| N
    AB -->|Yes| AC[Lose one life]
    AC --> AD{Lives remaining?}
    AD -->|Yes| AE[Restart same level]
    AE --> L
    AD -->|No| Y

    N -->|Timer expires| AC
```

## 4. Answer Submission Sequence Diagram

```mermaid
sequenceDiagram
    actor Player
    participant App
    participant GameState
    participant Timer
    participant UI as UIController
    participant Sound as SoundManager
    participant Score as ScoreManager
    participant Storage as localStorage

    Player->>App: Type answer and submit
    App->>Sound: unlock()
    App->>Timer: getTimeLeft()
    Timer-->>App: remaining seconds
    App->>GameState: setTimeLeft(seconds)
    GameState->>Storage: save cq_progress
    App->>GameState: submitAnswer(answer)

    alt Correct answer
        GameState->>GameState: compare normalised answer with solution
        GameState->>GameState: add 100 base points and time bonus
        GameState->>Storage: save cq_player and cq_progress
        GameState-->>App: correct result
        App->>Timer: stop()
        App->>Sound: playCorrect()
        App->>UI: showFeedback(success)
        App->>UI: showScreen(screen-level-complete)
    else Wrong answer with attempts remaining
        GameState->>GameState: attempts + 1 and score -10
        GameState->>Storage: save cq_progress
        GameState-->>App: wrong result
        App->>Sound: playWrong()
        App->>UI: showFeedback(wrong)
    else Wrong answer and no attempts remaining
        GameState->>GameState: loseLife()
        GameState->>Storage: save cq_progress
        GameState-->>App: life lost or game over result
        App->>Timer: stop()
        alt Lives remain
            App->>UI: showFeedback(restart level)
            App->>GameState: loadLevel(currentLevel)
            App->>Timer: start()
        else No lives remain
            App->>Score: addEntry(playerName, totalScore)
            Score->>Storage: save cq_leaderboard
            App->>Sound: playGameOver()
            App->>UI: showScreen(screen-gameover)
        end
    end
```

## 5. Game State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> DifficultySelection: Valid username entered
    DifficultySelection --> Playing: Difficulty selected and startGame()

    Playing --> Playing: Hint used
    Playing --> Playing: Wrong answer with attempts left
    Playing --> LevelPaused: Correct answer
    Playing --> Playing: Timer expired and lives remain
    Playing --> Playing: Max attempts reached and lives remain
    Playing --> GameOver: Timer expired and no lives remain
    Playing --> GameOver: Max attempts reached and no lives remain

    LevelPaused --> Playing: Continue and next level exists
    LevelPaused --> Complete: Continue after final level

    Complete --> GameOverScreen: Save final score
    GameOver --> GameOverScreen: Save final score

    GameOverScreen --> Idle: Play again
    GameOverScreen --> Leaderboard: View leaderboard
    Idle --> Leaderboard: View leaderboard
    Idle --> HowToPlay: View how to play
    Leaderboard --> Idle: Back to home
    HowToPlay --> Idle: Back to home

    state Idle {
        [*] --> HomeScreen
    }
```

## 6. Screen Navigation Diagram

```mermaid
flowchart LR
    Home[screen-home]
    Difficulty[screen-difficulty]
    Game[screen-game]
    LevelComplete[screen-level-complete]
    GameOver[screen-gameover]
    Leaderboard[screen-leaderboard]
    HowToPlay[screen-howtoplay]

    Home -->|valid username| Difficulty
    Home -->|leaderboard button| Leaderboard
    Home -->|how to play button| HowToPlay
    Difficulty -->|difficulty selected| Game
    Game -->|correct answer| LevelComplete
    Game -->|no lives left| GameOver
    Game -->|all levels completed| GameOver
    LevelComplete -->|continue and more levels| Game
    LevelComplete -->|continue after level 12| GameOver
    GameOver -->|play again| Home
    GameOver -->|leaderboard button| Leaderboard
    Leaderboard -->|back| Home
    HowToPlay -->|back| Home
```

## 7. Relations of the files

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "background": "transparent",
    "primaryColor": "#0a0e1a",
    "primaryTextColor": "#c8d8e8",
    "primaryBorderColor": "#00d4ff",
    "lineColor": "#00d4ff",
    "secondaryColor": "#121c30",
    "tertiaryColor": "#162238",
    "fontFamily": "Rajdhani, Arial, sans-serif"
  }
}}%%

flowchart LR
    App["app.js<br/>Main Controller"]
    GameState["gameState.js<br/>Player, score, lives, progress"]
    CipherEngine["cipherEngine.js<br/>Cipher functions"]
    Levels["levels.js<br/>12 level objects"]
    Timer["timer.js<br/>Countdown and time bonus"]
    UIController["uiController.js<br/>Screens and feedback"]
    ScoreManager["scoreManager.js<br/>Leaderboard handling"]
    SoundManager["soundManager.js<br/>Web Audio feedback"]
    DOM["index.html<br/>Seven SPA screens"]
    CSS["style.css<br/>Theme and responsive layout"]
    Storage["localStorage<br/>cq_player, cq_progress,<br/>cq_leaderboard, cq_sound_muted"]
    WebAudio["Web Audio API<br/>AudioContext and tones"]

    App --> GameState
    App --> Timer
    App --> UIController
    App --> ScoreManager
    App --> SoundManager
    App --> DOM

    GameState --> Levels
    GameState --> CipherEngine
    GameState --> Storage

    ScoreManager --> Storage
    SoundManager --> WebAudio
    SoundManager --> Storage

    UIController --> DOM
    CSS --> DOM
    Timer --> App

    classDef controller fill:#07111f,stroke:#00d4ff,stroke-width:2px,color:#c8d8e8;
    classDef module fill:#10182a,stroke:#39a7ff,stroke-width:1.8px,color:#c8d8e8;
    classDef data fill:#121c30,stroke:#39ff14,stroke-width:1.8px,color:#c8d8e8;
    classDef browser fill:#162238,stroke:#ff6b35,stroke-width:1.8px,color:#c8d8e8;

    class App controller;
    class GameState,CipherEngine,Timer,UIController,ScoreManager,SoundManager module;
    class Levels,Storage data;
    class DOM,CSS,WebAudio browser;
```