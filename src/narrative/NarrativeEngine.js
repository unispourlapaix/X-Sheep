// NarrativeEngine.js - Moteur de narration
import { NarrativeData } from './narrativeData.js';
import { MessageSystem } from './MessageSystem.js';
import { i18n } from '../i18n/I18nManager.js';

export class NarrativeEngine {
    constructor(game) {
        this.game = game;
        this.messageSystem = new MessageSystem(game);
        this.currentMessage = null;
    }
    
    // Obtenir le message traduit
    getTranslatedMessage(obstacleId) {
        // Essayer d'utiliser les traductions i18n d'abord
        if (i18n && i18n.translations && i18n.translations.narrative && i18n.translations.narrative[obstacleId]) {
            return i18n.translations.narrative[obstacleId];
        }
        // Fallback sur NarrativeData français
        return NarrativeData[obstacleId];
    }
    
    show(obstacleId) {
        const message = this.getTranslatedMessage(obstacleId);
        if (!message) return;
        
        this.currentMessage = message;
        this.game.paused = true;
        
        this.messageSystem.show(message, () => {
            this.game.paused = false;
            // Faire sauter le mouton automatiquement pour éviter de rester dans les menus
            this.game.player.jump();
            this.game.gameLoop();
        });
    }
    
    showFinalDialogue() {
        // Utiliser le dialogue traduit
        const dialogue = i18n && i18n.translations && i18n.translations.narrative && i18n.translations.narrative.finalDialogue 
            ? i18n.translations.narrative.finalDialogue 
            : NarrativeData.finalDialogue;
        this.game.paused = true;
        
        this.messageSystem.showDialogue(dialogue);
    }
}
