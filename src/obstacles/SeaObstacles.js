/**
 * SeaObstacles.js - Obstacles aquatiques pour le niveau 3
 */

export class SeaObstacles {
    static createWave(x, y) {
        return {
            type: 'wave',
            x: x,
            y: y,
            width: 80,
            height: 60,
            speed: 0.4,
            amplitude: 15,
            phase: Math.random() * Math.PI * 2,
            damage: 0,
            icon: '🌊'
        };
    }

    static createRock(x, y) {
        return {
            type: 'rock',
            x: x,
            y: y,
            width: 50,
            height: 50,
            speed: 0.4,
            damage: 1,
            icon: '🪨',
            rotation: Math.random() * Math.PI * 2
        };
    }

    static createJellyfish(x, y) {
        return {
            type: 'jellyfish',
            x: x,
            y: y,
            width: 40,
            height: 60,
            speed: 0.3,
            damage: 0,
            icon: '🪼',
            bobPhase: Math.random() * Math.PI * 2,
            tentacles: true
        };
    }

    static createShark(x, y) {
        return {
            type: 'shark',
            x: x,
            y: 256, // Uniquement au niveau de l'eau
            width: 100,
            height: 50,
            speed: 0.3, // Ralenti pour être plus visible
            damage: 0, // Zen mode - pas de dégâts directs
            icon: '🦈',
            aggressive: true
        };
    }

    static createWhirlpool(x, y) {
        return {
            type: 'whirlpool',
            x: x,
            y: y,
            width: 120,
            height: 120,
            speed: 0.2,
            damage: 0, // Ne fait pas de dégâts, aspire seulement
            rotation: 0,
            pullForce: 0.5, // Force d'aspiration faible
            icon: '🌀'
        };
    }

    static createSiren(x, y) {
        return {
            type: 'siren',
            x: x,
            y: y,
            width: 40,
            height: 60,
            speed: 0.3,
            damage: 0,
            icon: '🧜‍♀️',
            singing: false,
            charmRadius: 100
        };
    }

    static getRandom(canvasWidth, canvasHeight) {
        const x = canvasWidth + 50;
        const y = 200 + Math.random() * 200; // Zone eau
        const rand = Math.random();

        // Plus de vagues et méduses (inoffensives), moins de requins
        if (rand < 0.4) return this.createWave(x, y);
        if (rand < 0.6) return this.createJellyfish(x, y);
        if (rand < 0.75) return this.createWhirlpool(x, y);
        if (rand < 0.85) return this.createSiren(x, y);
        if (rand < 0.95) return this.createRock(x, y);
        return this.createShark(x, y);
    }
}

export class Leviathan {
    constructor(canvasWidth, canvasHeight) {
        this.x = canvasWidth;
        this.y = canvasHeight / 2;
        this.width = 200;
        this.height = 150;
        this.speed = 0.5;
        this.health = 5;
        this.maxHealth = 5;
        this.phase = 0; // 0: approche, 1: attaque, 2: fuite
        this.attackTimer = 0;
        this.attackCooldown = 360; // 6 secondes (plus lent)
        this.isActive = false;
        this.defeated = false;
    }

    update(player) {
        if (!this.isActive || this.defeated) return;

        switch (this.phase) {
            case 0: // Approche
                this.x -= this.speed;
                this.y += Math.sin(Date.now() * 0.002) * 2;
                
                if (this.x < 600) {
                    this.phase = 1; // Passer en mode attaque
                }
                break;

            case 1: // Attaque
                this.attackTimer++;
                
                // Mouvement sinusoïdal
                this.y += Math.sin(Date.now() * 0.003) * 3;
                this.y = Math.max(200, Math.min(400, this.y));

                // Se déplace latéralement
                if (this.x > 500) {
                    this.x -= 0.5;
                } else if (this.x < 400) {
                    this.x += 0.5;
                }

                if (this.attackTimer >= this.attackCooldown) {
                    this.attackTimer = 0;
                    return this.spawnProjectile();
                }
                break;

            case 2: // Fuite
                this.x += this.speed * 2;
                this.y += Math.sin(Date.now() * 0.005) * 4;
                break;
        }

        return null;
    }

    spawnProjectile() {
        // Jet d'eau vers le joueur
        return {
            type: 'waterjet',
            x: this.x,
            y: this.y + this.height / 2,
            width: 30,
            height: 30,
            speed: 2,
            damage: 1,
            icon: '💧',
            velX: -2,
            velY: 0
        };
    }

    takeDamage(amount) {
        if (this.defeated) return false;
        
        this.health -= amount;
        
        if (this.health <= 0) {
            this.health = 0;
            this.defeated = true;
            this.phase = 2; // Fuite
            return true; // Boss vaincu
        }
        return false;
    }

    checkCollision(player) {
        const dx = (this.x + this.width / 2) - player.x;
        const dy = (this.y + this.height / 2) - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.width / 2 + 30);
    }

    render(ctx) {
        if (!this.isActive || this.defeated) return;

        // Ombre sous l'eau
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x - 10, this.y + this.height - 10, this.width + 20, 20);

        // Corps du Léviathan (serpent de mer géant)
        ctx.save();
        
        // Écailles
        for (let i = 0; i < 5; i++) {
            const segmentX = this.x + i * 40;
            const offset = Math.sin(Date.now() * 0.003 + i * 0.5) * 10;
            
            ctx.fillStyle = i % 2 === 0 ? '#1A5F7A' : '#2C7A9B';
            ctx.beginPath();
            ctx.arc(segmentX, this.y + offset, 35, 0, Math.PI * 2);
            ctx.fill();
            
            // Contour
            ctx.strokeStyle = '#0D3B52';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Tête
        ctx.fillStyle = '#1A5F7A';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0D3B52';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Yeux rouges menaçants
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x - 15, this.y - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - 15, this.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Pupilles
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x - 15, this.y - 10, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - 15, this.y + 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // Gueule
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 40, this.y);
        ctx.lineTo(this.x - 30, this.y - 5);
        ctx.stroke();

        // Crocs
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - 35 + i * 5, this.y - 5);
            ctx.lineTo(this.x - 33 + i * 5, this.y + 5);
            ctx.lineTo(this.x - 37 + i * 5, this.y - 5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        // Barre de vie
        const barWidth = 150;
        const barHeight = 10;
        const barX = this.x + this.width / 2 - barWidth / 2;
        const barY = this.y - 50;

        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = this.health > 3 ? '#00FF00' : '#FF0000';
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Nom du boss
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐉 LÉVIATHAN', this.x + this.width / 2, barY - 10);
    }
}
