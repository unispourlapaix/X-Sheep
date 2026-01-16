// FunObstacles.js - Obstacles hilarants qui apparaissent toutes les 2 minutes
import { GameConfig } from '../config/GameConfig.js';

export class FunObstacles {
    static definitions = [
        {
            id: 'disco_ball',
            icon: '🪩',
            text: 'SOIRÉE',
            color: '#FF69B4',
            width: 40,
            height: 40,
            effect: 'bounce', // Fait rebondir le mouton
            lifeBonus: 2, // +2 vies
            message: '🪩 Party time! Le mouton danse!'
        },
        {
            id: 'pizza',
            icon: '🍕',
            text: 'PAUSE',
            color: '#FFD700',
            width: 40,
            height: 40,
            effect: 'slow', // Ralentit le mouton (trop mangé)
            lifeBonus: 2, // +2 vies
            message: '🍕 Trop mangé! Digestion lente...'
        },
        {
            id: 'trampoline',
            icon: '🎪',
            text: 'BOING',
            color: '#FF6347',
            width: 50,
            height: 30,
            effect: 'super_bounce', // Super rebond
            lifeBonus: 1, // +1 vie
            message: '🎪 SUPER BOING! 🚀'
        },
        {
            id: 'banana',
            icon: '🍌',
            text: 'GLISSE',
            color: '#FFFF00',
            width: 35,
            height: 35,
            effect: 'slide', // Le mouton glisse
            lifeBonus: 1, // +1 vie
            message: '🍌 Peau de banane! WHOOOOSH!'
        },
        {
            id: 'magnet',
            icon: '🧲',
            text: 'AIMANT',
            color: '#FF0000',
            width: 40,
            height: 40,
            effect: 'attract', // Attire le mouton
            lifeBonus: -3, // -3 vies
            message: '🧲 Attiré comme un aimant!'
        },
        {
            id: 'balloon',
            icon: '🎈',
            text: 'LÉGER',
            color: '#87CEEB',
            width: 35,
            height: 45,
            effect: 'float', // Flotte super léger
            lifeBonus: 3, // +3 vies
            message: '🎈 Léger comme une plume!'
        },
        {
            id: 'tornado',
            icon: '🌪️',
            text: 'TORNADO',
            color: '#708090',
            width: 50,
            height: 60,
            effect: 'spin', // Fait tourner le mouton
            lifeBonus: -1, // -1 vie
            message: '🌪️ Tourbillon de folie!'
        },
        {
            id: 'rocket',
            icon: '🚀',
            text: 'FUSÉE',
            color: '#FF4500',
            width: 40,
            height: 50,
            effect: 'boost', // Boost de vitesse
            lifeBonus: 2, // +2 vies
            message: '🚀 DÉCOLLAGEEEE!'
        }
    ];
    
    static getRandom() {
        const def = this.definitions[Math.floor(Math.random() * this.definitions.length)];
        
        // Position aléatoire sécurisée (sol, milieu ou ciel)
        const minY = 80;
        const maxY = GameConfig.CANVAS_HEIGHT - 100;
        const heightOptions = [
            Math.max(minY, GameConfig.CANVAS_HEIGHT - 80 - def.height), // Sol
            GameConfig.CANVAS_HEIGHT / 2 - def.height / 2, // Milieu
            100 // Ciel
        ];
        
        const y = heightOptions[Math.floor(Math.random() * heightOptions.length)];
        
        return {
            ...def,
            x: GameConfig.CANVAS_WIDTH,
            y: Math.max(minY, Math.min(maxY, y)),
            type: 'fun'
        };
    }
}
