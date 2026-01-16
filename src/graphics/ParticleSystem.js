// ParticleSystem.js - Système de particules
export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 30; // Limite de particules pour performance
        this.lastParticleTime = 0;
        this.particleCooldown = 180; // 3 secondes (60fps * 3)
    }
    
    add(x, y, text, color = '#FFD700', velX = 0, velY = -3) {
        // Anti-spam: 1 particule toutes les 3 secondes
        const now = Date.now();
        if (now - this.lastParticleTime < this.particleCooldown * 16.67) { // 16.67ms par frame
            return;
        }
        this.lastParticleTime = now;
        
        // Limiter le nombre de particules
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift(); // Retirer la plus ancienne
        }
        
        this.particles.push({
            x,
            y,
            text,
            color,
            life: 60, // Réduit de 80 à 60 frames pour libérer plus vite
            velX: velX || (Math.random() - 0.5) * 4,
            velY: velY
        });
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.velX;
            p.y += p.velY;
            p.life--;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.update();
        
        this.particles.forEach(p => {
            const alpha = p.life / 60; // Ajusté pour 60 frames
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x, p.y);
            ctx.globalAlpha = 1;
        });
    }
    
    clear() {
        this.particles = [];
    }
}
