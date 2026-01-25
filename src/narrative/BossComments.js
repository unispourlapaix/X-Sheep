// ============================================
// COMMENTAIRES IRONIQUES DU MOUTON POUR CHAQUE BOSS
// Avec onomatopées et réactions
// ============================================

import { i18n } from '../i18n/I18nManager.js';

// Sélectionner un commentaire aléatoire
export function getRandomComment(bossId, type = 'appearance') {
    const translations = i18n.translations;
    
    if (!translations || !translations.endless || !translations.endless.bossComments) {
        return "...";
    }
    
    const boss = translations.endless.bossComments[bossId];
    if (!boss || !boss[type] || !Array.isArray(boss[type])) {
        return "...";
    }
    
    const comments = boss[type];
    return comments[Math.floor(Math.random() * comments.length)];
}

// Obtenir une onomatopée
export function getOnomatopoeia(bossId) {
    const translations = i18n.translations;
    
    if (!translations || !translations.endless || !translations.endless.bossComments) {
        return "BOOM!";
    }
    
    const boss = translations.endless.bossComments[bossId];
    if (!boss || !boss.onomatopoeia || !Array.isArray(boss.onomatopoeia)) {
        return "BOOM!";
    }
    
    const sounds = boss.onomatopoeia;
    return sounds[Math.floor(Math.random() * sounds.length)];
}
