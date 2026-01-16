// GroundObstacles.js - Définition obstacles au sol
import { GameConfig } from '../config/GameConfig.js';

export class GroundObstacles {
    static definitions = [
        {
            id: 'wheelchair',
            icon: '♿',
            text: 'HANDICAP',
            color: '#4169E1',
            width: 35,
            height: 38
        },
        {
            id: 'car_accident',
            icon: '🚗',
            text: 'ACCIDENT',
            color: '#DC143C',
            width: 38,
            height: 28
        },
        {
            id: 'coffin',
            icon: '⚰️',
            text: 'DEUIL',
            color: '#2F4F4F',
            width: 42,
            height: 32
        },
        {
            id: 'safe',
            icon: '🏦',
            text: 'PAUVRETÉ',
            color: '#8B4513',
            width: 35,
            height: 35
        },
        {
            id: 'house',
            icon: '🏠',
            text: 'FAMILLE',
            color: '#800080',
            width: 38,
            height: 35
        },
        {
            id: 'wolf',
            icon: '🐺',
            text: 'VIOLENCE',
            color: '#8B0000',
            width: 35,
            height: 35
        },
        {
            id: 'black_sheep',
            icon: '🐑',
            text: 'REJET',
            color: '#000000',
            width: 35,
            height: 32
        },
        {
            id: 'addiction',
            icon: '📦',
            text: 'ADDICTION',
            color: '#4B0082',
            width: 32,
            height: 35
        },
        {
            id: 'job_stress',
            icon: '💼',
            text: 'TRAVAIL',
            color: '#696969',
            width: 35,
            height: 32
        },
        {
            id: 'debt',
            icon: '💳',
            text: 'DETTES',
            color: '#8B0000',
            width: 32,
            height: 35
        },
        {
            id: 'loneliness',
            icon: '💔',
            text: 'SOLITUDE',
            color: '#4B0082',
            width: 35,
            height: 35
        },
        {
            id: 'betrayal',
            icon: '🗡️',
            text: 'TRAHISON',
            color: '#8B0000',
            width: 38,
            height: 32
        },
        {
            id: 'chains',
            icon: '⛓️',
            text: 'PRISON',
            color: '#696969',
            width: 40,
            height: 35
        }
    ];
    
    static getRandom() {
        const def = this.definitions[Math.floor(Math.random() * this.definitions.length)];
        return {
            ...def,
            x: GameConfig.CANVAS_WIDTH,
            y: GameConfig.CANVAS_HEIGHT - 80 - def.height,
            type: 'ground'
        };
    }
}
