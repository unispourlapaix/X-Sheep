// MiddleObstacles.js - Obstacles du milieu (flottants)
import { GameConfig } from '../config/GameConfig.js';
import { i18n } from '../i18n/I18nManager.js';

export class MiddleObstacles {
    static getTranslatedText(id) {
        return i18n.translations?.obstacles?.middle?.[id] || '';
    }
    static definitions = [
        {
            id: 'depression',
            icon: '☁️',
            text: 'DÉPRESSION',
            color: '#2F4F4F',
            width: 60,
            height: 30
        },
        {
            id: 'anxiety',
            icon: '💨',
            text: 'ANXIÉTÉ',
            color: '#4682B4',
            width: 50,
            height: 35
        },
        {
            id: 'doubt',
            icon: '❓',
            text: 'DOUTE',
            color: '#6A5ACD',
            width: 35,
            height: 40
        },
        {
            id: 'phantom',
            icon: '👻',
            text: 'PHANTOM',
            color: '#800080',
            width: 40,
            height: 45,
            effect: 'freeze' // Glace le mouton
        },
        {
            id: 'shark',
            icon: '🦈',
            text: 'REQUIN',
            color: '#4682B4',
            width: 55,
            height: 40,
            dangerous: true,
            damage: 2
        },
        {
            id: 'eagle',
            icon: '🦅',
            text: 'AIGLE',
            color: '#8B4513',
            width: 70,
            height: 65,
            dangerous: true,
            damage: 1
        },
        {
            id: 'thunder',
            icon: '⚡',
            text: 'ÉCLAIR',
            color: '#FFD700',
            width: 40,
            height: 60,
            dangerous: true,
            damage: 2
        },
        {
            id: 'cruise_ship',
            icon: '🚢',
            text: 'PAQUEBOT',
            color: '#0055A4',
            width: 90,
            height: 60,
            dangerous: true,
            damage: 2,
            flag: '🇫🇷' // Cheminée tricolore
        }
    ];
    
    static getRandom() {
        // Filtrer les boss (shark, cruise_ship sont gérés par spawnBossInLine)
        const nonBossObstacles = this.definitions.filter(def => 
            !['shark', 'cruise_ship'].includes(def.id)
        );
        
        // Position Y sécurisée dans la zone milieu (150-280px)
        const minY = 150;
        const maxY = 280;
        const y = minY + Math.random() * (maxY - minY);
        
        const def = nonBossObstacles[Math.floor(Math.random() * nonBossObstacles.length)];
        return {
            ...def,
            x: GameConfig.CANVAS_WIDTH,
            y: Math.max(minY, Math.min(maxY, y)),
            type: 'middle',
            floatSpeed: 0.5 + Math.random()
        };
    }
}
