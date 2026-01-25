// SpiritualPowers.js - Définitions des 13 pouvoirs spirituels
import { i18n } from '../i18n/I18nManager.js';

export class SpiritualPowers {
    static getTranslated(id) {
        return i18n.translations?.powerUps?.spiritual?.[id] || {};
    }
    
    static definitions = [
        {
            id: 'courage',
            icon: '💪',
            name: 'COURAGE',
            color: '#FFD700',
            duration: 300,
            message: '💪 COURAGE ! Tu peux tout affronter !',
            tip: 'Sauts surpuissants !',
            xpReward: 100,
            get translatedName() { return SpiritualPowers.getTranslated('courage').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('courage').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('courage').tip || this.tip; }
        },
        {
            id: 'force',
            icon: '⚡',
            name: 'FORCE',
            color: '#FF6347',
            duration: 300,
            message: '⚡ FORCE DIVINE ! Guerrier de lumière !',
            tip: 'Défonce tout !',
            xpReward: 120,
            get translatedName() { return SpiritualPowers.getTranslated('force').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('force').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('force').tip || this.tip; }
        },
        {
            id: 'patience',
            icon: '🕰️',
            name: 'PATIENCE',
            color: '#87CEEB',
            duration: 300,
            message: '🕰️ PATIENCE ! Vole avec sérénité !',
            tip: 'Vol contrôlé !',
            xpReward: 300,
            get translatedName() { return SpiritualPowers.getTranslated('patience').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('patience').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('patience').tip || this.tip; }
        },
        {
            id: 'resilience',
            icon: '🛡️',
            name: 'RÉSILIENCE',
            color: '#32CD32',
            duration: 300,
            message: '🛡️ RÉSILIENCE ! Tu es blindé !',
            tip: 'Bouclier activé !',
            xpReward: 250,
            get translatedName() { return SpiritualPowers.getTranslated('resilience').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('resilience').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('resilience').tip || this.tip; }
        },
        {
            id: 'assurance',
            icon: '👑',
            name: 'ASSURANCE',
            color: '#DDA0DD',
            duration: 300,
            message: '👑 ASSURANCE ! Tu rayonnes !',
            tip: 'Aura de puissance !',
            xpReward: 200,
            get translatedName() { return SpiritualPowers.getTranslated('assurance').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('assurance').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('assurance').tip || this.tip; }
        },
        {
            id: 'liberte',
            icon: '🕊️',
            name: 'LIBERTÉ',
            color: '#87CEFA',
            duration: Infinity, // Permanent une fois récupéré
            message: '🕊️ LIBERTÉ ! Vole libre pour toujours !',
            tip: 'Vol automatique permanent !',
            xpReward: 500,
            get translatedName() { return SpiritualPowers.getTranslated('liberte').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('liberte').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('liberte').tip || this.tip; }
        },
        {
            id: 'controle',
            icon: '🎯',
            name: 'CONTRÔLE',
            color: '#FF69B4',
            duration: 300,
            message: '🎯 CONTRÔLE ! Maître de ton destin !',
            tip: 'Précision maximale !',
            xpReward: 150,
            get translatedName() { return SpiritualPowers.getTranslated('controle').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('controle').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('controle').tip || this.tip; }
        },
        {
            id: 'sagesse',
            icon: '🦉',
            name: 'SAGESSE',
            color: '#B8860B',
            duration: 300,
            message: '🦉 SAGESSE ! Vision claire !',
            tip: 'Clairvoyance !',
            xpReward: 1000,
            get translatedName() { return SpiritualPowers.getTranslated('sagesse').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('sagesse').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('sagesse').tip || this.tip; }
        },
        {
            id: 'gestion',
            icon: '⚖️',
            name: 'GESTION',
            color: '#4B0082',
            duration: 300,
            message: '⚖️ GESTION ! Équilibre divin !',
            tip: 'Balance parfaite !',
            xpReward: 180,
            get translatedName() { return SpiritualPowers.getTranslated('gestion').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('gestion').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('gestion').tip || this.tip; }
        },
        {
            id: 'agir',
            icon: '🚀',
            name: 'AGIR',
            color: '#FF4500',
            duration: 300,
            message: '🚀 ACTION ! Fonce maintenant !',
            tip: 'Vitesse turbo !',
            xpReward: 220,
            get translatedName() { return SpiritualPowers.getTranslated('agir').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('agir').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('agir').tip || this.tip; }
        },
        {
            id: 'se_battre',
            icon: '⚔️',
            name: 'SE BATTRE',
            color: '#8B0000',
            duration: 300,
            message: '⚔️ MODE GUERRIER ! Au combat !',
            tip: 'Force maximale !',
            xpReward: 400,
            get translatedName() { return SpiritualPowers.getTranslated('combattre').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('combattre').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('combattre').tip || this.tip; }
        },
        {
            id: 'ne_pas_abandonner',
            icon: '🔒',
            name: 'NE PAS ABANDONNER',
            color: '#2E8B57',
            duration: 300,
            message: '🔒 JAMAIS ABANDONNER ! Increvable !',
            tip: 'Ténacité légendaire !',
            xpReward: 350,
            get translatedName() { return SpiritualPowers.getTranslated('nepasabandonner').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('nepasabandonner').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('nepasabandonner').tip || this.tip; }
        },
        {
            id: 'perseverer',
            icon: '🏔️',
            name: 'PERSÉVÉRER',
            color: '#1E90FF',
            duration: 300,
            message: '🏔️ PERSÉVÉRANCE ! Champion !',
            tip: 'Endurance infinie !',
            xpReward: 450,
            get translatedName() { return SpiritualPowers.getTranslated('perseverer').name || this.name; },
            get translatedMessage() { return SpiritualPowers.getTranslated('perseverer').message || this.message; },
            get translatedTip() { return SpiritualPowers.getTranslated('perseverer').tip || this.tip; }
        }
    ];
    
    static getRandom() {
        return this.definitions[Math.floor(Math.random() * this.definitions.length)];
    }
    
    static getById(id) {
        return this.definitions.find(p => p.id === id);
    }
}
