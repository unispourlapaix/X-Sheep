// ============================================
// MODULE REQUIN CYBERNÉTIQUE
// Requin assoiffé de sang avec aileron-fusée et implants mécaniques
// ============================================

export default class SharkBoss {
    constructor() {
        this.config = {
            bodyColor: '#2c3e50',      // Gris métallique
            bellyColor: '#95a5a6',     // Gris clair
            finColor: '#1a252f',       // Noir métallique
            eyeColor: '#ff0000',       // Rouge sang
            teethColor: '#ffffff',     // Blanc
            bloodColor: '#8b0000',     // Rouge sang foncé
            cyberColor: '#00d4ff',     // Cyan cybernétique
            rocketColor: '#ff4400',    // Orange fusée
        };

        // Animation
        this.animationTime = 0;
        
        // Nage
        this.swimWave = 0;
        this.tailSwing = 0;
        
        // Mâchoire
        this.jawOpen = 0;
        this.jawSpeed = 0.15;
        
        // Gouttes de sang
        this.bloodDrops = [];
        this.maxBloodDrops = 6;
        this.bloodTimer = 0;
        
        // Fusée aileron
        this.rocketFlame = 0;
        
        // Implants cybernétiques
        this.cyberPulse = 0;
    }

    update(time, boss) {
        this.animationTime += 0.05;
        
        // Animation de nage
        this.swimWave = Math.sin(this.animationTime * 2) * 0.1;
        this.tailSwing = Math.sin(this.animationTime * 3) * 0.3;
        
        // Mâchoire qui s'ouvre et se ferme (dangereux)
        this.jawOpen = Math.abs(Math.sin(this.animationTime * 2)) * 0.4;
        
        // Flamme de la fusée aileron
        this.rocketFlame = Math.sin(this.animationTime * 8) * 0.5 + 0.5;
        
        // Pulse cybernétique
        this.cyberPulse = Math.abs(Math.sin(this.animationTime * 4));
        
        // Générer des gouttes de sang
        this.bloodTimer++;
        if (this.bloodTimer > 10 && this.bloodDrops.length < this.maxBloodDrops) {
            // Sang qui tombe de la gueule
            this.bloodDrops.push({
                x: boss.x - boss.size * 1.2 + (Math.random() - 0.5) * boss.size * 0.3,
                y: boss.y + boss.size * 0.2,
                vy: 2 + Math.random() * 2,
                vx: (Math.random() - 0.5) * 2,
                life: 1,
                size: 3 + Math.random() * 4
            });
            this.bloodTimer = 0;
        }

        // Mettre à jour les gouttes de sang
        for (let i = this.bloodDrops.length - 1; i >= 0; i--) {
            const drop = this.bloodDrops[i];
            drop.x += drop.vx;
            drop.y += drop.vy;
            drop.vy += 0.2;  // Gravité
            drop.life -= 0.02;
            
            if (drop.life <= 0) {
                this.bloodDrops.splice(i, 1);
            }
        }
    }

    getHeadPosition() {
        return null; // Utiliser la position du boss
    }

    render(ctx, boss) {
        const size = boss.size;
        
        // Dessiner les gouttes de sang d'abord
        this.drawBlood(ctx);
        
        ctx.save();
        ctx.translate(boss.x, boss.y);
        
        // Queue
        this.drawTail(ctx, size);
        
        // Nageoire caudale
        this.drawCaudalFin(ctx, size);
        
        // Corps principal
        this.drawBody(ctx, size);
        
        // AILERON DORSAL avec FUSÉE
        this.drawRocketFin(ctx, size);
        
        // Nageoires pectorales
        this.drawPectoralFins(ctx, size);
        
        // Tête avec mâchoire
        this.drawHead(ctx, size);
        
        // Implants cybernétiques
        this.drawCyberImplants(ctx, size);
        
        ctx.restore();
    }

