/**
 * Levels for JumpPulse
 * 
 * Legend:
 *  '#' : Solid Block
 *  'P' : Player Spawn
 *  'G' : Goal / Exit Warp
 *  '^' : Spike (Up)
 *  'v' : Spike (Down)
 *  '<' : Spike (Left)
 *  '>' : Spike (Right)
 *  'B' : Jump Pad / Bounce Spring
 *  'D' : Dash Recharge Gem
 *  'C' : Crumble Block (collapses after step)
 *  'S' : Sawblade Hazard
 *  'M' : Horizontal Moving Platform
 *  'V' : Vertical Moving Platform
 *  '*' : Strawberry / Secret Star (Collectable bonus)
 *  '.' : Air (Empty space)
 */

const RAW_LEVELS = [
    // Level 1: First Steps (Basic Movement & Jumping)
    {
        name: "1. First Steps",
        tip: "A / D or Arrows to Move. SPACE / W to Jump (Hold higher!). Reach the Portal.",
        grid: [
            "##############################",
            "#............................#",
            "#............................#",
            "#............................#",
            "#............................#",
            "#............................#",
            "#............................#",
            "#...................####...G.#",
            "#.............###...####...###",
            "#.......###...###...####.....#",
            "#...P...###...###...####.....#",
            "##############################"
        ]
    },

    // Level 2: Spikes & Danger
    {
        name: "2. The Pit of Needles",
        tip: "Watch the spikes! Time your hops carefully.",
        grid: [
            "##############################",
            "#............................#",
            "#............................#",
            "#............................#",
            "#......................*...G.#",
            "#..................###########",
            "#...........###..............#",
            "#......###..###..............#",
            "#..P...###..###..............#",
            "#####^^###^^###^^^^^^^^#######",
            "##############################",
            "##############################"
        ]
    },

    // Level 3: Wall Jumps
    {
        name: "3. Wall Climber",
        tip: "Press Jump while sliding against a wall to Wall-Jump upwards!",
        grid: [
            "##############################",
            "#G...........................#",
            "###..........................#",
            "#............................#",
            "#.....#...#..................#",
            "#.....#...#...###............#",
            "#.....#...#...#..............#",
            "#.....#...#...#...#..........#",
            "#.....#...#...#...#..........#",
            "#.....#...#...#...#..*.......#",
            "#..P..#...#...#...############",
            "##############################"
        ]
    },

    // Level 4: The Air Dash (Calibrated reachable gap with dash)
    {
        name: "4. Hyper Dash",
        tip: "Jump and press SHIFT or X in mid-air to Dash across the chasm!",
        grid: [
            "##############################",
            "#............................#",
            "#............................#",
            "#............................#",
            "#........................G...#",
            "#......................#####.#",
            "#............................#",
            "#............................#",
            "#..P..........*..............#",
            "########^^^^^^^^^^^^^#########",
            "##############################",
            "##############################"
        ]
    },

    // Level 5: Dash Crystals (Chain mid-air dashes)
    {
        name: "5. Crystal Chasm",
        tip: "Dash into floating Cyan Gems (D) to instantly recharge your dash mid-air!",
        grid: [
            "##############################",
            "#............................#",
            "#............................#",
            "#............................#",
            "#.........................G..#",
            "#.......................####.#",
            "#................D...........#",
            "#..........D.................#",
            "#.....D......................#",
            "#..P.........................#",
            "####^^^^^^^^^^^^^^^^^^^^^^^^##",
            "##############################"
        ]
    },

    // Level 6: Springs & Crumble Blocks
    {
        name: "6. Bounce & Decay",
        tip: "Bounce Pads (B) launch you high! Yellow Crumble Blocks (C) break after you land.",
        grid: [
            "##############################",
            "#.........................*..#",
            "#.........................G..#",
            "#.......................######",
            "#............................#",
            "#..................CCC.......#",
            "#............CCC.............#",
            "#......B.....................#",
            "#....#####...................#",
            "#..P.........................#",
            "##############################",
            "##############################"
        ]
    },

    // Level 7: Moving Platforms & Saws
    {
        name: "7. Industrial Hazard",
        tip: "Watch out for spinning Sawblades (S)! Ride moving platforms to safety.",
        grid: [
            "##############################",
            "#............................#",
            "#............................#",
            "#..................S......G..#",
            "#...............#######.######",
            "#.....S......................#",
            "#....###..M......M...........#",
            "#............................#",
            "#..P.........................#",
            "######^^^^^^^^^^^^^^^^^^######",
            "##############################",
            "##############################"
        ]
    },

    // Level 8: The Gauntlet
    {
        name: "8. The Zenith Gauntlet",
        tip: "Combine wall jumps, dash resets, bounce pads, and precision timing!",
        grid: [
            "##############################",
            "#G.#...........*.............#",
            "##.#..S....S...C...D...S.....#",
            "#..#..#....#...........#.....#",
            "#..#..#....#...........#.....#",
            "#.....#....#...........#.....#",
            "#.....#....#...........#.....#",
            "#.....#..B.#...........#.....#",
            "#.....######...........#.....#",
            "#......................#.....#",
            "#..P.........D.........#..B..#",
            "######^^^^^^^^^^^^^^^^########"
        ]
    }
];

