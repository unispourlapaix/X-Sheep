// SkyObstacles.js - Obstacles fixes du haut
import { GameConfig } from '../config/GameConfig.js';
import { i18n } from '../i18n/I18nManager.js';

export class SkyObstacles {
    static getTranslatedText(id) {
        return i18n.translations?.obstacles?.sky?.[id] || '';
    }
    static definitions = [
        {
            id: 'death',
            icon: '💀',
            text: 'MORT',
            color: '#000000',
            width: 40,
            height: 45
        },
        {
            id: 'cancer',
            icon: '🎗️',
            text: 'CANCER',
            color: '#FF1493',
            width: 35,
            height: 50
        },
        {
            id: 'nuclear',
            icon: '☢️',
            text: 'NUCLÉAIRE',
            color: '#32CD32',
            width: 45,
            height: 45
        },
        {
            id: 'meteor',
            icon: '☄️',
            text: 'MÉTÉORITE',
            color: '#FF6347',
            width: 50,
            height: 30
        },
        {
            id: 'procrastination',
            icon: '⏰',
            text: 'PARESSE',
            color: '#708090',
            width: 40,
            height: 40
        },
        {
            id: 'anger',
            icon: '😡',
            text: 'COLÈRE',
            color: '#FF4500',
            width: 40,
            height: 40
        },
        {
            id: 'madness',
            icon: '🌀',
            text: 'FOLIE',
            color: '#9932CC',
            width: 45,
            height: 45
        }
    ];
    
    static getRandom() {
        const def = this.definitions[Math.floor(Math.random() * this.definitions.length)];
        
        // Position Y sécurisée dans la zone ciel (80-200px)
        const minY = 80;
        const maxY = 200;
        const y = minY + Math.random() * (maxY - minY);
        
        return {
            ...def,
            text: this.getTranslatedText(def.id) || def.text,
            x: GameConfig.CANVAS_WIDTH, // Spawn à droite
            y: Math.max(minY, Math.min(maxY, y)),
            type: 'sky'
            // PAS de fixed: true - ils circulent!
        };
    }
}
