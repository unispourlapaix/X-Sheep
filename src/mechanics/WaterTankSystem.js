// WaterTankSystem.js - Système de réservoirs d'eau (carburant pour le vol)
import { GameConfig } from '../config/GameConfig.js';
import { Physics } from '../core/Physics.js';

export class WaterTankSystem {
    constructor(game) {
        this.game = game;
        this.tanks = [];
        this.spawnTimer = 0;
        this.spawnInterval = 900; // Toutes les 15 secondes environ (réduit drastiquement)
    }
    
    update() {
        this.spawnTimer++;
        
        // Spawner des réservoirs
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTank();
            this.spawnTimer = 0;
        }
        
        // Mettre à jour et vérifier collisions
        for (let i = this.tanks.length - 1; i >= 0; i--) {
            const tank = this.tanks[i];
            
            // Mouvement
            tank.x -= this.game.gameSpeed;
            
            // Animation flottante
            tank.bobOffset = Math.sin(Date.now() * 0.003 + tank.id) * 5;
            
            // Collision avec joueur
            if (this.checkCollision(tank)) {
                this.game.player.refillFuel(60); // Augmenté de 40 à 60 pour suremplir
                this.tanks.splice(i, 1);
                this.game.score += 100;
                this.game.renderer.addParticle(tank.x, tank.y, '💧', '#00BFFF');
                continue;
            }
            
            // Supprimer si hors écran
            if (tank.x + tank.width < 0) {
                this.tanks.splice(i, 1);
            }
        }
    }
    
    spawnTank() {
        const groundY = this.game.canvas.height - 80;
        
        this.tanks.push({
            id: Math.random(),
            x: this.game.canvas.width + 50,
            y: groundY - 100, // Entre le sol et les obstacles du milieu
            width: 30,
            height: 40,
            bobOffset: 0
        });
    }
    
    checkCollision(tank) {
        const playerHitbox = this.game.player.getHitbox();
        return Physics.checkCollision(playerHitbox, {
            x: tank.x,
            y: tank.y + tank.bobOffset,
            width: tank.width,
            height: tank.height
        });
    }
    
    render(ctx) {
        this.tanks.forEach(tank => {
            const y = tank.y + tank.bobOffset;
            
            ctx.save();
            
            // Ombre douce
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(tank.x + tank.width/2, y + tank.height + 5, tank.width/2, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Réservoir (cylindre bleu) avec contour blanc pixel art
            const gradient = ctx.createLinearGradient(tank.x, y, tank.x + tank.width, y);
            gradient.addColorStop(0, '#00BFFF');
            gradient.addColorStop(0.5, '#87CEEB');
            gradient.addColorStop(1, '#00BFFF');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(tank.x, y + 5, tank.width, tank.height - 10);
            
            // Haut du réservoir
            ctx.beginPath();
            ctx.ellipse(tank.x + tank.width/2, y + 5, tank.width/2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Bas du réservoir
            ctx.beginPath();
            ctx.ellipse(tank.x + tank.width/2, y + tank.height - 5, tank.width/2, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Contours BLANCS pixel art (style vitrail)
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(tank.x, y + 5, tank.width, tank.height - 10);
            
            // Ellipses haut/bas avec contours blancs
            ctx.beginPath();
            ctx.ellipse(tank.x + tank.width/2, y + 5, tank.width/2, 5, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(tank.x + tank.width/2, y + tank.height - 5, tank.width/2, 5, 0, 0, Math.PI * 2);
            ctx.stroke();
            
            // Goutte d'eau stylisée (pixel art)
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#0080FF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tank.x + tank.width/2, y + tank.height/2 - 8);
            ctx.quadraticCurveTo(tank.x + tank.width/2 + 5, y + tank.height/2 - 3, tank.x + tank.width/2 + 5, y + tank.height/2 + 3);
            ctx.arc(tank.x + tank.width/2, y + tank.height/2 + 3, 5, 0, Math.PI);
            ctx.quadraticCurveTo(tank.x + tank.width/2 - 5, y + tank.height/2 - 3, tank.x + tank.width/2, y + tank.height/2 - 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Brillance pixel art
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(tank.x + 10, y + 12, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Particules d'eau avec contours blancs
            const time = Date.now() * 0.005;
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI * 2 / 3) + time;
                const px = tank.x + tank.width/2 + Math.cos(angle) * 25;
                const py = y + tank.height/2 + Math.sin(angle) * 20;
                ctx.fillStyle = 'rgba(0,191,255,0.7)';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            
            ctx.restore();
        });
    }
    
    getAll() {
        return this.tanks;
    }
}
