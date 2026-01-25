// SevenSins.js - Les 7 Péchés Capitaux (niveau 2)
import { GameConfig } from '../config/GameConfig.js';
import { i18n } from '../i18n/I18nManager.js';

export class SevenSins {
    static getTranslatedText(id) {
        return i18n.translations?.obstacles?.sins?.[id] || '';
    }
    static definitions = [
        {
            id: 'pride',
            icon: '👑',
            text: 'ORGUEIL',
            color: '#9370DB',
            width: 60,
            height: 60,
            damage: 3
        },
        {
            id: 'greed',
            icon: '💰',
            text: 'AVARICE',
            color: '#FFD700',
            width: 55,
            height: 55,
            damage: 3
        },
        {
            id: 'lust',
            icon: '💋',
            text: 'LUXURE',
            color: '#FF1493',
            width: 50,
            height: 50,
            damage: 3
        },
        {
            id: 'envy',
            icon: '👁️',
            text: 'ENVIE',
            color: '#32CD32',
            width: 55,
            height: 55,
            damage: 3
        },
        {
            id: 'gluttony',
            icon: '🍖',
            text: 'GOURMANDISE',
            color: '#FF6347',
            width: 55,
            height: 55,
            damage: 3
        },
        {
            id: 'wrath',
            icon: '💢',
            text: 'COLÈRE',
            color: '#DC143C',
            width: 60,
            height: 60,
            damage: 3
        },
        {
            id: 'sloth',
            icon: '😴',
            text: 'PARESSE',
            color: '#708090',
            width: 55,
            height: 55,
            damage: 3
        }
    ];
    
    static getRandom() {
        const def = this.definitions[Math.floor(Math.random() * this.definitions.length)];
        
        // Position Y aléatoire dans tout l'écran
        const minY = 80;
        const maxY = GameConfig.CANVAS_HEIGHT - 100;
        const y = minY + Math.random() * (maxY - minY);
        
        return {
            ...def,
            text: this.getTranslatedText(def.id) || def.text,
            x: GameConfig.CANVAS_WIDTH,
            y: Math.max(minY, Math.min(maxY, y)),
            type: 'sin',
            dangerous: true
        };
    }
}
