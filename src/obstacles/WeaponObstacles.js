// WeaponObstacles.js - Armes ramassables au sol pour combattre les dangers
import { GameConfig } from '../config/GameConfig.js';
import { i18n } from '../i18n/I18nManager.js';

export class WeaponObstacles {
    static definitions = [
        {
            id: 'sword',
            icon: '⚔️',
            text: 'ÉPÉE',
            color: '#C0C0C0',
            width: 35,
            height: 35,
            kills: ['dragon', 'shark', 'eagle'] // Ce que cette arme peut tuer
        },
        {
            id: 'laser_gun',
            icon: '🔫',
            text: 'LASER',
            color: '#00FF00',
            width: 35,
            height: 30,
            kills: ['ufo', 'pacman', 'thunder'] // Ce que cette arme peut tuer
        },
        {
            id: 'net',
            icon: '🥅',
            text: 'FILET',
            color: '#4169E1',
            width: 40,
            height: 40,
            kills: ['whale', 'phantom'] // Ce que cette arme peut tuer
        },
        {
            id: 'shield',
            icon: '🛡️',
            text: 'BOUCLIER',
            color: '#FFD700',
            width: 38,
            height: 38,
            kills: ['cruise_ship'] // Protège du paquebot
        },
        {
            id: 'hammer',
            icon: '🔨',
            text: 'MARTEAU',
            color: '#8B4513',
            width: 35,
            height: 35,
            kills: ['robot', 'monster'] // Détruit robot et monstre
        },
        {
            id: 'raygun',
            icon: '🔦',
            text: 'RAYON',
            color: '#FFD700',
            width: 35,
            height: 30,
            kills: ['alien', 'robot'] // Neutralise alien et robot
        }
    ];
    
    static getTranslatedText(id) {
        return i18n.translations?.obstacles?.weapons?.[id];
    }
    
    static getRandom() {
        const def = this.definitions[Math.floor(Math.random() * this.definitions.length)];
        return {
            ...def,
            x: GameConfig.CANVAS_WIDTH,
            y: GameConfig.CANVAS_HEIGHT - 80 - def.height,
            type: 'weapon',
            isWeapon: true,
            text: this.getTranslatedText(def.id) || def.text
        };
    }
}
