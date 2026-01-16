// GoldSystem.js - Système de sacs d'or
import { GameConfig } from '../config/GameConfig.js';
import { Physics } from '../core/Physics.js';

export class GoldSystem {
    constructor(game) {
        this.game = game;
        this.goldBags = [];
        this.timer = 0;
        this.spawnRate = 150;
    }
    
    update() {
        this.timer++;
        
        // Spawner des sacs d'or
        if (this.timer > this.spawnRate) {
            this.spawnGoldBag();
            this.timer = 0;
        }
        
        // Mettre à jour les sacs
        for (let i = this.goldBags.length - 1; i >= 0; i--) {
            const bag = this.goldBags[i];
            bag.x -= this.game.gameSpeed;
            
            // Collision avec joueur
            if (this.checkCollision(bag)) {
                // Son de collecte "poc"
                if (this.game.audioManager && this.game.audioManager.initialized) {
                    this.game.audioManager.playPocSound();
                }
                
                this.game.player.collectGold(bag.amount);
                this.goldBags.splice(i, 1);
                this.game.score += 100;
                this.game.renderer.addParticle(
                    this.game.player.x,
                    this.game.player.y,
                    '� +RICHE mais +LOURD',
                    '#FFD700'
                );
                continue;
            }
            
            // Supprimer si hors écran
            if (bag.x < -30) {
                this.goldBags.splice(i, 1);
            }
        }
    }
    
    spawnGoldBag() {
        this.goldBags.push({
            x: GameConfig.CANVAS_WIDTH,
            y: 100 + Math.random() * 250,
            amount: 5,
            size: 25
        });
    }
    
    checkCollision(bag) {
        const playerHitbox = this.game.player.getHitbox();
        return Physics.checkCollision(playerHitbox, {
            x: bag.x - bag.size/2,
            y: bag.y - bag.size/2,
            width: bag.size,
            height: bag.size
        });
    }
    
    render(ctx) {
        this.goldBags.forEach(bag => {
            ctx.save();
            
            // Chaîne en or avec contours blancs (style pixel art)
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            
            // Dessiner la chaîne (plusieurs segments)
            const chainLength = 30;
            const segments = 5;
            for (let i = 0; i < segments; i++) {
                const startY = bag.y - chainLength + (i * chainLength / segments);
                const endY = bag.y - chainLength + ((i + 1) * chainLength / segments);
                const sway = Math.sin(Date.now() * 0.003 + i * 0.5) * 2;
                
                // Segment de chaîne
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(bag.x + sway, startY);
                ctx.lineTo(bag.x + sway * 1.2, endY);
                ctx.stroke();
                
                // Contour blanc du segment
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(bag.x + sway - 2, startY);
                ctx.lineTo(bag.x + sway * 1.2 - 2, endY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(bag.x + sway + 2, startY);
                ctx.lineTo(bag.x + sway * 1.2 + 2, endY);
                ctx.stroke();
                
                // Maillons de la chaîne avec contours blancs
                ctx.fillStyle = '#DAA520';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(bag.x + sway, startY + 3, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            
            // Ombre du boulet
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(bag.x + 3, bag.y + bag.size + 3, bag.size * 0.8, bag.size * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Boulet (sphère métallique)
            const gradient = ctx.createRadialGradient(
                bag.x - bag.size * 0.3, bag.y - bag.size * 0.3, bag.size * 0.2,
                bag.x, bag.y, bag.size
            );
            gradient.addColorStop(0, '#555');
            gradient.addColorStop(0.3, '#333');
            gradient.addColorStop(0.7, '#1a1a1a');
            gradient.addColorStop(1, '#000');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(bag.x, bag.y, bag.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Contour BLANC du boulet (style vitrail)
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Reflet métallique
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.arc(bag.x - bag.size * 0.4, bag.y - bag.size * 0.4, bag.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Rayures sur le boulet avec contours
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 3;
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.arc(bag.x, bag.y, bag.size * 0.7, (Math.PI / 6) * i, (Math.PI / 3) + (Math.PI / 6) * i);
                ctx.stroke();
            }
            
            // Point d'attache de la chaîne au boulet avec contour blanc
            ctx.fillStyle = '#B8860B';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bag.x, bag.y - bag.size, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Brillance dorée sur la chaîne avec contours
            const time = Date.now() * 0.01;
            for (let i = 0; i < 3; i++) {
                const sparkleY = bag.y - chainLength + (i * chainLength / 3);
                const angle = time + i;
                const sparkleX = bag.x + Math.cos(angle) * 8;
                ctx.fillStyle = 'rgba(255,215,0,0.8)';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            
            ctx.restore();
        });
    }
    
    getAll() {
        return this.goldBags;
    }
}