// Helper to parse ASCII grid into structured level data
function parseAsciiLevel(raw) {
    const grid = raw.grid.map(row => row.split(''));
    const height = grid.length;
    const width = grid[0].length;

    let playerSpawn = { x: 2, y: 2 };
    let goal = { x: width - 3, y: height - 3 };
    const entities = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const char = grid[y][x];
            if (char === 'P') {
                playerSpawn = { x: x * 32, y: y * 32 };
                grid[y][x] = '.'; // clear tile under player
            } else if (char === 'G') {
                goal = { x: x * 32, y: y * 32 };
                grid[y][x] = '.';
            } else if (char === 'D') {
                entities.push({ type: 'crystal', x: x * 32 + 16, y: y * 32 + 16, active: true, respawnTimer: 0 });
                grid[y][x] = '.';
            } else if (char === 'B') {
                entities.push({ type: 'spring', x: x * 32, y: y * 32, bounceTimer: 0 });
                grid[y][x] = '.';
            } else if (char === 'S') {
                entities.push({ type: 'saw', x: x * 32 + 16, y: y * 32 + 16, radius: 14, angle: 0 });
                grid[y][x] = '.';
            } else if (char === 'M') {
                entities.push({ type: 'moving_plat', x: x * 32, y: y * 32, w: 48, h: 14, startX: x * 32, dir: 1, range: 96, speed: 60, axis: 'x' });
                grid[y][x] = '.';
            } else if (char === 'V') {
                entities.push({ type: 'moving_plat', x: x * 32, y: y * 32, w: 48, h: 14, startY: y * 32, dir: 1, range: 96, speed: 60, axis: 'y' });
                grid[y][x] = '.';
            } else if (char === 'C') {
                entities.push({ type: 'crumble', x: x * 32, y: y * 32, w: 32, h: 32, state: 'solid', timer: 0 });
                grid[y][x] = '.';
            } else if (char === '*') {
                entities.push({ type: 'star', x: x * 32 + 16, y: y * 32 + 16, collected: false });
                grid[y][x] = '.';
            }
        }
    }

    return {
        name: raw.name || "Custom Level",
        tip: raw.tip || "Reach the goal portal!",
        width,
        height,
        grid,
        playerSpawn,
        goal,
        entities
    };
}

window.GAME_LEVELS = RAW_LEVELS.map(parseAsciiLevel);
window.RAW_LEVELS_SOURCE = RAW_LEVELS;
window.parseAsciiLevel = parseAsciiLevel;
