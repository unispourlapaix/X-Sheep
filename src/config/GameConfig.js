// GameConfig.js - Configuration centralisée du jeu
export const GameConfig = {
    // Canvas
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    
    // Joueur
    PLAYER: {
        START_X: 100,
        START_Y: 370,
        WIDTH: 40,
        HEIGHT: 40,
        GROUND_Y: 370,
        JUMP_FORCE: -8,
        JUMP_FORCE_BOOSTED: -10,
        FLY_SPEED: -3,
        GRAVITY: 0.3,
        FRICTION: 0.97
    },
    
    // Gameplay
    GAME_SPEED_INITIAL: 0.5,
    GAME_SPEED_INCREMENT: 0.08,
    SPEED_INCREASE_INTERVAL: 3,
    OBSTACLE_SPAWN_RATE: 140,
    POWERUP_SPAWN_RATE: 200,
    STAR_SPAWN_RATE: 250,
    
    // Richesse
    GOLD: {
        SIZE_GROWTH_RATE: 0.01,
        HAIR_GROWTH_RATE: 2,
        MAX_HAIR_LENGTH: 50,
        SPEED_PENALTY: true
    },
    
    // Scores
    ENDLESS: {
        POINTS_PER_METER: 10,
        POINTS_PER_OBSTACLE: 100,
        POINTS_PER_POWERUP: 300,
        POINTS_PER_STAR: 200,
        COMBO_THRESHOLD: 10,
        WAVE_DISTANCE: 500
    },
    
    // Porte du Paradis
    HEAVEN_GATE: {
        WIDTH: 60,
        HEIGHT: 100,
        POSITION_X_OFFSET: 100
    },
    
    // Couleurs
    COLORS: {
        WHITE: '#FFFFFF',
        GOLD_LIGHT: '#FFD700',
        GOLD_DEEP: '#DAA520',
        GOLD_DARK: '#B8860B',
        SKY_BLUE: '#87CEEB',
        GRASS_GREEN: '#90EE90'
    }
};
