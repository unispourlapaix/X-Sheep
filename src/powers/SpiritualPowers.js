// SpiritualPowers.js - Définitions des 13 pouvoirs spirituels
export class SpiritualPowers {
    static definitions = [
        {
            id: 'courage',
            icon: '💪',
            name: 'COURAGE',
            color: '#FFD700',
            duration: 300,
            message: '💪 COURAGE ! Tu peux tout affronter !',
            tip: 'Sauts surpuissants !',
            xpReward: 100
        },
        {
            id: 'force',
            icon: '⚡',
            name: 'FORCE',
            color: '#FF6347',
            duration: 300,
            message: '⚡ FORCE DIVINE ! Guerrier de lumière !',
            tip: 'Défonce tout !',
            xpReward: 120
        },
        {
            id: 'patience',
            icon: '🕰️',
            name: 'PATIENCE',
            color: '#87CEEB',
            duration: 300,
            message: '🕰️ PATIENCE ! Vole avec sérénité !',
            tip: 'Vol contrôlé !',
            xpReward: 300
        },
        {
            id: 'resilience',
            icon: '🛡️',
            name: 'RÉSILIENCE',
            color: '#32CD32',
            duration: 300,
            message: '🛡️ RÉSILIENCE ! Tu es blindé !',
            tip: 'Bouclier activé !',
            xpReward: 250
        },
        {
            id: 'assurance',
            icon: '👑',
            name: 'ASSURANCE',
            color: '#DDA0DD',
            duration: 300,
            message: '👑 ASSURANCE ! Tu rayonnes !',
            tip: 'Aura de puissance !',
            xpReward: 200
        },
        {
            id: 'liberte',
            icon: '🕊️',
            name: 'LIBERTÉ',
            color: '#87CEFA',
            duration: Infinity, // Permanent une fois récupéré
            message: '🕊️ LIBERTÉ ! Vole libre pour toujours !',
            tip: 'Vol automatique permanent !',
            xpReward: 500
        },
        {
            id: 'controle',
            icon: '🎯',
            name: 'CONTRÔLE',
            color: '#FF69B4',
            duration: 300,
            message: '🎯 CONTRÔLE ! Maître de ton destin !',
            tip: 'Précision maximale !',
            xpReward: 150
        },
        {
            id: 'sagesse',
            icon: '🦉',
            name: 'SAGESSE',
            color: '#B8860B',
            duration: 300,
            message: '🦉 SAGESSE ! Vision claire !',
            tip: 'Clairvoyance !',
            xpReward: 1000
        },
        {
            id: 'gestion',
            icon: '⚖️',
            name: 'GESTION',
            color: '#4B0082',
            duration: 300,
            message: '⚖️ GESTION ! Équilibre divin !',
            tip: 'Balance parfaite !',
            xpReward: 180
        },
        {
            id: 'agir',
            icon: '🚀',
            name: 'AGIR',
            color: '#FF4500',
            duration: 300,
            message: '🚀 ACTION ! Fonce maintenant !',
            tip: 'Vitesse turbo !',
            xpReward: 220
        },
        {
            id: 'se_battre',
            icon: '⚔️',
            name: 'SE BATTRE',
            color: '#8B0000',
            duration: 300,
            message: '⚔️ MODE GUERRIER ! Au combat !',
            tip: 'Force maximale !',
            xpReward: 400
        },
        {
            id: 'ne_pas_abandonner',
            icon: '🔒',
            name: 'NE PAS ABANDONNER',
            color: '#2E8B57',
            duration: 300,
            message: '🔒 JAMAIS ABANDONNER ! Increvable !',
            tip: 'Ténacité légendaire !',
            xpReward: 350
        },
        {
            id: 'perseverer',
            icon: '🏔️',
            name: 'PERSÉVÉRER',
            color: '#1E90FF',
            duration: 300,
            message: '🏔️ PERSÉVÉRANCE ! Champion !',
            tip: 'Endurance infinie !',
            xpReward: 450
        }
    ];
    
    static getRandom() {
        return this.definitions[Math.floor(Math.random() * this.definitions.length)];
    }
    
    static getById(id) {
        return this.definitions.find(p => p.id === id);
    }
}
