/**
 * ProverbCollectibles.js - Proverbes et sagesse à collecter sur l'eau
 */

import { i18n } from '../i18n/I18nManager.js';

export class ProverbCollectibles {
    static getFirstProverbText() {
        return i18n.t('proverbs.firstProverb');
    }
    
    static getProverbText(index) {
        const proverbs = i18n.translations?.proverbs?.proverbs || [];
        return proverbs[index] || "Sagesse...";
    }
    
    static firstProverb = { text: "La liberté est le pouvoir de voler", wisdom: 10, icon: '🕊️' };
    
    static proverbs = [
        { text: "L'eau qui coule ne revient jamais", wisdom: 5, icon: '🌊' },
        { text: "Calme comme l'eau dormante", wisdom: 3, icon: '💧' },
        { text: "Une goutte d'eau dans l'océan", wisdom: 4, icon: '💦' },
        { text: "Après la tempête vient le calme", wisdom: 6, icon: '⛈️' },
        { text: "L'eau prend la forme du vase", wisdom: 7, icon: '🏺' },
        { text: "La patience est amère mais ses fruits sont doux", wisdom: 8, icon: '🍯' },
        { text: "Le silence est d'or", wisdom: 5, icon: '🔇' },
        { text: "Tout vient à point à qui sait attendre", wisdom: 6, icon: '⏳' },
        { text: "La nuit porte conseil", wisdom: 4, icon: '🌙' },
        { text: "Les étoiles brillent pour tous", wisdom: 5, icon: '✨' },
        { text: "L'océan est fait de gouttes", wisdom: 7, icon: '🌊' },
        { text: "Le plus long voyage commence par un pas", wisdom: 8, icon: '👣' },
        { text: "La sagesse commence dans l'émerveillement", wisdom: 9, icon: '🌟' },
        { text: "Connais-toi toi-même", wisdom: 10, icon: '🪞' },
        { text: "La vérité est au fond du puits", wisdom: 8, icon: '🕳️' },
        { text: "Le sage apprend de ses erreurs", wisdom: 7, icon: '📚' },
        { text: "Un sourire est la plus belle courbe", wisdom: 5, icon: '😊' },
        { text: "Le temps guérit toutes les blessures", wisdom: 6, icon: '⏰' },
        { text: "La paix intérieure vaut tous les trésors", wisdom: 9, icon: '☮️' },
        { text: "Chaque fin est un nouveau commencement", wisdom: 7, icon: '🔄' }
    ];
    
    static getFirst() {
        // Premier proverbe: Liberté
        return {
            text: this.getFirstProverbText(),
            wisdom: 10,
            icon: '🕊️',
            x: 1050,
            y: 350, // Position centrale
            width: 40,
            height: 40,
            type: 'proverb',
            speed: 0.5,
            bobPhase: 0,
            collected: false
        };
    }
    
    static getRandom() {
        const index = Math.floor(Math.random() * this.proverbs.length);
        const baseProverb = this.proverbs[index];
        
        // 3 lignes possibles : haute, milieu, basse (mieux équilibrées)
        const lines = [200, 320, 400];
        const lineY = lines[Math.floor(Math.random() * lines.length)];
        
        return {
            text: this.getProverbText(index),
            wisdom: baseProverb.wisdom,
            icon: baseProverb.icon,
            x: 1050, // Spawn à droite du canvas
            y: lineY,
            width: 40,
            height: 40,
            type: 'proverb',
            speed: 0.4 + Math.random() * 0.2, // Vitesse très lente (5x plus lent)
            bobPhase: Math.random() * Math.PI * 2,
            collected: false
        };
    }
}
