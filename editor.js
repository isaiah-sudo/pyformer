/**
 * JumpPulse - In-game Level Editor
 * Allows live painting, testing, and 1-click import/export of ASCII level layouts.
 */

class LevelEditor {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.selectedTile = '#';
        this.width = 30;
        this.height = 12;
        this.grid = [];
        this.isMouseDown = false;
        this.hoverTile = { x: -1, y: -1 };

        this.tileTypes = [
            { id: '#', name: 'Solid Block', color: '#4f46e5', icon: '■' },
            { id: '.', name: 'Air / Eraser', color: '#1e293b', icon: '◻' },
            { id: 'P', name: 'Player Spawn', color: '#38bdf8', icon: '●' },
            { id: 'G', name: 'Goal Portal', color: '#a855f7', icon: '★' },
            { id: '^', name: 'Spike Up', color: '#ef4444', icon: '▲' },
            { id: 'v', name: 'Spike Down', color: '#ef4444', icon: '▼' },
            { id: '<', name: 'Spike Left', color: '#ef4444', icon: '◀' },
            { id: '>', name: 'Spike Right', color: '#ef4444', icon: '▶' },
            { id: 'D', name: 'Dash Crystal', color: '#06b6d4', icon: '◆' },
            { id: 'B', name: 'Jump Pad', color: '#22c55e', icon: '⏏' },
            { id: 'C', name: 'Crumble Block', color: '#eab308', icon: '▦' },
            { id: 'S', name: 'Sawblade', color: '#f97316', icon: '⚙' },
            { id: 'M', name: 'Moving Platform', color: '#6366f1', icon: '↔' },
            { id: '*', name: 'Secret Star', color: '#fbbf24', icon: '⭐' }
        ];

