// ============================================
// MODULE BALEINE FUKUSHIMA (Radioactive Whale)
// Baleine géante vue de CÔTÉ, formes géométriques simplifiées
// Gros ventre, grande queue papillon, traînée radioactive
// ============================================

export default class WhaleBoss {
    constructor() {
        this.config = {
            bodyColor: '#0a1a2e',      // Bleu très sombre
            bellyColor: '#1e3a5f',     // Bleu moyen pour ventre
            finColor: '#0d2847',       // Bleu foncé pour nageoires
            glowColor: '#00ff41',      // Vert radioactif
            trailColor: '#00ff41',     // Traînée verte
        };

        // Particules de contamination (limité pour performance)
        this.contaminationTrail = [];
        this.maxTrailParticles = 8;
        this.trailTimer = 0;

        // Animation
        this.animationTime = 0;
        this.tailFlap = 0;
    }

    update(time, boss) {
        this.animationTime += 0.05;
        
        // Animation de la nageoire caudale
        this.tailFlap = Math.sin(this.animationTime * 2) * 0.3;

        // Ajouter des particules de contamination (max 8)
        this.trailTimer++;
        if (this.trailTimer > 5 && this.contaminationTrail.length < this.maxTrailParticles) {
            this.contaminationTrail.push({
                x: boss.x + boss.size * 1.8,  // Derrière la queue (droite)
                y: boss.y + (Math.random() - 0.5) * boss.size * 0.4,
                life: 1,
                size: boss.size * 0.3
            });
            this.trailTimer = 0;
        }

        // Mettre à jour les particules
        for (let i = this.contaminationTrail.length - 1; i >= 0; i--) {
            const particle = this.contaminationTrail[i];
            particle.life -= 0.02;
            particle.size *= 0.98;
            
            if (particle.life <= 0) {
                this.contaminationTrail.splice(i, 1);
            }
        }
    }

    getHeadPosition() {
        // Position approximative de la tête (avant de la baleine)
        return null; // Utiliser la position du boss
    }

    render(ctx, boss) {
        const size = boss.size;
        
        // Dessiner la traînée de contamination d'abord
        this.drawContaminationTrail(ctx);

        ctx.save();
        ctx.translate(boss.x, boss.y);
        
        // Corps de la baleine (vue de dessus)
        this.drawBody(ctx, size);
        
        // Nageoires pectorales
        this.drawPectoralFins(ctx, size);
        
        // Nageoire caudale (papillon)
        this.drawTailFin(ctx, size);
        
        // Tête
        this.drawHead(ctx, size);
        
        // Effet de contamination (glow vert)
        this.drawRadioactiveGlow(ctx, size);
        
        ctx.restore();
    }

    drawBody(ctx, size) {
        // VUE DE CÔTÉ - Corps principal avec gros ventre (forme simple)
        ctx.fillStyle = this.config.bodyColor;
        ctx.beginPath();
        // Dos (ligne du haut - droite)
        ctx.moveTo(-size * 1.2, -size * 0.5);  // Tête
        ctx.lineTo(-size * 0.2, -size * 0.7);  // Haut du dos
        ctx.lineTo(size * 1.0, -size * 0.4);   // Vers queue
        // Queue
        ctx.lineTo(size * 1.5, 0);             // Base queue
        // Ventre (ligne du bas - arrondie)
        ctx.lineTo(size * 0.8, size * 0.8);    // Après queue
        ctx.quadraticCurveTo(0, size * 1.2, -size * 1.0, size * 0.6);  // GROS VENTRE
        ctx.lineTo(-size * 1.2, -size * 0.5);  // Retour tête
        ctx.closePath();
        ctx.fill();

        // Ventre plus clair (zone ventrale proéminente)
        ctx.fillStyle = this.config.bellyColor;
        ctx.beginPath();
        ctx.moveTo(-size * 0.8, size * 0.5);
        ctx.quadraticCurveTo(0, size * 1.0, size * 0.6, size * 0.7);
        ctx.lineTo(size * 0.5, size * 0.3);
        ctx.quadraticCurveTo(0, size * 0.5, -size * 0.8, size * 0.3);
        ctx.closePath();
        ctx.fill();

        // Veines radioactives simplifiées (quelques lignes)
        ctx.strokeStyle = this.config.glowColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        
        // 3 veines principales sur le corps
        ctx.beginPath();
        ctx.moveTo(-size * 0.8, -size * 0.4);
        ctx.lineTo(size * 0.8, -size * 0.2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.6, 0);
        ctx.lineTo(size * 1.0, 0.1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.5, size * 0.5);
        ctx.lineTo(size * 0.6, size * 0.6);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }

