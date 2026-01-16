// NarrativeEngine.js - Moteur de narration
import { NarrativeData } from './narrativeData.js';
import { MessageSystem } from './MessageSystem.js';

export class NarrativeEngine {
    constructor(game) {
        this.game = game;
        this.messageSystem = new MessageSystem(game);
        this.currentMessage = null;
    }
    
    show(obstacleId) {
        const message = NarrativeData[obstacleId];
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
        const dialogue = NarrativeData.finalDialogue;
        this.game.paused = true;
        
        this.messageSystem.showDialogue(dialogue);
    }
}
