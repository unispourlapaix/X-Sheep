// ============================================
// MODULE OVNI (UFO)
// Soucoupe volante avec lasers et point d'exclamation d'alerte
// ============================================

export default class UfoBoss {
    constructor() {
        this.config = {
            bodyColor: '#2d3436',      // Gris métallique
            domeColor: '#636e72',      // Gris clair pour dôme
            glowColor: '#00ff00',      // Vert alien
            laserColor: '#00ff00',     // Lasers verts
            alertColor: '#ff0000',     // Rouge pour le !
            lightColor: '#ffff00',     // Jaune pour lumières
        };

        // Animation
        this.animationTime = 0;
        this.hoverOffset = 0;
        this.rotation = 0;
        
        // Lasers
        this.lasers = [];
        this.maxLasers = 4;
        this.laserTimer = 0;
        
        // Lumières clignotantes
        this.lightBlink = 0;
        
        // Alerte (point d'exclamation)
        this.alertPulse = 0;
    }

    update(time, boss) {
        this.animationTime += 0.05;
        
        // Rotation lente de la soucoupe
        this.rotation += 0.02;
        
        // Hover (lévitation)
        this.hoverOffset = Math.sin(this.animationTime * 2) * 0.2;
        
        // Lumières clignotantes
        this.lightBlink = Math.sin(this.animationTime * 5);
        
        // Pulse du point d'exclamation
        this.alertPulse = Math.abs(Math.sin(this.animationTime * 3));
        
        // Générer des lasers
        this.laserTimer++;
        if (this.laserTimer > 15 && this.lasers.length < this.maxLasers) {
            // Laser tiré vers le bas
            this.lasers.push({
                x: boss.x + (Math.random() - 0.5) * boss.size * 0.8,
                y: boss.y + boss.size * 0.5,
                length: 0,
                maxLength: 100 + Math.random() * 100,
                growing: true,
                life: 1
            });
            this.laserTimer = 0;
        }

        // Mettre à jour les lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            if (laser.growing) {
                laser.length += 15;
                if (laser.length >= laser.maxLength) {
                    laser.growing = false;
                }
            } else {
                laser.life -= 0.05;
                if (laser.life <= 0) {
                    this.lasers.splice(i, 1);
                }
            }
        }
    }

    getHeadPosition() {
        return null; // Utiliser la position du boss
    }

    render(ctx, boss) {
        const size = boss.size;
        
        // Dessiner les lasers d'abord
        this.drawLasers(ctx);
        
        ctx.save();
        ctx.translate(boss.x, boss.y + this.hoverOffset * size);
        
        // Faisceau lumineux sous l'OVNI
        this.drawBeam(ctx, size);
        
        // Corps de la soucoupe
        ctx.save();
        ctx.rotate(this.rotation);
        this.drawSaucer(ctx, size);
        ctx.restore();
        
        // Dôme transparent
        this.drawDome(ctx, size);
        
        // Lumières clignotantes
        this.drawLights(ctx, size);
        
        // Point d'exclamation d'alerte
        this.drawAlert(ctx, size);
        
        ctx.restore();
    }

    drawSaucer(ctx, size) {
        // Corps principal de la soucoupe (ellipse aplatie)
        ctx.fillStyle = this.config.bodyColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        // Base de la soucoupe
        ctx.beginPath();
        ctx.ellipse(0, size * 0.2, size * 0.9, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Anneaux métalliques (détails)
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, size * 0.2, size * 0.7, size * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.ellipse(0, size * 0.2, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawDome(ctx, size) {
        // Dôme transparent sur le dessus
        ctx.fillStyle = this.config.domeColor;
        ctx.globalAlpha = 0.6;
        
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.1, size * 0.5, size * 0.35, 0, 0, Math.PI, true);
        ctx.fill();
        
        ctx.globalAlpha = 1;
        
        // Reflet sur le dôme
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.ellipse(-size * 0.15, -size * 0.25, size * 0.15, size * 0.1, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawLights(ctx, size) {
        // Lumières clignotantes autour de la soucoupe
        const numLights = 8;
        
        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * Math.PI * 2;
            const x = Math.cos(angle) * size * 0.8;
            const y = size * 0.2 + Math.sin(angle) * size * 0.25;
            
            // Alternance de couleurs
            const isActive = Math.floor(this.lightBlink * 2 + i) % 2 === 0;
            ctx.fillStyle = isActive ? this.config.lightColor : this.config.glowColor;
            ctx.shadowColor = isActive ? this.config.lightColor : this.config.glowColor;
            ctx.shadowBlur = isActive ? 15 : 8;
            
            ctx.beginPath();
            ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
    }

    drawBeam(ctx, size) {
        // Faisceau lumineux sous l'OVNI (effet abduction)
        const gradient = ctx.createLinearGradient(0, size * 0.4, 0, size * 2.5);
        gradient.addColorStop(0, `rgba(0, 255, 0, ${0.3 * this.alertPulse})`);
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, size * 0.4);
        ctx.lineTo(-size * 0.8, size * 2.5);
        ctx.lineTo(size * 0.8, size * 2.5);
        ctx.lineTo(size * 0.3, size * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Particules dans le faisceau
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * this.alertPulse})`;
        for (let i = 0; i < 5; i++) {
            const y = size * 0.6 + (this.animationTime * 30 + i * 40) % (size * 1.8);
            const x = Math.sin(i + this.animationTime) * size * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawAlert(ctx, size) {
        // POINT D'EXCLAMATION au-dessus de l'OVNI
        const alertSize = size * 0.4 * (1 + this.alertPulse * 0.2);
        const alertY = -size * 0.8;
        
        ctx.fillStyle = this.config.alertColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = this.config.alertColor;
        ctx.shadowBlur = 20 * this.alertPulse;
        
        // Barre du !
        ctx.fillRect(-alertSize * 0.2, alertY - alertSize * 0.8, alertSize * 0.4, alertSize * 0.6);
        ctx.strokeRect(-alertSize * 0.2, alertY - alertSize * 0.8, alertSize * 0.4, alertSize * 0.6);
        
        // Point du !
        ctx.beginPath();
        ctx.arc(0, alertY, alertSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

    drawLasers(ctx) {
        // Dessiner les lasers
        ctx.strokeStyle = this.config.laserColor;
        ctx.shadowColor = this.config.laserColor;
        ctx.shadowBlur = 15;
        
        for (const laser of this.lasers) {
            ctx.globalAlpha = laser.life;
            ctx.lineWidth = 4;
            
            ctx.beginPath();
            ctx.moveTo(laser.x, laser.y);
            ctx.lineTo(laser.x, laser.y + laser.length);
            ctx.stroke();
            
            // Point de départ brillant
            ctx.fillStyle = this.config.laserColor;
            ctx.beginPath();
            ctx.arc(laser.x, laser.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Point d'impact
            if (!laser.growing) {
                ctx.beginPath();
                ctx.arc(laser.x, laser.y + laser.length, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}
