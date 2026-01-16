// PowerUpManager.js - Gestion des power-ups spirituels
import { GameConfig } from '../config/GameConfig.js';
import { SpiritualPowers } from './SpiritualPowers.js';
import { FunPowers } from './FunPowers.js';
import { Physics } from '../core/Physics.js';

export class PowerUpManager {
    constructor(game) {
        this.game = game;
        this.powerUps = [];
        this.activePowers = {};
        this.timer = 0;
        this.funTimer = 0; // Timer pour bonus fun
        this.firstPowerSpawned = false;
        
        // Initialiser tous les pouvoirs à 0
        SpiritualPowers.definitions.forEach(power => {
            this.activePowers[power.id] = 0;
        });
        // Initialiser les pouvoirs fun aussi
        FunPowers.definitions.forEach(power => {
            this.activePowers[power.id] = 0;
        });
    }
    
    update() {
        // Spawner le power-up liberté au début du jeu
        if (!this.firstPowerSpawned) {
            this.spawnLibertePowerUp();
            this.firstPowerSpawned = true;
        }
        
        this.timer++;
        this.funTimer++;
        
        // Spawner des power-ups aléatoirement après
        if (this.timer > GameConfig.POWERUP_SPAWN_RATE) {
            this.spawnPowerUp();
            this.timer = 0;
        }
        
        // BONUS FUN toutes les 2 minutes!
        if (this.funTimer >= 120 * 60) {
            this.spawnFunPowerUp();
            this.funTimer = 0;
        }
        
        // Mettre à jour power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const pu = this.powerUps[i];
            pu.x -= this.game.gameSpeed;
            
            // Collision avec joueur
            if (this.checkCollision(pu)) {
                this.activatePower(pu, pu.x, pu.y);
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Supprimer si hors écran
            if (pu.x < -50) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Décompter durées (sauf liberté qui est permanent)
        Object.keys(this.activePowers).forEach(powerId => {
            if (this.activePowers[powerId] > 0 && powerId !== 'liberte') {
                this.activePowers[powerId]--;
            }
        });
    }
    
    spawnPowerUp() {
        const power = SpiritualPowers.getRandom();
        // Centrer verticalement : canvas.height/2 +/- 150px, avec limites sûres
        const centerY = GameConfig.CANVAS_HEIGHT / 2;
        const minY = 100;
        const maxY = GameConfig.CANVAS_HEIGHT - 100;
        const y = centerY - 150 + Math.random() * 300;
        this.powerUps.push({
            ...power,
            x: GameConfig.CANVAS_WIDTH,
            y: Math.max(minY, Math.min(maxY, y))
        });
    }
    
    spawnLibertePowerUp() {
        // Trouver le power-up liberté
        const libertePower = SpiritualPowers.definitions.find(p => p.id === 'liberte');
        if (libertePower) {
            this.powerUps.push({
                ...libertePower,
                x: 400, // Au milieu de l'écran
                y: 400  // Près du sol pour que le mouton puisse l'attraper sans voler
            });
            console.log('✨ Power-up LIBERTÉ placé au début du jeu!');
        }
    }
    
    spawnFunPowerUp() {
        const funPower = FunPowers.getRandom();
        // Centrer verticalement : canvas.height/2 +/- 200px, avec limites sûres
        const centerY = GameConfig.CANVAS_HEIGHT / 2;
        const minY = 80;
        const maxY = GameConfig.CANVAS_HEIGHT - 80;
        const y = centerY - 200 + Math.random() * 400;
        this.powerUps.push({
            ...funPower,
            x: GameConfig.CANVAS_WIDTH + 50,
            y: Math.max(minY, Math.min(maxY, y))
        });
        console.log(`🎉 BONUS FUN: ${funPower.message}`);
        
        // Effet visuel de spawn
        this.game.renderer.addParticle(
            GameConfig.CANVAS_WIDTH,
            GameConfig.CANVAS_HEIGHT / 2,
            funPower.icon + '✨✨✨',
            funPower.color
        );
    }
    
    activatePower(powerUp, x, y) {
        this.activePowers[powerUp.id] = powerUp.duration;
        this.game.score += 300;
        
        // Son de collecte "gline"
        if (this.game.audioManager && this.game.audioManager.initialized) {
            this.game.audioManager.playGlineSound();
        }
        
        // Message motivant
        console.log(`💪 ${powerUp.name} activé !`);
        
        // Donner XP bonus si le power-up en a
        if (powerUp.xpReward && this.game?.obstacleManager) {
            this.game.obstacleManager.addXP(powerUp.xpReward);
        }
        
        // Afficher bulle BD via le système unifié
        if (this.game.notificationSystem) {
            this.game.notificationSystem.showSplash({
                x: x,
                y: y,
                icon: powerUp.icon,
                text: powerUp.name,
                color: powerUp.color,
                duration: 2000,
                onClose: () => {
                    // Compter cette bulle pour le spawn d'armes
                    if (this.game?.obstacleManager) {
                        this.game.obstacleManager.onMessagePopped();
                    }
                }
            });
        }
    }
    
    checkCollision(pu) {
        const playerHitbox = this.game.player.getHitbox();
        return Physics.checkCollision(playerHitbox, {
            x: pu.x - 18,
            y: pu.y - 18,
            width: 36,
            height: 36
        });
    }
    
    hasPower(powerId) {
        return this.activePowers[powerId] > 0;
    }
    
    usePower(powerId, amount) {
        if (this.activePowers[powerId] > 0) {
            this.activePowers[powerId] -= amount;
            if (this.activePowers[powerId] < 0) {
                this.activePowers[powerId] = 0;
            }
        }
    }
    
    getAll() {
        return this.powerUps;
    }
    
    getActivePowers() {
        return this.activePowers;
    }
}
