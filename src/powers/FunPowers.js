// FunPowers.js - Bonus hilarants qui apparaissent toutes les 2 minutes
import { i18n } from '../i18n/I18nManager.js';

export class FunPowers {
    static definitions = [
        {
            id: 'disco',
            icon: '🕺',
            name: 'MODE DISCO',
            color: '#FF1493',
            duration: 180,
            message: '🕺 MODE DISCO! Let\'s dance!',
            tip: 'Mouvement disco automatique!'
        },
        {
            id: 'giant',
            icon: '🦣',
            name: 'GÉANT',
            color: '#8B4513',
            duration: 180,
            message: '🦣 MOUTON GÉANT! GROOOOOS!',
            tip: 'Taille x3!'
        },
        {
            id: 'tiny',
            icon: '🐭',
            name: 'MINUSCULE',
            color: '#FFB6C1',
            duration: 180,
            message: '🐭 Tout petit! Esquive facile!',
            tip: 'Mode furtif!'
        },
        {
            id: 'rainbow',
            icon: '🌈',
            name: 'ARC-EN-CIEL',
            color: '#FF69B4',
            duration: 180,
            message: '🌈 RAINBOW SHEEP! Fabuleux!',
            tip: 'Traînée colorée!'
        },
        {
            id: 'magnet_bonus',
            icon: '🧲',
            name: 'AIMANT À BONUS',
            color: '#FFD700',
            duration: 180,
            message: '🧲 Tous les bonus t\'attirent!',
            tip: 'Collecte automatique!'
        },
        {
            id: 'spring',
            icon: '🦘',
            name: 'KANGOUROU',
            color: '#CD853F',
            duration: 180,
            message: '🦘 Mode kangourou! Boing boing!',
            tip: 'Rebonds infinis!'
        },
        {
            id: 'jetpack',
            icon: '🎒',
            name: 'JETPACK',
            color: '#00CED1',
            duration: 180,
            message: '🎒 JETPACK activé! Vrooooom!',
            tip: 'Vol turbo!'
        },
        {
            id: 'ninja',
            icon: '🥷',
            name: 'NINJA',
            color: '#2F4F4F',
            duration: 180,
            message: '🥷 Mode ninja! Invisible!',
            tip: 'Intangible!'
        },
        {
            id: 'party',
            icon: '🎉',
            name: 'FÊTE',
            color: '#FF6347',
            duration: 180,
            message: '🎉 C\'EST LA FÊTEEE!',
            tip: 'Confettis partout!'
        },
        {
            id: 'coffee',
            icon: '☕',
            name: 'CAFÉINE',
            color: '#6F4E37',
            duration: 180,
            message: '☕ CAFÉINE! Speed x5!',
            tip: 'Hyper vitesse!'
        }
    ];
    
    static getTranslated(id) {
        const powerUpData = i18n.translations?.powerUps?.fun?.[id];
        if (!powerUpData) return null;
        
        return {
            name: powerUpData.name || '',
            message: powerUpData.message || '',
            tip: powerUpData.tip || ''
        };
    }
    
    static getRandom() {
        return this.definitions[Math.floor(Math.random() * this.definitions.length)];
    }
}