    drawHead(ctx, size) {
        // VUE DE CÔTÉ - Tête simplifiée (déjà incluse dans drawBody)
        
        // Bouche (ligne simple)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(-size * 1.2, size * 0.2);
        ctx.lineTo(-size * 0.8, size * 0.4);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Œil unique (vue de côté) - gros et luisant
        ctx.fillStyle = this.config.glowColor;
        ctx.shadowColor = this.config.glowColor;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(-size * 0.9, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;

        // Pupille verticale (reptilien/monstrueux)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-size * 0.9, -size * 0.3, size * 0.04, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPectoralFins(ctx, size) {
        // VUE DE CÔTÉ - Nageoire pectorale (une seule visible)
        ctx.fillStyle = this.config.finColor;
        
        // Nageoire sur le côté (forme allongée simple)
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, size * 0.6);
        ctx.lineTo(-size * 0.1, size * 1.4);  // Pointe
        ctx.lineTo(size * 0.3, size * 0.9);
        ctx.lineTo(size * 0.2, size * 0.5);
        ctx.closePath();
        ctx.fill();
    }

    drawTailFin(ctx, size) {
        // VUE DE CÔTÉ - GROSSE QUEUE PAPILLON VERTICALE (professionnelle)
        ctx.fillStyle = this.config.finColor;
        
        const tailX = size * 1.5;  // Position à l'arrière
        const flapOffset = this.tailFlap * size * 0.3;

        // Lobe supérieur (GROS)
        ctx.beginPath();
        ctx.moveTo(tailX, 0);
        ctx.quadraticCurveTo(
            tailX + size * 0.3, -size * 1.0 + flapOffset,
            tailX + size * 0.5, -size * 1.6 + flapOffset  // TRÈS GRAND
        );
        ctx.quadraticCurveTo(
            tailX - size * 0.1, -size * 1.2 + flapOffset,
            tailX - size * 0.2, -size * 0.2
        );
        ctx.closePath();
        ctx.fill();

        // Lobe inférieur (GROS)
        ctx.beginPath();
        ctx.moveTo(tailX, 0);
        ctx.quadraticCurveTo(
            tailX + size * 0.3, size * 1.0 - flapOffset,
            tailX + size * 0.5, size * 1.6 - flapOffset  // TRÈS GRAND
        );
        ctx.quadraticCurveTo(
            tailX - size * 0.1, size * 1.2 - flapOffset,
            tailX - size * 0.2, size * 0.2
        );
        ctx.closePath();
        ctx.fill();
        
        // Nervures sur la queue (détail pro)
        ctx.strokeStyle = this.config.bodyColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        
        // Nervures supérieures
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(tailX, -size * 0.1);
            ctx.lineTo(tailX + size * 0.3, -size * (0.6 + i * 0.3) + flapOffset);
            ctx.stroke();
        }
        
        // Nervures inférieures
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(tailX, size * 0.1);
            ctx.lineTo(tailX + size * 0.3, size * (0.6 + i * 0.3) - flapOffset);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    drawRadioactiveGlow(ctx, size) {
        // Effet de contamination radioactive (glow vert minimal)
        ctx.shadowColor = this.config.glowColor;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.3 + Math.sin(this.animationTime) * 0.1;
        
        ctx.strokeStyle = this.config.glowColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.5, size * 0.8, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    drawContaminationTrail(ctx) {
        // Traînée de contamination (particules vertes)
        for (const particle of this.contaminationTrail) {
            ctx.save();
            ctx.globalAlpha = particle.life * 0.4;
            ctx.fillStyle = this.config.trailColor;
            ctx.shadowColor = this.config.trailColor;
            ctx.shadowBlur = 15;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
}
