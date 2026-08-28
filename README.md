# Friday Wheel

Friday Wheel is a classroom-safe, Wheel-style word puzzle game that runs entirely in a web browser. It is designed for teachers, classrooms, team meetings, review games, and other group activities.

**There is nothing to install and nothing to host.** Unzip the folder and open `index.html`.

---

## Quick Start

1. Download and unzip the Friday Wheel folder.
2. Open the folder.
3. Double-click **`index.html`**.
4. Click **Create New Game**.
5. Enter a **Topic / Category** and the hidden **Word or phrase**.
6. Add each player. You can add several players without closing the setup window.
7. Click **Start Game**.
8. The first player spins the wheel and play begins.
9. Optional: click **Theme** at any time to choose the interface style you prefer.

The game works locally in the browser. It does not require an internet connection after the files are on the computer.

---

## How to Play

### 1. Create the game

Click **Create New Game**. The setup window contains everything needed to start a round:

- **Topic / Category** - for example, `Science`, `Phrase`, `U.S. History`, or `Book Title`.
- **Word or phrase** - the hidden answer that players will guess.
- **Players** - enter a player's name and click **Add Player**. Repeat until everyone is listed.

Nothing in the current game is erased merely by opening this window. A new round begins only after **Start Game** is clicked.

### 2. Spin the wheel

The active player clicks the large **SPIN** button in the center of the wheel.

The wheel contains:

- Point values
- **BANKRUPT**
- **LOSE A TURN**

The wheel stops in the center of a segment so the selected result is clear.

### 3. Guess a consonant

After landing on a point value:

1. Enter one consonant in **Guess a letter**.
2. Click **Play Consonant**.

If the consonant appears in the puzzle, **every occurrence is revealed**.

Points are calculated as:

`wheel value x number of matching letters`

Example: landing on `650` and finding three `T`s earns `1,950` points.

If the consonant is not in the puzzle, the turn moves to the next player.

### 4. Buy a vowel

A player may buy **A, E, I, O, or U** for **250 points total**.

The 250-point cost is charged **once**, not once per occurrence. If the puzzle contains five `E`s, the cost is still only 250 points.

The player must have at least 250 points to buy a vowel. If the vowel is not in the puzzle, the 250 points are still deducted and the turn ends.

### 5. Special wheel spaces

**BANKRUPT**

- Resets the active player's **current-game score** to zero.
- Ends the turn.

**LOSE A TURN**

- Ends the turn immediately.
- Does not remove points.

### 6. Solve the puzzle

Click **Solve Puzzle** and enter the player's answer.

The player does **not** have to reproduce punctuation or spacing exactly. For example, a puzzle containing:

`DON'T STOP, BELIEVIN'`

can be solved by entering:

`dont stop believin`

A correct solve reveals the complete puzzle. An incorrect solve ends the turn.

### 7. Host controls

The person running the game can also use:

- **Next Player** - manually advance the turn.
- **Reveal Puzzle** - reveal the answer after confirmation.
- **Scoreboard** - shown beside the game on large screens and as a green button beneath Turn Controls on smaller screens.
- **Theme** - choose from ten interface themes. Theme changes do not alter the wheel itself.

---

## Scoreboard and Scores

Each player has two scores:

- **Game** - points earned in the current game.
- **Overall** - points carried across completed games.

When **Create New Game > Start Game** is used, each returning player's current-game score is added to their overall score and their new game score starts at zero.

The scoreboard also provides host adjustments:

- **Make Active**
- **+100**
- **-100**
- **Remove**

These are useful when correcting a hosting mistake without restarting the game.

---

## Themes

Click **Theme** in the top-right controls to choose one of ten interface styles:

- **Classic** - the original warm charcoal and gold appearance.
- **Midnight** - deep navy with cool blue accents.
- **Chalkboard** - classroom green with warm cream/gold accents.
- **Plum** - deep purple with muted rose accents.
- **Slate** - cool charcoal with teal accents.
- **Carnival** - a dark midway-inspired look with red, yellow, green, and blue accents.
- **Gumballs** - candy-shop pink, cyan, yellow, and lime accents.
- **Skittles** - a dark neutral base with distributed rainbow accents.
- **Arcade** - neon cyan, magenta, yellow, and purple on a dark arcade-style base.
- **Toy Box** - deep blue with playful red, yellow, green, and bright-blue accents.

