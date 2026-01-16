// CorruptionManager.js - Gestion de la corruption par richesse
import { GameConfig } from '../config/GameConfig.js';

export class CorruptionManager {
    constructor(game) {
        this.game = game;
    }
    
    update() {
        const player = this.game.player;
        
        // Appliquer les malus de richesse
        if (player.goldCollected > 0) {
            // Vitesse réduite proportionnellement à la taille
            const speedPenalty = 1 / player.size;
            
            // Appliquer aux vélocités
            if (Math.abs(player.velX) > 0.1) {
                player.velX *= speedPenalty;
            }
        }
        
        // Vérifier si trop riche pour la porte du Paradis
        if (this.game.heavenGate && this.isTooRichForHeaven()) {
            console.log('⚠️ Trop riche pour le Paradis !');
        }
    }
    
    isTooRichForHeaven() {
        const player = this.game.player;
        const totalSize = player.size * player.width;
        return totalSize > GameConfig.HEAVEN_GATE.WIDTH;
    }
    
    getCorruptionLevel() {
        // Retourne un niveau de 0 (pur) à 1 (totalement corrompu)
        const player = this.game.player;
        return Math.min(player.goldCollected / 100, 1);
    }
    
    getCorruptionMessage() {
        const level = this.getCorruptionLevel();
        
        if (level < 0.2) {
            return "Ton cœur est encore léger 💖";
        } else if (level < 0.5) {
            return "L'or commence à t'alourdir... ⚠️";
        } else if (level < 0.8) {
            return "La cupidité te pèse ! 😰";
        } else {
            return "Tu es prisonnier de ta richesse ! 💰⛓️";
        }
    }
}