        this.initEmptyGrid();
        this.setupEditorUI();
    }

    initEmptyGrid() {
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    row.push('#');
                } else {
                    row.push('.');
                }
            }
            this.grid.push(row);
        }
        this.grid[this.height - 2][2] = 'P';
        this.grid[this.height - 2][this.width - 3] = 'G';
    }

    loadLevelIntoEditor(rawLevel) {
        if (!rawLevel || !rawLevel.grid) return;
        this.height = rawLevel.grid.length;
        this.width = rawLevel.grid[0].length;
        this.grid = rawLevel.grid.map(row => row.split(''));
    }

    setupEditorUI() {
        const editorToolbar = document.getElementById('editor-toolbar');
        if (!editorToolbar) return;

        editorToolbar.innerHTML = '';

        // Generate palette buttons
        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'palette-grid';

        this.tileTypes.forEach(t => {
            const btn = document.createElement('button');
            btn.className = `palette-btn ${this.selectedTile === t.id ? 'active' : ''}`;
            btn.title = t.name;
            btn.innerHTML = `<span class="icon" style="color: ${t.color}">${t.icon}</span><span class="label">${t.name}</span>`;
            btn.onclick = () => {
                this.selectedTile = t.id;
                document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
            paletteContainer.appendChild(btn);
        });

        editorToolbar.appendChild(paletteContainer);

        // Actions (Playtest, Export, Import, Clear)
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'editor-actions';

        actionsContainer.innerHTML = `
            <button id="btn-test-level" class="btn primary-btn">▶ Playtest (Tab)</button>
            <button id="btn-copy-ascii" class="btn secondary-btn">📋 Copy ASCII Code</button>
            <button id="btn-import-ascii" class="btn secondary-btn">📥 Import ASCII</button>
            <button id="btn-clear-level" class="btn danger-btn">🗑 Clear Grid</button>
        `;

        editorToolbar.appendChild(actionsContainer);

        document.getElementById('btn-test-level')?.addEventListener('click', () => this.toggleTestPlay());
        document.getElementById('btn-copy-ascii')?.addEventListener('click', () => this.exportAsciiToClipboard());
        document.getElementById('btn-import-ascii')?.addEventListener('click', () => this.showImportModal());
        document.getElementById('btn-clear-level')?.addEventListener('click', () => {
            if (confirm('Clear canvas to empty room?')) {
                this.initEmptyGrid();
            }
        });
    }

    toggleEditor() {
        this.active = !this.active;
        const editorPanel = document.getElementById('editor-panel');
        if (editorPanel) {
            editorPanel.style.display = this.active ? 'flex' : 'none';
        }

        if (this.active) {
            // Load current level into editor grid
            const currentRaw = window.RAW_LEVELS_SOURCE[this.game.currentLevelIndex];
            if (currentRaw) {
                this.loadLevelIntoEditor(currentRaw);
            }
            this.game.paused = true;
        } else {
            this.game.paused = false;
        }
    }

    toggleTestPlay() {
        // Compile current editor grid and load directly into game
        const raw = {
            name: "Custom Test Level",
            tip: "Testing custom creation! Press TAB to resume editing.",
            grid: this.grid.map(row => row.join(''))
        };

        const compiled = window.parseAsciiLevel(raw);
        this.active = false;
        const editorPanel = document.getElementById('editor-panel');
        if (editorPanel) editorPanel.style.display = 'none';

        this.game.loadCustomLevel(compiled);
        window.soundFX.playWin();
    }

    exportAsciiToClipboard() {
        const ascii = this.grid.map(row => `"${row.join('')}"`).join(',\n');
        const formatted = `{\n  name: "My Custom Level",\n  tip: "Your tip here...",\n  grid: [\n${ascii}\n  ]\n}`;
        
        navigator.clipboard.writeText(formatted).then(() => {
            alert("Level ASCII code copied to clipboard! You can paste it into levels.js or share it!");
        }).catch(() => {
            prompt("Copy level code below:", formatted);
        });
    }

    showImportModal() {
        const input = prompt("Paste your ASCII Level code (or raw grid lines) here:");
        if (!input) return;

        try {
            // Check if user pasted full object or just strings
            let gridLines = [];
            if (input.includes('grid:')) {
                const match = input.match(/grid:\s*\[([\s\S]*?)\]/);
                if (match) {
                    const rawRows = match[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(s => s.length > 0);
                    gridLines = rawRows;
                }
            } else {
                gridLines = input.split('\n').map(s => s.trim().replace(/^["']|["'],?$/g, '')).filter(s => s.length > 0);
            }

            if (gridLines.length >= 3) {
                this.height = gridLines.length;
                this.width = gridLines[0].length;
                this.grid = gridLines.map(row => row.split(''));
                alert("Level imported successfully into editor!");
            } else {
                alert("Could not recognize valid level grid format.");
            }
        } catch (e) {
            alert("Failed to parse level: " + e.message);
        }
    }

    handleMouseDown(tileX, tileY, isRightClick = false) {
        if (!this.active) return;
        this.isMouseDown = true;
        this.setTile(tileX, tileY, isRightClick ? '.' : this.selectedTile);
    }

    handleMouseMove(tileX, tileY, isRightClick = false) {
        this.hoverTile = { x: tileX, y: tileY };
        if (this.active && this.isMouseDown) {
            this.setTile(tileX, tileY, isRightClick ? '.' : this.selectedTile);
        }
    }

    handleMouseUp() {
        this.isMouseDown = false;
    }

    setTile(tx, ty, tileChar) {
        if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return;

        // Ensure unique Spawn (P) and Goal (G)
        if (tileChar === 'P' || tileChar === 'G') {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (this.grid[y][x] === tileChar) {
                        this.grid[y][x] = '.';
                    }
                }
            }
        }

        this.grid[ty][tx] = tileChar;
    }

    render(ctx) {
        if (!this.active) return;

        const tileSize = 32;

        // Render editor grid overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;

        for (let x = 0; x <= this.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * tileSize, 0);
            ctx.lineTo(x * tileSize, this.height * tileSize);
            ctx.stroke();
        }

        for (let y = 0; y <= this.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * tileSize);
            ctx.lineTo(this.width * tileSize, y * tileSize);
            ctx.stroke();
        }

        // Draw tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const char = this.grid[y][x];
                const px = x * tileSize;
                const py = y * tileSize;

                if (char === '#') {
                    ctx.fillStyle = '#4f46e5';
                    ctx.fillRect(px, py, tileSize, tileSize);
                    ctx.strokeStyle = '#818cf8';
                    ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
                } else if (char === 'P') {
                    ctx.fillStyle = '#38bdf8';
                    ctx.beginPath();
                    ctx.arc(px + 16, py + 16, 12, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('P', px + 16, py + 20);
                } else if (char === 'G') {
                    ctx.fillStyle = '#a855f7';
                    ctx.beginPath();
                    ctx.arc(px + 16, py + 16, 14, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('G', px + 16, py + 20);
                } else if (char === '^') {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(px, py + tileSize);
                    ctx.lineTo(px + 16, py);
                    ctx.lineTo(px + tileSize, py + tileSize);
                    ctx.fill();
                } else if (char === 'v') {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + 16, py + tileSize);
                    ctx.lineTo(px + tileSize, py);
                    ctx.fill();
                } else if (char === '<') {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(px + tileSize, py);
                    ctx.lineTo(px, py + 16);
                    ctx.lineTo(px + tileSize, py + tileSize);
                    ctx.fill();
                } else if (char === '>') {
                    ctx.fillStyle = '#ef4444';
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + tileSize, py + 16);
                    ctx.lineTo(px, py + tileSize);
                    ctx.fill();
                } else if (char === 'D') {
                    ctx.fillStyle = '#06b6d4';
                    ctx.beginPath();
                    ctx.moveTo(px + 16, py + 4);
                    ctx.lineTo(px + 28, py + 16);
                    ctx.lineTo(px + 16, py + 28);
                    ctx.lineTo(px + 4, py + 16);
                    ctx.closePath();
                    ctx.fill();
                } else if (char === 'B') {
                    ctx.fillStyle = '#22c55e';
                    ctx.fillRect(px + 4, py + 20, 24, 12);
                    ctx.fillStyle = '#86efac';
                    ctx.fillRect(px + 2, py + 16, 28, 6);
                } else if (char === 'C') {
                    ctx.fillStyle = '#eab308';
                    ctx.fillRect(px + 2, py + 2, 28, 28);
                    ctx.fillStyle = '#713f12';
                    ctx.fillRect(px + 6, py + 6, 20, 20);
                } else if (char === 'S') {
                    ctx.fillStyle = '#f97316';
                    ctx.beginPath();
                    ctx.arc(px + 16, py + 16, 12, 0, Math.PI * 2);
                    ctx.fill();
                } else if (char === 'M') {
                    ctx.fillStyle = '#6366f1';
                    ctx.fillRect(px, py + 8, 32, 16);
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('↔', px + 16, py + 20);
                } else if (char === '*') {
                    ctx.fillStyle = '#fbbf24';
                    ctx.font = '20px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('★', px + 16, py + 22);
                }
            }
        }

        // Hover cursor box
        if (this.hoverTile.x >= 0 && this.hoverTile.x < this.width &&
            this.hoverTile.y >= 0 && this.hoverTile.y < this.height) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.hoverTile.x * tileSize, this.hoverTile.y * tileSize, tileSize, tileSize);
        }
    }
}

window.LevelEditor = LevelEditor;