The selected theme is remembered on that browser so the teacher does not have to choose it every time.

**The wheel is intentionally not themed.** Its segment colors, BANKRUPT/LOSE A TURN spaces, pointer, and SPIN button remain the same in every theme. This keeps the most recognizable part of the game visually consistent.

---

## Wheel Settings

Click **Wheel Settings** to choose the point values used by the wheel.

Enter each point value **once**, one value per line. Example:

```text
500
600
650
700
750
800
850
900
1000
1200
```

Do **not** enter `BANKRUPT` or `LOSE A TURN`.

For every new game, Friday Wheel automatically:

- Creates **two copies of every point value**.
- Adds **two BANKRUPT spaces**.
- Adds **two LOSE A TURN spaces**.
- Randomizes the wheel layout.
- Keeps special spaces separated by at least two normal point-value spaces.

Duplicate point values are rejected because each value only needs to be entered once.

---

## Classroom Safety

Classroom-safe text filtering is always enabled in this edition. It checks:

- Topic / Category
- Puzzle answers
- Player names
- Solve attempts
- Previously saved player names from an older version of the game
- Temporary puzzle/category data left by an older version

The filter runs **entirely on the local computer**. Text is not sent to a website or moderation service.

It handles common capitalization, punctuation, repeated-letter, and simple leetspeak attempts while using word-based matching to reduce false positives in normal classroom words.

No finite offline word list can detect every new slang term or intentionally unusual spelling. The list is stored in `content-filter.js`, making it straightforward for a school or developer to expand if needed.

---

## Browser Storage and Privacy

Friday Wheel deliberately stores very little data.

### Saved between browser sessions

`localStorage` contains only:

- Player ID
- Player name
- Current-game score
- Overall score

The player data uses **one small localStorage record**. The selected theme is stored separately as one short preference value. The app does not build a history of completed games.

### Temporary game data

`sessionStorage` contains the active round:

- Puzzle and category
- Guessed letters
- Active player
- Current wheel result
- Wheel configuration and position
- Solved/revealed state

This allows an accidental refresh to recover the current game. Temporary round data is cleared when a new game starts and is naturally removed when the browser session ends.

No server, database, analytics service, or user account is used. Theme selection is purely local and does not contain personal information.

---

## Responsive Layout

Friday Wheel is designed to keep the most important parts of the game visible and readable.

On larger screens:

1. Wheel
2. Turn Controls
3. Scoreboard

appear together across the main game area.

On smaller laptop screens, the wheel and Turn Controls keep priority. The Scoreboard moves behind the green **Scoreboard** button beneath Turn Controls rather than shrinking the wheel into an unreadable size.

On narrow screens, the wheel and controls stack vertically.

---

## Files in the Folder

```text
friday-wheel-game/
├── index.html          Main page and dialogs
├── styles.css          All visual styles and responsive layout
├── app.js              Game flow, UI rendering, and event handling
├── game-core.js        Pure game rules, score helpers, and wheel generation
├── wheel.js            Wheel drawing and spin calculations
├── storage.js          Browser persistence
├── content-filter.js   Classroom-safe text filtering
└── README.md           This guide
```

The JavaScript is split by responsibility but uses normal `<script>` files rather than JavaScript modules. That is intentional so the game can still be opened directly from the filesystem without a local web server.

---

## For Technical Maintainers

The code has been organized around a few clear responsibilities:

- **`game-core.js`** contains pure functions with no DOM access. Wheel generation, scoring helpers, solve normalization, and value validation live here.
- **`wheel.js`** knows how to draw the wheel and translate a final rotation into the segment under the pointer.
- **`storage.js`** owns localStorage/sessionStorage reads and writes.
- **`content-filter.js`** owns classroom text validation.
- **`app.js`** coordinates the UI and game state.
- **`styles.css`** is a consolidated stylesheet. Historical override blocks from earlier prototypes were removed.

This separation keeps the app build-free while avoiding one giant JavaScript file full of unrelated logic.

### Storage keys

- `friday-wheel-players-v1`
- `friday-wheel-session-v1`

### Vowel cost

The vowel cost is defined once in `app.js` as `VOWEL_COST = 250`.

