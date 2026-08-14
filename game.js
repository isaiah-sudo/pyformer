/**
 * JumpPulse - High Juice Precision Platformer Physics Engine & Main Game Loop
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.tileSize = 32;

        // Display Setup (Virtual resolution: 960x384, scale up dynamically)
        this.width = 960;
        this.height = 384;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game State
        this.currentLevelIndex = 0;
        this.level = null;
        this.deaths = 0;
        this.starsCollected = 0;
        this.levelTimer = 0;
        this.totalTimer = 0;
        this.paused = false;
        this.screenShake = 0;
        this.particles = [];
        this.trails = [];
        this.floatingTexts = [];

        // Player physics state
        this.player = {
            x: 100,
            y: 100,
            w: 16,
            h: 22,
            vx: 0,
            vy: 0,
            speed: 200,
            accel: 1800,
            decel: 1600,
            jumpForce: 450,
            gravity: 1150,
            maxFallSpeed: 540,
            grounded: false,
            coyoteTimer: 0,
            jumpBuffer: 0,
            canDash: true,
            isDashing: false,
            dashTimer: 0,
            dashDuration: 0.16,
            dashSpeed: 520,
            dashDir: { x: 1, y: 0 },
            onWall: 0, // -1 left, 1 right, 0 none
            facing: 1,
            squashX: 1,
            squashY: 1,
            isDead: false,
            respawnTimer: 0
        };

        // Inputs
        this.keys = {};
        this.setupInputs();

        // Level Editor
        this.editor = new LevelEditor(this);

        // Load Initial Level
        this.loadLevel(0);

        // Main Loop timing
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.editor.toggleEditor();
                return;
            }

            if (this.keys[e.code]) return; // avoid duplicate press
            this.keys[e.code] = true;

            // Audio unlock
            window.soundFX.init();

            // Restart shortcut (R)
            if (e.code === 'KeyR' && !this.editor.active) {
                this.killPlayer();
            }

            // Jump trigger with buffer
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyZ') {
                this.player.jumpBuffer = 0.12;
            }

            // Dash trigger
            if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX' || e.code === 'KeyK') && !this.editor.active) {
                this.tryDash();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            // Variable jump height cut
            if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'KeyZ') && this.player.vy < -80) {
                this.player.vy *= 0.45;
            }
        });

        window.addEventListener('blur', () => {
            this.keys = {};
        });

        // Mouse events for editor
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.tileSize);
            const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.tileSize);
            this.editor.handleMouseDown(x, y, e.button === 2);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.tileSize);
            const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.tileSize);
            this.editor.handleMouseMove(x, y, e.buttons === 2);
        });

        window.addEventListener('mouseup', () => {
            this.editor.handleMouseUp();
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    loadLevel(index) {
        if (index < 0 || index >= window.GAME_LEVELS.length) {
            index = 0;
        }
        this.currentLevelIndex = index;
        const raw = window.RAW_LEVELS_SOURCE[index];
        this.level = window.parseAsciiLevel(raw);
        this.levelTimer = 0;
        this.respawnPlayer(false);
        this.updateHUD();
    }

    loadCustomLevel(levelObj) {
        this.level = levelObj;
        this.levelTimer = 0;
        this.respawnPlayer(false);
        this.updateHUD();
    }

    respawnPlayer(countDeath = true) {
        if (countDeath) {
            this.deaths++;
            this.updateHUD();
        }

        const p = this.player;
        p.x = this.level.playerSpawn.x + (this.tileSize - p.w) / 2;
        p.y = this.level.playerSpawn.y + (this.tileSize - p.h);
        p.vx = 0;
        p.vy = 0;
        p.grounded = false;
        p.canDash = true;
        p.isDashing = false;
        p.dashTimer = 0;
        p.squashX = 1;
        p.squashY = 1;
        p.isDead = false;
        p.respawnTimer = 0;

        // Reset entities
        this.level.entities.forEach(ent => {
            if (ent.type === 'crystal') {
                ent.active = true;
                ent.respawnTimer = 0;
            }
            if (ent.type === 'crumble') {
                ent.state = 'solid';
                ent.timer = 0;
            }
        });
    }

    killPlayer() {
        if (this.player.isDead) return;
        this.player.isDead = true;
        this.player.respawnTimer = 0.25;
        this.screenShake = 10;
        window.soundFX.playDeath();

        // Spawn death particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50;
            this.particles.push({
                x: this.player.x + this.player.w / 2,
                y: this.player.y + this.player.h / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: Math.random() > 0.5 ? '#38bdf8' : '#f43f5e',
                size: Math.random() * 4 + 2,
                life: 0.45,
                maxLife: 0.45
            });
        }
    }

    tryDash() {
        const p = this.player;
        if (!p.canDash || p.isDashing || p.isDead) return;

        // Determine dash direction from movement inputs
        let dx = 0;
        let dy = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) dx += 1;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) dy -= 1;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) dy += 1;

        if (dx === 0 && dy === 0) {
            dx = p.facing;
        }

        // Normalize
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;

        p.canDash = false;
        p.isDashing = true;
        p.dashTimer = p.dashDuration;
        p.dashDir = { x: dx, y: dy };
        p.vx = dx * p.dashSpeed;
        p.vy = dy * p.dashSpeed;

        p.squashX = dx !== 0 ? 1.4 : 0.7;
        p.squashY = dy !== 0 ? 1.4 : 0.7;
        this.screenShake = 4;

        window.soundFX.playDash();

        // Dash burst particles
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: p.x + p.w / 2,
                y: p.y + p.h / 2,
                vx: -dx * (Math.random() * 100 + 40) + (Math.random() * 40 - 20),
                vy: -dy * (Math.random() * 100 + 40) + (Math.random() * 40 - 20),
                color: '#38bdf8',
                size: 3,
                life: 0.25,
                maxLife: 0.25
            });
        }
    }

    updateHUD() {
        document.getElementById('hud-level-name').innerText = this.level.name;
        document.getElementById('hud-level-tip').innerText = this.level.tip;
        document.getElementById('hud-deaths').innerText = this.deaths;
        document.getElementById('hud-stars').innerText = this.starsCollected;

        const minutes = Math.floor(this.totalTimer / 60);
        const seconds = (this.totalTimer % 60).toFixed(1).padStart(4, '0');
        document.getElementById('hud-time').innerText = `${minutes}:${seconds}`;
    }

    addFloatingText(text, x, y, color = '#fbbf24') {
        this.floatingTexts.push({
            text,
            x,
            y,
            vy: -40,
            life: 0.8,
            maxLife: 0.8,
            color
        });
    }

    update(dt) {
        if (this.editor.active) return;

        // Timers
        this.levelTimer += dt;
        this.totalTimer += dt;
        this.updateHUD();

        // Screen shake decay
        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - dt * 25);
        }

        // Entity updates
        this.updateEntities(dt);

        // Player Death & Respawn
        const p = this.player;
        if (p.isDead) {
            p.respawnTimer -= dt;
            if (p.respawnTimer <= 0) {
                this.respawnPlayer(true);
            }
            this.updateParticles(dt);
            return;
        }

        // Squash & stretch recovery
        p.squashX += (1 - p.squashX) * 12 * dt;
        p.squashY += (1 - p.squashY) * 12 * dt;

        // Input Horizontal: support WASD, Arrow keys, and KeyQ/KeyD
        let moveX = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveX -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) moveX += 1;

        if (moveX !== 0) p.facing = moveX;

        // Coyote & Jump Buffer timers
        if (p.grounded) {
            p.coyoteTimer = 0.12;
            p.canDash = true;
        } else {
            p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
        }
        p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);

        // Dash Physics
        if (p.isDashing) {
            p.dashTimer -= dt;
            p.vx = p.dashDir.x * p.dashSpeed;
            p.vy = p.dashDir.y * p.dashSpeed;

            // Spawn dash trail ghost
            this.trails.push({
                x: p.x,
                y: p.y,
                w: p.w,
                h: p.h,
                life: 0.18,
                maxLife: 0.18,
                squashX: p.squashX,
                squashY: p.squashY
            });

            if (p.dashTimer <= 0) {
                p.isDashing = false;
                p.vx *= 0.5;
                p.vy *= 0.3;
            }
        } else {
            // Standard Horizontal Movement with snappy acceleration and responsive braking
            const targetSpeed = moveX * p.speed;
            if (moveX !== 0) {
                // Accelerating
                if (Math.sign(p.vx) !== 0 && Math.sign(p.vx) !== moveX) {
                    // Quick turn-around decel
                    p.vx += moveX * p.accel * 2.2 * dt;
                } else {
                    p.vx += moveX * p.accel * dt;
                }
                if (Math.abs(p.vx) > p.speed) {
                    p.vx = Math.sign(p.vx) * p.speed;
                }
            } else {
                // Decelerating to stop
                if (p.vx > 0) {
                    p.vx = Math.max(0, p.vx - p.decel * dt);
                } else if (p.vx < 0) {
                    p.vx = Math.min(0, p.vx + p.decel * dt);
                }
            }

            // Wall Sliding & Wall Jumping
            if (p.onWall !== 0 && !p.grounded && p.vy > 0) {
                p.vy = Math.min(p.vy, 90); // gentle slide down walls
            } else {
                p.vy += p.gravity * dt;
                p.vy = Math.min(p.vy, p.maxFallSpeed);
            }

            // Jump handling
            if (p.jumpBuffer > 0) {
                if (p.coyoteTimer > 0) {
                    // Standard Ground / Ledge Jump
                    p.vy = -p.jumpForce;
                    p.coyoteTimer = 0;
                    p.jumpBuffer = 0;
                    p.grounded = false;
                    p.squashX = 0.75;
                    p.squashY = 1.3;
                    window.soundFX.playJump();
                    this.createDust(p.x + p.w / 2, p.y + p.h);
                } else if (p.onWall !== 0) {
                    // Wall Jump
                    p.vy = -p.jumpForce * 0.95;
                    p.vx = -p.onWall * p.speed * 1.25;
                    p.facing = -p.onWall;
                    p.jumpBuffer = 0;
                    p.squashX = 0.75;
                    p.squashY = 1.3;
                    window.soundFX.playWallJump();
                    this.createDust(p.x + (p.onWall === 1 ? p.w : 0), p.y + p.h / 2);
                }
            }
        }

        // Apply movement & collisions
        this.moveAndCollide(dt);

        // Check goal collision
        const goalRect = { x: this.level.goal.x, y: this.level.goal.y, w: 32, h: 32 };
        if (this.rectsOverlap(p, goalRect)) {
            this.levelCompleted();
        }

        // Check out of bounds death
        if (p.y > this.height + 40 || p.y < -100) {
            this.killPlayer();
        }

        // Particles & visual updates
        this.updateParticles(dt);
    }

    moveAndCollide(dt) {
        const p = this.player;

        // 1. Move X
        p.x += p.vx * dt;
        p.onWall = 0;

        let solidsX = this.getTileCollisions(p);
        for (const block of solidsX) {
            if (block.type === 'hazard') {
                this.killPlayer();
                return;
            }
            if (block.type === 'solid') {
                if (p.vx > 0) {
                    p.x = block.x - p.w;
                    p.onWall = 1;
                } else if (p.vx < 0) {
                    p.x = block.x + block.w;
                    p.onWall = -1;
                }
                p.vx = 0;
            }
        }

        // Check wall cling if pressing into wall even without high vx
        if (p.onWall === 0 && !p.grounded) {
            const leftSensor = { x: p.x - 2, y: p.y + 4, w: 2, h: p.h - 8 };
            const rightSensor = { x: p.x + p.w, y: p.y + 4, w: 2, h: p.h - 8 };
            if (this.hasSolidCollision(leftSensor)) p.onWall = -1;
            else if (this.hasSolidCollision(rightSensor)) p.onWall = 1;
        }

        // 2. Move Y
        const wasGrounded = p.grounded;
        p.grounded = false;
        p.y += p.vy * dt;

        let solidsY = this.getTileCollisions(p);
        for (const block of solidsY) {
            if (block.type === 'hazard') {
                this.killPlayer();
                return;
            }
            if (block.type === 'solid') {
                if (p.vy > 0) {
                    p.y = block.y - p.h;
                    p.vy = 0;
                    p.grounded = true;
                    if (!wasGrounded) {
                        p.squashX = 1.25;
                        p.squashY = 0.75;
                        window.soundFX.playLand();
                        this.createDust(p.x + p.w / 2, p.y + p.h);
                    }
                } else if (p.vy < 0) {
                    p.y = block.y + block.h;
                    p.vy = 0;
                }
            }
        }
    }

    hasSolidCollision(rect) {
        const collisions = this.getTileCollisions(rect);
        return collisions.some(c => c.type === 'solid');
    }

    getTileCollisions(rect) {
        const collisions = [];
        const minX = Math.floor(rect.x / this.tileSize);
        const maxX = Math.floor((rect.x + rect.w - 0.01) / this.tileSize);
        const minY = Math.floor(rect.y / this.tileSize);
        const maxY = Math.floor((rect.y + rect.h - 0.01) / this.tileSize);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (y < 0 || y >= this.level.height || x < 0 || x >= this.level.width) continue;
                const char = this.level.grid[y][x];

                if (char === '#') {
                    collisions.push({
                        type: 'solid',
                        x: x * this.tileSize,
                        y: y * this.tileSize,
                        w: this.tileSize,
                        h: this.tileSize
                    });
                } else if (char === '^' || char === 'v' || char === '<' || char === '>') {
                    // Precision hitbox for spikes (inset to feel fair)
                    let hx = x * this.tileSize;
                    let hy = y * this.tileSize;
                    let hw = this.tileSize;
                    let hh = this.tileSize;

                    if (char === '^') { hy += 12; hh = 20; hx += 4; hw = 24; }
                    if (char === 'v') { hh = 20; hx += 4; hw = 24; }
                    if (char === '<') { hx += 12; hw = 20; hy += 4; hh = 24; }
                    if (char === '>') { hw = 20; hy += 4; hh = 24; }

                    if (this.rectsOverlap(rect, { x: hx, y: hy, w: hw, h: hh })) {
                        collisions.push({ type: 'hazard' });
                    }
                }
            }
        }

        // Entity solid checks (Crumble & Moving Platforms)
        this.level.entities.forEach(ent => {
            if (ent.type === 'crumble' && ent.state === 'solid') {
                if (this.rectsOverlap(rect, ent)) {
                    collisions.push({
                        type: 'solid',
                        x: ent.x,
                        y: ent.y,
                        w: ent.w,
                        h: ent.h
                    });
                    if (rect.y + rect.h <= ent.y + 8 && this.player.vy >= 0) {
                        ent.state = 'breaking';
                        ent.timer = 0.35;
                    }
                }
            }
            if (ent.type === 'moving_plat') {
                // One-way semi-solid platform from top
                const prevY = rect.y - (this.player.vy * 0.02);
                if (prevY + rect.h <= ent.y + 6 && rect.y + rect.h >= ent.y && rect.x + rect.w > ent.x && rect.x < ent.x + ent.w) {
                    if (this.player.vy >= 0) {
                        collisions.push({
                            type: 'solid',
                            x: ent.x,
                            y: ent.y,
                            w: ent.w,
                            h: ent.h
                        });
                        // Carry player horizontally
                        if (ent.axis === 'x') {
                            this.player.x += ent.dir * ent.speed * 0.016;
                        }
                    }
                }
            }
        });

        return collisions;
    }

    updateEntities(dt) {
        const p = this.player;

        this.level.entities.forEach(ent => {
            // Dash Crystal
            if (ent.type === 'crystal') {
                if (!ent.active) {
                    ent.respawnTimer -= dt;
                    if (ent.respawnTimer <= 0) {
                        ent.active = true;
                        this.createDust(ent.x, ent.y, '#06b6d4');
                    }
                } else {
                    const dist = Math.hypot(p.x + p.w / 2 - ent.x, p.y + p.h / 2 - ent.y);
                    if (dist < 20) {
                        ent.active = false;
                        ent.respawnTimer = 2.5;
                        p.canDash = true;
                        window.soundFX.playGem();
                        this.addFloatingText('+DASH', ent.x, ent.y - 10, '#06b6d4');
                        this.screenShake = 3;
                    }
                }
            }

            // Bounce Spring
            if (ent.type === 'spring') {
                ent.bounceTimer = Math.max(0, ent.bounceTimer - dt);
                const springRect = { x: ent.x + 2, y: ent.y + 16, w: 28, h: 16 };
                if (this.rectsOverlap(p, springRect) && p.vy > -50) {
                    p.vy = -560;
                    p.canDash = true;
                    p.squashX = 0.6;
                    p.squashY = 1.5;
                    ent.bounceTimer = 0.2;
                    window.soundFX.playBounce();
                    this.screenShake = 4;
                }
            }

            // Sawblade Hazard
            if (ent.type === 'saw') {
                ent.angle += 12 * dt;
                const dist = Math.hypot(p.x + p.w / 2 - ent.x, p.y + p.h / 2 - ent.y);
                if (dist < ent.radius + 6) {
                    this.killPlayer();
                }
            }

            // Moving Platform
            if (ent.type === 'moving_plat') {
                if (ent.axis === 'x') {
                    ent.x += ent.dir * ent.speed * dt;
                    if (Math.abs(ent.x - ent.startX) > ent.range) {
                        ent.dir *= -1;
                    }
                } else {
                    ent.y += ent.dir * ent.speed * dt;
                    if (Math.abs(ent.y - ent.startY) > ent.range) {
                        ent.dir *= -1;
                    }
                }
            }

            // Crumble Block
            if (ent.type === 'crumble') {
                if (ent.state === 'breaking') {
                    ent.timer -= dt;
                    if (ent.timer <= 0) {
                        ent.state = 'broken';
                        ent.timer = 2.0; // respawn timer
                        this.createDust(ent.x + 16, ent.y + 16, '#eab308');
                    }
                } else if (ent.state === 'broken') {
                    ent.timer -= dt;
                    if (ent.timer <= 0) {
                        ent.state = 'solid';
                    }
                }
            }

            // Secret Star
            if (ent.type === 'star' && !ent.collected) {
                const dist = Math.hypot(p.x + p.w / 2 - ent.x, p.y + p.h / 2 - ent.y);
                if (dist < 22) {
                    ent.collected = true;
                    this.starsCollected++;
                    window.soundFX.playGem();
                    this.addFloatingText('★ STAR!', ent.x, ent.y - 12, '#fbbf24');
                    this.screenShake = 5;
                }
            }
        });
    }

    rectsOverlap(r1, r2) {
        return (
            r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y
        );
    }

    createDust(x, y, color = 'rgba(255,255,255,0.7)') {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 80,
                vy: -Math.random() * 40 - 10,
                color,
                size: Math.random() * 3 + 2,
                life: 0.25,
                maxLife: 0.25
            });
        }
    }

    updateParticles(dt) {
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const t = this.trails[i];
            t.life -= dt;
            if (t.life <= 0) {
                this.trails.splice(i, 1);
            }
        }

        // Floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy * dt;
            ft.life -= dt;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    levelCompleted() {
        window.soundFX.playWin();
        if (this.currentLevelIndex < window.GAME_LEVELS.length - 1) {
            this.loadLevel(this.currentLevelIndex + 1);
        } else {
            // Victory screen
            document.getElementById('victory-modal').style.display = 'flex';
            document.getElementById('final-time').innerText = document.getElementById('hud-time').innerText;
            document.getElementById('final-deaths').innerText = this.deaths;
            document.getElementById('final-stars').innerText = this.starsCollected;
        }
    }

    render() {
        const ctx = this.ctx;

        // Apply screen shake
        ctx.save();
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            ctx.translate(shakeX, shakeY);
        }

        // Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#090d16');
        bgGrad.addColorStop(1, '#111827');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        if (this.editor.active) {
            this.editor.render(ctx);
            ctx.restore();
            return;
        }

        // Draw Tiles
        for (let y = 0; y < this.level.height; y++) {
            for (let x = 0; x < this.level.width; x++) {
                const char = this.level.grid[y][x];
                const px = x * this.tileSize;
                const py = y * this.tileSize;

                if (char === '#') {
                    ctx.fillStyle = '#312e81';
                    ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    ctx.fillStyle = '#4338ca';
                    ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
                    // Subtle block highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.fillRect(px + 2, py + 2, this.tileSize - 4, 3);
                } else if (char === '^') {
                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath();
                    ctx.moveTo(px + 2, py + this.tileSize);
                    ctx.lineTo(px + 16, py + 8);
                    ctx.lineTo(px + 30, py + this.tileSize);
                    ctx.fill();
                } else if (char === 'v') {
                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath();
                    ctx.moveTo(px + 2, py);
                    ctx.lineTo(px + 16, py + 24);
                    ctx.lineTo(px + 30, py);
                    ctx.fill();
                } else if (char === '<') {
                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath();
                    ctx.moveTo(px + this.tileSize, py + 2);
                    ctx.lineTo(px + 8, py + 16);
                    ctx.lineTo(px + this.tileSize, py + 30);
                    ctx.fill();
                } else if (char === '>') {
                    ctx.fillStyle = '#f43f5e';
                    ctx.beginPath();
                    ctx.moveTo(px, py + 2);
                    ctx.lineTo(px + 24, py + 16);
                    ctx.lineTo(px, py + 30);
                    ctx.fill();
                }
            }
        }

        // Draw Goal Portal
        const gx = this.level.goal.x;
        const gy = this.level.goal.y;
        const time = performance.now() * 0.003;
        ctx.save();
        ctx.translate(gx + 16, gy + 16);
        ctx.rotate(time);
        const portalGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
        portalGrad.addColorStop(0, '#c084fc');
        portalGrad.addColorStop(0.6, '#9333ea');
        portalGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.fillStyle = portalGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Entities
        this.level.entities.forEach(ent => {
            if (ent.type === 'crystal') {
                if (ent.active) {
                    const bob = Math.sin(performance.now() * 0.005) * 3;
                    ctx.fillStyle = '#06b6d4';
                    ctx.shadowColor = '#06b6d4';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.moveTo(ent.x, ent.y - 12 + bob);
                    ctx.lineTo(ent.x + 9, ent.y + bob);
                    ctx.lineTo(ent.x, ent.y + 12 + bob);
                    ctx.lineTo(ent.x - 9, ent.y + bob);
                    ctx.closePath();
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
                    ctx.strokeRect(ent.x - 6, ent.y - 6, 12, 12);
                }
            }

            if (ent.type === 'spring') {
                ctx.fillStyle = '#15803d';
                ctx.fillRect(ent.x + 4, ent.y + 24, 24, 8);
                ctx.fillStyle = ent.bounceTimer > 0 ? '#bbf7d0' : '#22c55e';
                ctx.fillRect(ent.x + 2, ent.y + (ent.bounceTimer > 0 ? 12 : 18), 28, 6);
            }

            if (ent.type === 'saw') {
                ctx.save();
                ctx.translate(ent.x, ent.y);
                ctx.rotate(ent.angle);
                ctx.fillStyle = '#ea580c';
                ctx.beginPath();
                ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    ctx.lineTo(Math.cos(a) * (ent.radius + 4), Math.sin(a) * (ent.radius + 4));
                    const a2 = ((i + 0.5) / 8) * Math.PI * 2;
                    ctx.lineTo(Math.cos(a2) * (ent.radius - 2), Math.sin(a2) * (ent.radius - 2));
                }
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            if (ent.type === 'moving_plat') {
                ctx.fillStyle = '#4f46e5';
                ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
                ctx.fillStyle = '#818cf8';
                ctx.fillRect(ent.x + 2, ent.y + 2, ent.w - 4, 3);
            }

            if (ent.type === 'crumble') {
                if (ent.state === 'solid' || ent.state === 'breaking') {
                    ctx.fillStyle = ent.state === 'breaking' ? '#ca8a04' : '#eab308';
                    const jiggle = ent.state === 'breaking' ? (Math.random() - 0.5) * 3 : 0;
                    ctx.fillRect(ent.x + jiggle, ent.y + jiggle, ent.w, ent.h);
                    ctx.strokeStyle = '#713f12';
                    ctx.strokeRect(ent.x + jiggle + 2, ent.y + jiggle + 2, ent.w - 4, ent.h - 4);
                }
            }

            if (ent.type === 'star' && !ent.collected) {
                const bob = Math.sin(performance.now() * 0.004) * 4;
                ctx.fillStyle = '#fbbf24';
                ctx.font = '22px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⭐', ent.x, ent.y + bob);
            }
        });

        // Draw Dash Trails
        this.trails.forEach(t => {
            const alpha = (t.life / t.maxLife) * 0.4;
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.fillRect(t.x, t.y, t.w, t.h);
        });

        // Draw Player
        const p = this.player;
        if (!p.isDead) {
            ctx.save();
            const cx = p.x + p.w / 2;
            const cy = p.y + p.h;
            ctx.translate(cx, cy);
            ctx.scale(p.squashX, p.squashY);

            // Player body
            ctx.fillStyle = p.canDash ? '#38bdf8' : '#cbd5e1';
            ctx.fillRect(-p.w / 2, -p.h, p.w, p.h);

            // Player band / visor
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-p.w / 2 + (p.facing === 1 ? 4 : 0), -p.h + 5, 8, 4);

            // Eye dot
            ctx.fillStyle = p.canDash ? '#0284c7' : '#94a3b8';
            ctx.fillRect(-p.w / 2 + (p.facing === 1 ? 8 : 2), -p.h + 6, 3, 3);

            ctx.restore();
        }

        // Draw Particles
        this.particles.forEach(pt => {
            const alpha = pt.life / pt.maxLife;
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
            ctx.globalAlpha = 1;
        });

        // Draw Floating Text
        this.floatingTexts.forEach(ft => {
            const alpha = ft.life / ft.maxLife;
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 13px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.globalAlpha = 1;
        });

        ctx.restore();
    }

    gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap delta time
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
