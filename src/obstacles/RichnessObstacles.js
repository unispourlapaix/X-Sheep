// RichnessObstacles.js - Obstacles des péchés de richesse
import { GameConfig } from '../config/GameConfig.js';
import { i18n } from '../i18n/I18nManager.js';

export class RichnessObstacles {
    static getTranslatedText(id) {
        const translated = i18n.translations?.obstacles?.richness?.[id];
        return translated || '';
    }
    static definitions = [
        {
            id: 'avarice',
            icon: '💰',
            text: 'AVARICE',
            color: '#FFD700',
            width: 45,
            height: 50
        },
        {
            id: 'luxure',
            icon: '💋',
            text: 'LUXURE',
            color: '#FF1493',
            width: 40,
            height: 45
        },
        {
            id: 'nepotisme',
            icon: '🤝',
            text: 'NÉPOTISME',
            color: '#8B4513',
            width: 50,
            height: 50
        },
        {
            id: 'selection',
            icon: '👥',
            text: 'SÉLECTION',
            color: '#4B0082',
            width: 55,
            height: 45
        },
        {
            id: 'esclavage',
            icon: '⛓️',
            text: 'ESCLAVAGE',
            color: '#2F4F4F',
            width: 45,
            height: 55
        },
        {
            id: 'surexploitation',
            icon: '🏭',
            text: 'EXPLOITATION',
            color: '#696969',
            width: 60,
            height: 50
        }
    ];
    
    static getRandom() {
        const def = this.definitions[Math.floor(Math.random() * this.definitions.length)];
        return {
            ...def,
            text: this.getTranslatedText(def.id) || def.text,
            x: GameConfig.CANVAS_WIDTH,
            y: GameConfig.CANVAS_HEIGHT - 80 - def.height,
            type: 'richness'
        };
    }
}