### Default wheel values

Default point values are defined once in `game-core.js` as `DEFAULT_WHEEL_VALUES`.

---

## Troubleshooting

### The wheel does not appear

Make sure all files remain together in the same folder. In particular, `index.html`, `styles.css`, `app.js`, `game-core.js`, `wheel.js`, `storage.js`, and `content-filter.js` must not be separated.

### I refreshed the page

The active game should recover from temporary browser session storage.

### The Scoreboard is missing

On smaller screens, click the green **Scoreboard** button beneath Turn Controls.

### A player name or puzzle is rejected

The classroom-safe filter detected language that is not allowed. Use different wording.

### I want the standard wheel values back

Open **Wheel Settings** and click **Restore Defaults**.

---

## Version

**v18 Classroom Edition**

This version consolidates the final game flow and classroom features into a cleaned, maintainable codebase and replaces the incremental development notes with a complete end-user guide.

---

## v19 Theme Update

- Added five selectable interface themes: Classic, Midnight, Chalkboard, Plum, and Slate.
- Added a **Theme** button and visual theme selector.
- Theme preference persists locally as one short value.
- Wheel colors and wheel rendering are isolated from theme variables and remain identical across every theme.


## v20 whimsical themes

Five multicolor themes were added: Carnival, Gumballs, Skittles, Arcade, and Toy Box. Unlike the original themes, these deliberately distribute several accent colors across panels, buttons, and player cards. The wheel remains visually fixed and is not affected by theme selection.


## v21 visual cleanup

- Removed decorative 1px borders from panels, buttons, inputs, dialogs, cards, and theme choices.
- Replaced thin separator lines with spacing, surface contrast, and soft shadows.
- Kept accessibility focus indicators so keyboard users can still clearly see focus.
- Kept intentional thick accents such as the active-player marker and playful theme player-card stripes.
- Kept the puzzle tiles and wheel styling intact.

## v22 visual depth cleanup

The interface remains intentionally borderless, but major surfaces now have stronger visual separation.

Changes include:

- Major panels use higher-contrast surfaces and broad drop shadows.
- The puzzle board is visibly recessed inside the puzzle panel.
- Turn Controls are a raised nested card inside the gameplay area.
- Player cards are more clearly separated from the scoreboard background.
- Inputs look recessed rather than outlined.
- Buttons use surface contrast and elevation instead of thin borders.
- Dialogs have stronger depth against the blurred backdrop.
- Whimsical themes keep their colorful ambient glow without relying on decorative outlines.
- The wheel remains visually unchanged.

## v23 accessibility contrast pass

This version replaces soft, blended surface treatment with stronger visual boundaries intended to be more robust for accessibility review.

Key changes:

- Major panels now use solid fills rather than ambient glow.
- Functional controls use deliberate 2px boundaries where needed.
- Inputs have strong visible boundaries and clearer placeholder contrast.
- Keyboard focus uses a thick 4px focus outline plus an additional dark separation ring.
- Player cards, played-letter chips, result indicators, and setup rows are visually distinct objects.
- Dialog backdrops no longer use blur.
- Whimsical themes retain their color palettes without colored glow bleeding into surrounding surfaces.
- Helper text contrast is increased.
- Decorative hairline borders remain avoided.
- The wheel remains visually unchanged.

The intent of this pass is to improve visual distinction and keyboard usability while preserving the overall design language.

## v24 game-area visual hierarchy

The gameplay area received another accessibility-focused visual separation pass.

Changes include:

- The full gameplay area is now a darker containing surface.
- Current Turn Value has its own distinct status card.
- Turn Controls have their own distinct card within the middle column.
- Host Actions are separated from letter controls with a strong structural divider.
- The Scoreboard now has a dedicated containing surface rather than floating directly on the game panel.
- Player cards sit at a visibly different surface level from the Scoreboard container.
- Active players use both a stronger filled state and a high-contrast accent edge.
- Player action buttons use a darker control surface so they do not blend into player cards.
- Letter input and spin-result fields have stronger functional contrast.
- Disabled controls retain readable labels while still appearing unavailable.
- The wheel itself remains unchanged.

This version intentionally uses a small number of thicker structural boundaries where they improve comprehension. Decorative hairline borders are still avoided.
