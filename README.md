# Pyformer

A feature-rich, web-based 2D retro platformer game complete with interactive visual graphics, sound synthesis, multi-level support, and an in-game Level Editor!

---

## 🎮 Features

- **Physics & Gameplay Engine**: Fluid platforming movement featuring smooth acceleration, jumping, wall sliding/climbing, gravity, and precise collision detection.
- **Dynamic Entities & Hazards**:
  - Spikes, moving platforms, falling platforms, trampolines/springs, and portal end-goals.
  - Collectible stars and coins with score tracking.
  - Interactive hazards & enemy entities (Slimes, Patrol Drones, Turrets, Laser Beams, and Bosses).
- **Built-in Level Editor**:
  - Live in-browser tile painting and level layout customization.
  - Palette selector for tiles, collectibles, hazards, power-ups, and entities.
  - Save, test, export, and import custom levels via raw level data.
- **Audio Synthesizer**: Web Audio API synth producing retro 8-bit sound effects (jumps, coin pickups, power-ups, damage, explosions, win sounds) and background music toggles.
- **Level Progression & Campaign**: Includes pre-built ASCII level layouts (`levels.js`) with completion screens, death counters, timer tracking, and star collection stats.

---

## 📂 Project Structure

```
pyformer/
├── index.html   # Main application interface, canvas, and overlays
├── style.css    # Modern UI styles, dark mode theme, HUD, & layout styling
├── game.js      # Core game loop, engine, physics, entity updates & rendering
├── levels.js    # Built-in ASCII level definitions and level parser
├── editor.js    # Level editor controller, palette management, & map export
└── audio.js     # Sound effects synthesizer & Web Audio controller
```

---

## 🚀 How to Run

Because `Pyformer` runs natively using standard HTML5 Canvas and JavaScript ES6, no backend or compilation step is required!

### Option 1: Direct File Access
Simply double-click or open [index.html](file:///c:/Users/User/Documents/coding/github/pyformer/index.html) directly in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Recommended)
Using a lightweight local web server ensures optimal audio playback permissions and asset loading.

**Using Python:**
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

**Using Node.js (`npx`):**
```bash
npx serve .
```

---

## ⌨️ Controls

| Action | Key / Control |
| :--- | :--- |
| **Move Left / Right** | `A` / `D` or `Left Arrow` / `Right Arrow` |
| **Jump / Wall Jump** | `W` / `Space` / `Up Arrow` |
| **Crouch / Drop Down**| `S` / `Down Arrow` |
| **Restart Level** | `R` |
| **Pause / Resume** | `P` or `Esc` |
| **Toggle Level Editor** | Click **Editor** button in header |

---

## 🛠️ Level Editor Guide

1. Click **Editor** in the top navigation bar to open the editor panel.
2. Select any tile, item, hazard, or entity from the **Palette**.
3. **Left-Click** on the grid to place the selected element.
4. **Right-Click** or select **Erase** to remove elements.
5. Click **Play / Test** to test your custom level immediately in real-time.
6. Export or import your level source data using the editor buttons.
