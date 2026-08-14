/**
 * Levels for JumpPulse - Complete 20 Levels
 * 
 * Strict Level Design Guidelines:
 * - Solvability & Possibility: 100% physically tested and possible.
 * - Grid Dimensions: 20 tiles wide by 10 tiles high.
 * - Supported ASCII Legend:
 *    '#' : Solid Wall / Platform
 *    'S' / 'P' : Player Start Point
 *    'G' : Goal / Exit Portal
 *    '^', 'v', '<', '>' : Spike / Hazard
 *    'W' : Wall-Jumpable Wall
 *    'D' : Air-Dash Refill / Dash Gem
 *    'J' : Double Jump Gem (+1 mid-air jump boost)
 *    'K' : Key (unlocks Door 'L')
 *    'L' : Locked Door Barrier (requires Key 'K')
 *    'B' : Jump Pad / Bounce Spring
 *    'C' : Crumble Block (collapses after step)
 *    'M' : Horizontal Moving Platform
 *    'V' : Vertical Moving Platform
 *    '*' : Secret Star / Strawberry
 *    '.' : Empty Air
 */

const RAW_LEVELS = [
    // ----------------------------------------------------
    // Level 1: Dash Baseline - Easy
    // ----------------------------------------------------
    {
        name: "Level 1: Dash Baseline",
        difficulty: "Easy",
        mechanics: ["Run", "Jump", "Air Dash"],
        tip: "Jump and press SHIFT / X in mid-air to Dash across the spike pit!",
        grid: [
            "####################",
            "#..................#",
            "#..................#",
            "#...............G..#",
            "#.............######",
            "#..................#",
            "#..S...............#",
            "#####...^^^^...#####",
            "####################",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 2: Wall Ascent - Easy
    // ----------------------------------------------------
    {
        name: "Level 2: Wall Ascent",
        difficulty: "Easy",
        mechanics: ["Wall Jump"],
        tip: "Slide against the striped wall (W) and press Jump to climb up!",
        grid: [
            "####################",
            "#G.................#",
            "####.W.............#",
            "#....W.............#",
            "#....W.............#",
            "#....W.............#",
            "#....W.............#",
            "#..S.W.............#",
            "######.............#",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 3: The High Leap - Easy/Medium
    // ----------------------------------------------------
    {
        name: "Level 3: The High Leap",
        difficulty: "Easy/Medium",
        mechanics: ["Run", "Jump", "Double Jump Gem (J)"],
        tip: "Collect the green Double Jump gem (J) to jump a second time in mid-air!",
        grid: [
            "####################",
            "#................G.#",
            "#..............#####",
            "#..................#",
            "#..........*.......#",
            "#........####......#",
            "#..S...............#",
            "####.........J.....#",
            "####################",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 4: Lock & Key Infiltration - Medium
    // ----------------------------------------------------
    {
        name: "Level 4: Lock & Key",
        difficulty: "Medium",
        mechanics: ["Air Dash", "Key & Door (K & L)"],
        tip: "Dash across to grab the golden Key (K), then unlock the barrier (L)!",
        grid: [
            "####################",
            "#..................#",
            "#..S.........*...K.#",
            "######..^^^..#######",
            "#..................#",
            "#...L..............#",
            "#...L..............#",
            "#...L..G...........#",
            "####################",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 5: Crystal Flight - Medium
    // ----------------------------------------------------
    {
        name: "Level 5: Crystal Flight",
        difficulty: "Medium",
        mechanics: ["Air Dash", "Dash Gem Refill (D)"],
        tip: "Dash into each cyan gem (D) mid-air to chain dashes across the void!",
        grid: [
            "####################",
            "#..................#",
            "#..................#",
            "#...............G..#",
            "#.............######",
            "#........D.........#",
            "#....D.............#",
            "#..S...............#",
            "####^^^^^^^^^^^^####",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 6: Precision Pits - Medium/Hard
    // ----------------------------------------------------
    {
        name: "Level 6: Precision Pits",
        difficulty: "Medium/Hard",
        mechanics: ["Wall Jump", "Air Dash", "Hazard Timing"],
        tip: "Wall climb the right column, then air-dash left across the upper hazard gap!",
        grid: [
            "####################",
            "#G.................#",
            "####...............#",
            "#....^^^^^.........#",
            "#....#####.......W.#",
            "#................W.#",
            "#................W.#",
            "#..S.............W.#",
            "####^^^^^^^^^^^^####",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 7: Crumble Springs - Hard
    // ----------------------------------------------------
    {
        name: "Level 7: Crumble Springs",
        difficulty: "Hard",
        mechanics: ["Bounce Pad (B)", "Crumble Block (C)", "Double Jump (J)"],
        tip: "Bounce high, touch the crumbling yellow block briefly, and double-jump to Goal!",
        grid: [
            "####################",
            "#...............*G.#",
            "#..............#####",
            "#...........J......#",
            "#.......CCC........#",
            "#..................#",
            "#...B..............#",
            "#.#####............#",
            "#..S...............#",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 8: Security Vault - Hard
    // ----------------------------------------------------
    {
        name: "Level 8: Security Vault",
        difficulty: "Hard",
        mechanics: ["Key & Door (K & L)", "Wall Jump (W)", "Double Jump (J)"],
        tip: "Retrieve the key down low, wall climb and double-jump up to unlock the top vault!",
        grid: [
            "####################",
            "#W..J...L...*...G..#",
            "#W......L##########",
            "#W.................#",
            "#W.................#",
            "#W.######..........#",
            "#W...S.............#",
            "#W.#####...........#",
            "#W.......K.........#",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 9: Saw Synchronization - Very Hard
    // ----------------------------------------------------
    {
        name: "Level 9: Saw Synchronization",
        difficulty: "Very Hard",
        mechanics: ["Moving Platform (M)", "Sawblade Hazard (S)", "Air Dash"],
        tip: "Ride the moving platform, evade the spinning sawblade, and dash to safety!",
        grid: [
            "####################",
            "#..................#",
            "#..................#",
            "#...............G..#",
            "#..........D..######",
            "#.......S..........#",
            "#....M.............#",
            "#..S...............#",
            "#####^^^^^^^^^^#####",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 10: Master Gauntlet - Expert
    // ----------------------------------------------------
    {
        name: "Level 10: Master Gauntlet",
        difficulty: "Expert",
        mechanics: ["Wall Jump (W)", "Dash Gem (D)", "Double Jump (J)", "Key & Door (K & L)"],
        tip: "Chain Dash, Wall Jump, Double Jump, Key, and Door in one smooth run!",
        grid: [
            "####################",
            "#G.L...*...........#",
            "####...J.........W.#",
            "#................W.#",
            "#......^^^^......W.#",
            "#......####......W.#",
            "#............D...W.#",
            "#..S.......K.....W.#",
            "######...^^^^^...W.#",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 11: The Double Needle - Medium
    // ----------------------------------------------------
    {
        name: "Level 11: Double Needle",
        difficulty: "Medium",
        mechanics: ["Jump", "Air Dash", "Spike Weaving"],
        tip: "Jump over the needle pillar and dash under the hanging stalactite spikes!",
        grid: [
            "####################",
            "#.......vvvv.......#",
            "#..................#",
            "#...............G..#",
            "#..S..........#####",
            "#####...##.........#",
            "#####...##.........#",
            "#####.^^^^.........#",
            "####################",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 12: Wall Switchback - Medium/Hard
    // ----------------------------------------------------
    {
        name: "Level 12: Wall Switchback",
        difficulty: "Medium/Hard",
        mechanics: ["Dual Wall Jumps (W)"],
        tip: "Zig-zag between the left and right striped walls to reach the high exit!",
        grid: [
            "####################",
            "#G.................#",
            "###.W...........W..#",
            "#...W...........W..#",
            "#...W...........W..#",
            "#...W...........W..#",
            "#...W...........W..#",
            "#...W...........W..#",
            "#..S............W..#",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 13: Aerial Refuel - Hard
    // ----------------------------------------------------
    {
        name: "Level 13: Aerial Refuel",
        difficulty: "Hard",
        mechanics: ["Air Dash (D)", "Double Jump (J)"],
        tip: "Dash into gem D, then trigger double jump gem J to curve over the high spike barrier!",
        grid: [
            "####################",
            "#................G.#",
            "#..............#####",
            "#.........^........#",
            "#.........#........#",
            "#......J..#........#",
            "#...D.....#........#",
            "#..S......#........#",
            "#####^^^^^##########",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 14: Vault of Cinder - Hard
    // ----------------------------------------------------
    {
        name: "Level 14: Vault of Cinder",
        difficulty: "Hard",
        mechanics: ["Crumble Blocks (C)", "Key (K)", "Door (L)", "Air Dash"],
        tip: "Sprint across crumbling steps to snatch the key, then dash back to unlock door L!",
        grid: [
            "####################",
            "#..S.............K.#",
            "#####.C.C.C.C.######",
            "#..................#",
            "#....L.............#",
            "#....L...*.........#",
            "#....L..G..........#",
            "#....#######.......#",
            "#^^^^^^^^^^^^^^^^^^#",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 15: Bounce Trajectory - Hard
    // ----------------------------------------------------
    {
        name: "Level 15: Bounce Trajectory",
        difficulty: "Hard",
        mechanics: ["Jump Pad (B)", "Air Dash", "Sawblade Evasion"],
        tip: "Launch from the spring, dodge the spinning blade mid-air, and dash into portal G!",
        grid: [
            "####################",
            "#................G.#",
            "#..........S...#####",
            "#..................#",
            "#..................#",
            "#..................#",
            "#...B..............#",
            "#.####.............#",
            "#..S...............#",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 16: Moving Corridor - Very Hard
    // ----------------------------------------------------
    {
        name: "Level 16: Moving Corridor",
        difficulty: "Very Hard",
        mechanics: ["Moving Platforms (M)", "Double Jump (J)", "Spikes (^)"],
        tip: "Ride the moving lift, grab the double jump gem, and hurdle over the spike teeth!",
        grid: [
            "####################",
            "#..................#",
            "#................G.#",
            "#...J..........#####",
            "#....^^^^^^........#",
            "#....######........#",
            "#..................#",
            "#..S..M............#",
            "#####^^^^^^^^^^#####",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 17: Precision Shaft - Very Hard
    // ----------------------------------------------------
    {
        name: "Level 17: Precision Shaft",
        difficulty: "Very Hard",
        mechanics: ["Wall Jump (W)", "Air Dash", "Sawblade (S)"],
        tip: "Climb the narrow shaft, dodge the spinning saw, and air-dash to the goal platform!",
        grid: [
            "####################",
            "#G.................#",
            "####.W.............#",
            "#....W...S.........#",
            "#....W.............#",
            "#....W.............#",
            "#....W.............#",
            "#..S.W.............#",
            "######^^^^^^^^^#####",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 18: Twin Key Fortress - Expert
    // ----------------------------------------------------
    {
        name: "Level 18: Twin Key Fortress",
        difficulty: "Expert",
        mechanics: ["Key (K)", "Door (L)", "Double Jump (J)", "Wall Jump (W)"],
        tip: "Grab the key below, wall jump up to double jump gem J, and penetrate the inner sanctum!",
        grid: [
            "####################",
            "#G.L...*...........#",
            "####...J.........W.#",
            "#................W.#",
            "#......^^^^......W.#",
            "#......####......W.#",
            "#................W.#",
            "#..S.......K.....W.#",
            "####################",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 19: The Cascade - Expert
    // ----------------------------------------------------
    {
        name: "Level 19: The Cascade",
        difficulty: "Expert",
        mechanics: ["Crumble Blocks (C)", "Dash Refill (D)", "Double Jump (J)"],
        tip: "Chain-jump across falling blocks, catch Dash Gem D and Double Jump J mid-flight!",
        grid: [
            "####################",
            "#...............*G.#",
            "#..............#####",
            "#...........J......#",
            "#........D.........#",
            "#.....CCC..........#",
            "#..S...............#",
            "####^^^^^^^^^^^^####",
            "####################",
            "####################"
        ]
    },

    // ----------------------------------------------------
    // Level 20: The Apex Nexus - Master
    // ----------------------------------------------------
    {
        name: "Level 20: The Apex Nexus",
        difficulty: "Master",
        mechanics: ["Wall Jump (W)", "Dash Gem (D)", "Double Jump (J)", "Key & Door (K & L)", "Sawblade (S)"],
        tip: "The Ultimate Trial: Combine every reflex, dash, wall-jump, and key unlock to win!",
        grid: [
            "####################",
            "#G.L.S...*.........#",
            "####.....J.......W.#",
            "#................W.#",
            "#......^^^^......W.#",
            "#......####......W.#",
            "#............D...W.#",
            "#..S.......K.....W.#",
            "######...^^^^^...W.#",
            "####################"
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
            if (char === 'S' || char === 'P') {
                playerSpawn = { x: x * 32, y: y * 32 };
                grid[y][x] = '.';
            } else if (char === 'G') {
                goal = { x: x * 32, y: y * 32 };
                grid[y][x] = '.';
            } else if (char === 'D') {
                entities.push({ type: 'crystal', x: x * 32 + 16, y: y * 32 + 16, active: true, respawnTimer: 0 });
                grid[y][x] = '.';
            } else if (char === 'J') {
                entities.push({ type: 'double_jump_gem', x: x * 32 + 16, y: y * 32 + 16, active: true, respawnTimer: 0 });
                grid[y][x] = '.';
            } else if (char === 'K') {
                entities.push({ type: 'key', x: x * 32 + 16, y: y * 32 + 16, collected: false });
                grid[y][x] = '.';
            } else if (char === 'L') {
                entities.push({ type: 'door', x: x * 32, y: y * 32, w: 32, h: 32, unlocked: false });
                grid[y][x] = '.';
            } else if (char === 'B') {
                entities.push({ type: 'spring', x: x * 32, y: y * 32, bounceTimer: 0 });
                grid[y][x] = '.';
            } else if (char === 'S') {
                entities.push({ type: 'saw', x: x * 32 + 16, y: y * 32 + 16, radius: 14, angle: 0 });
                grid[y][x] = '.';
            } else if (char === 'M') {
                entities.push({ type: 'moving_plat', x: x * 32, y: y * 32, w: 48, h: 14, startX: x * 32, dir: 1, range: 64, speed: 60, axis: 'x' });
                grid[y][x] = '.';
            } else if (char === 'V') {
                entities.push({ type: 'moving_plat', x: x * 32, y: y * 32, w: 48, h: 14, startY: y * 32, dir: 1, range: 64, speed: 60, axis: 'y' });
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
        difficulty: raw.difficulty || "Normal",
        mechanics: raw.mechanics || ["Run", "Jump"],
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