    drawBody(ctx, size) {
        // VUE DE CÔTÉ - Corps de requin cybernétique
        ctx.fillStyle = this.config.bodyColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        // Corps profilé
        ctx.beginPath();
        ctx.moveTo(-size * 1.5, 0);  // Bout du nez
        ctx.quadraticCurveTo(-size * 0.8, -size * 0.4, size * 0.2, -size * 0.5);  // Dos
        ctx.lineTo(size * 0.8, -size * 0.3);  // Vers queue
        ctx.lineTo(size * 1.2, 0);  // Base queue
        ctx.lineTo(size * 0.8, size * 0.3);  // Dessous queue
        ctx.quadraticCurveTo(0, size * 0.6, -size * 1.2, size * 0.3);  // Ventre
        ctx.lineTo(-size * 1.5, 0);  // Retour nez
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Ventre plus clair
        ctx.fillStyle = this.config.bellyColor;
        ctx.beginPath();
        ctx.moveTo(-size * 1.2, size * 0.2);
        ctx.quadraticCurveTo(0, size * 0.5, size * 0.6, size * 0.25);
        ctx.lineTo(size * 0.5, size * 0.1);
        ctx.quadraticCurveTo(0, size * 0.2, -size * 1.0, size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        // Fentes branchiales (mécaniques)
        ctx.strokeStyle = this.config.cyberColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        
        for (let i = 0; i < 5; i++) {
            const x = -size * 0.5 + i * size * 0.15;
            ctx.beginPath();
            ctx.moveTo(x, -size * 0.2);
            ctx.lineTo(x + size * 0.1, -size * 0.35);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }

    drawHead(ctx, size) {
        // Tête avec mâchoire qui s'ouvre
        const jawAngle = this.jawOpen;
        
        // Partie supérieure (fixe)
        ctx.fillStyle = this.config.bodyColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(-size * 1.5, 0);
        ctx.quadraticCurveTo(-size * 1.6, -size * 0.15, -size * 1.4, -size * 0.2);
        ctx.lineTo(-size * 1.2, -size * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // DENTS supérieures (fixes)
        ctx.fillStyle = this.config.teethColor;
        for (let i = 0; i < 8; i++) {
            const toothX = -size * 1.5 + i * size * 0.08;
            
            ctx.beginPath();
            ctx.moveTo(toothX, -size * 0.05);
            ctx.lineTo(toothX - size * 0.03, size * 0.05);
            ctx.lineTo(toothX + size * 0.03, size * 0.05);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        // Mâchoire inférieure (mobile)
        ctx.save();
        ctx.translate(-size * 1.3, size * 0.1);
        ctx.rotate(jawAngle);
        
        ctx.fillStyle = this.config.bodyColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-size * 0.2, size * 0.15, -size * 0.1, size * 0.25);
        ctx.lineTo(size * 0.1, size * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // DENTS inférieures (sang dessus)
        ctx.fillStyle = this.config.teethColor;
        for (let i = 0; i < 6; i++) {
            const toothX = -size * 0.15 + i * size * 0.08;
            
            ctx.beginPath();
            ctx.moveTo(toothX, 0);
            ctx.lineTo(toothX - size * 0.03, size * 0.08);
            ctx.lineTo(toothX + size * 0.03, size * 0.08);
            ctx.closePath();
            ctx.fill();
            
            // Taches de sang sur certaines dents
            if (i % 2 === 0) {
                ctx.fillStyle = this.config.bloodColor;
                ctx.globalAlpha = 0.7;
                ctx.fillRect(toothX - size * 0.02, size * 0.02, size * 0.04, size * 0.04);
                ctx.globalAlpha = 1;
                ctx.fillStyle = this.config.teethColor;
            }
        }
        
        ctx.restore();
        
        // ŒIL ROUGE SANG cybernétique
        ctx.fillStyle = this.config.eyeColor;
        ctx.shadowColor = this.config.eyeColor;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(-size * 1.1, -size * 0.25, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Pupille mécanique
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-size * 1.1, -size * 0.25, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Cercle cybernétique autour de l'œil
        ctx.strokeStyle = this.config.cyberColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = this.cyberPulse;
        ctx.beginPath();
        ctx.arc(-size * 1.1, -size * 0.25, size * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawRocketFin(ctx, size) {
        // AILERON DORSAL avec FUSÉE intégrée
        const finX = size * 0.2;
        const finY = -size * 0.5;
        
        ctx.fillStyle = this.config.finColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        // Base de l'aileron (forme triangulaire)
        ctx.beginPath();
        ctx.moveTo(finX - size * 0.2, finY);
        ctx.lineTo(finX, finY - size * 0.8);  // Pointe haute
        ctx.lineTo(finX + size * 0.3, finY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // FUSÉE intégrée dans l'aileron
        const rocketY = finY - size * 0.5;
        ctx.fillStyle = this.config.bodyColor;
        
        // Corps de la fusée
        ctx.fillRect(finX - size * 0.08, rocketY, size * 0.16, size * 0.3);
        ctx.strokeRect(finX - size * 0.08, rocketY, size * 0.16, size * 0.3);
        
        // Symbole de danger
        ctx.fillStyle = '#ffff00';
        ctx.font = `bold ${size * 0.12}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', finX, rocketY + size * 0.15);
        
        // Tuyère de la fusée
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(finX - size * 0.1, finY - size * 0.2, size * 0.2, size * 0.1);
        
        // FLAMME de la fusée
        this.drawRocketFlame(ctx, finX, finY - size * 0.15);
        
        // Détails mécaniques cybernétiques
        ctx.strokeStyle = this.config.cyberColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.moveTo(finX - size * 0.1, rocketY);
        ctx.lineTo(finX - size * 0.15, finY - size * 0.25);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(finX + size * 0.1, rocketY);
        ctx.lineTo(finX + size * 0.15, finY - size * 0.25);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }

    drawRocketFlame(ctx, x, y) {
        // Flamme animée de la fusée aileron
        const flameLength = 0.3 + this.rocketFlame * 0.2;
        
        const gradient = ctx.createLinearGradient(x, y, x, y + flameLength * 30);
        gradient.addColorStop(0, this.config.rocketColor);
        gradient.addColorStop(0.5, '#ff8800');
        gradient.addColorStop(1, 'rgba(255, 136, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x - 4, y + flameLength * 25);
        ctx.lineTo(x, y + flameLength * 30);
        ctx.lineTo(x + 4, y + flameLength * 25);
        ctx.lineTo(x + 8, y);
        ctx.closePath();
        ctx.fill();
    }

    drawPectoralFins(ctx, size) {
        // Nageoires pectorales (vue de côté - une seule visible)
        ctx.fillStyle = this.config.finColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, size * 0.4);
        ctx.lineTo(-size * 0.2, size * 0.9);
        ctx.lineTo(size * 0.1, size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawTail(ctx, size) {
        // Queue qui ondule
        ctx.strokeStyle = this.config.bodyColor;
        ctx.lineWidth = size * 0.3;
        ctx.lineCap = 'round';
        
        const tailWave = this.tailSwing * size * 0.2;
        
        ctx.beginPath();
        ctx.moveTo(size * 1.2, 0);
        ctx.quadraticCurveTo(size * 1.5, tailWave, size * 1.8, tailWave * 1.5);
        ctx.stroke();
    }

    drawCaudalFin(ctx, size) {
        // Nageoire caudale (queue)
        const tailWave = this.tailSwing * size * 0.2;
        
        ctx.fillStyle = this.config.finColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        ctx.save();
        ctx.translate(size * 1.8, tailWave * 1.5);
        ctx.rotate(this.tailSwing * 0.3);
        
        // Lobe supérieur
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.3, -size * 0.6);
        ctx.lineTo(size * 0.1, -size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Lobe inférieur
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.3, size * 0.4);
        ctx.lineTo(size * 0.1, size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }

    drawCyberImplants(ctx, size) {
        // Implants cybernétiques sur le corps
        ctx.fillStyle = this.config.cyberColor;
        ctx.shadowColor = this.config.cyberColor;
        ctx.shadowBlur = 10 * this.cyberPulse;
        
        // Plaques métalliques
        ctx.globalAlpha = 0.7;
        
        // Plaque 1
        ctx.fillRect(-size * 0.6, -size * 0.35, size * 0.3, size * 0.1);
        
        // Plaque 2
        ctx.fillRect(size * 0.1, -size * 0.4, size * 0.25, size * 0.08);
        
        // Circuits lumineux
        ctx.globalAlpha = this.cyberPulse;
        ctx.strokeStyle = this.config.cyberColor;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, -size * 0.3);
        ctx.lineTo(0, -size * 0.2);
        ctx.lineTo(size * 0.3, -size * 0.35);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    drawBlood(ctx) {
        // Dessiner les gouttes de sang
        ctx.fillStyle = this.config.bloodColor;
        ctx.shadowColor = this.config.bloodColor;
        ctx.shadowBlur = 5;
        
        for (const drop of this.bloodDrops) {
            ctx.globalAlpha = drop.life;
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}
