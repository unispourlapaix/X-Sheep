// ============================================
// MODULE KRAKEN DANGEREUX
// Kraken VUE DE FACE avec tentacules, crochets lasers et fusée
// ============================================

export default class KrakenBoss {
    constructor() {
        this.config = {
            bodyColor: '#4a1a4a',      // Violet foncé
            tentacleColor: '#6b2d6b',  // Violet moyen
            eyeColor: '#ff0000',       // Rouge dangereux
            missileColor: '#2c2c2c',   // Gris métallique
            flameColor: '#ff4400',     // Flamme orange
            glowColor: '#9933ff',      // Violet lumineux
            laserColor: '#00ff00',     // Vert laser pour crochets
        };

        // Animation
        this.animationTime = 0;
        
        // Tentacules
        this.tentacles = [];
        this.numTentacles = 6;
        this.initTentacles();
        
        // Fusée sur le ventre
        this.rocketPulse = 0;
        this.rocketFlame = 0;
        
        // Yeux qui clignotent
        this.eyeBlink = 0;
    }

    initTentacles() {
        // Initialiser les tentacules autour du corps
        for (let i = 0; i < this.numTentacles; i++) {
            const angle = (i / this.numTentacles) * Math.PI * 2;
            this.tentacles.push({
                baseAngle: angle,
                segments: 5,
                length: 0.8,
                waveOffset: Math.random() * Math.PI * 2
            });
        }
    }

    update(time, boss) {
        this.animationTime += 0.05;
        
        // Pulse de la fusée (danger)
        this.rocketPulse = Math.abs(Math.sin(this.animationTime * 4));
        
        // Flamme de la fusée
        this.rocketFlame = Math.sin(this.animationTime * 8) * 0.5 + 0.5;
        
        // Clignement des yeux
        this.eyeBlink = Math.sin(this.animationTime * 2) > 0.9 ? 0 : 1;
    }

    getHeadPosition() {
        return null; // Utiliser la position du boss
    }

    render(ctx, boss) {
        const size = boss.size;
        
        ctx.save();
        ctx.translate(boss.x, boss.y);
        
        // Dessiner les tentacules d'abord (derrière)
        this.drawTentacles(ctx, size);
        
        // Corps principal du Kraken
        this.drawBody(ctx, size);
        
        // Fusée sur le ventre
        this.drawRocket(ctx, size);
        
        // Yeux dangereux
        this.drawEyes(ctx, size);
        
        // Effet de glow
        this.drawGlow(ctx, size);
        
        ctx.restore();
    }

    drawBody(ctx, size) {
        // VUE DE FACE - Corps principal (grosse tête allongée)
        ctx.fillStyle = this.config.bodyColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        
        // Corps en forme de cloche/tête allongée (vue de face)
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.6, size * 0.9, 0, 0, Math.PI * 2);  // Plus long verticalement
        ctx.fill();
        ctx.stroke();
        
        // Texture (points/ventouses) sur le devant
        ctx.fillStyle = this.config.tentacleColor;
        for (let i = 0; i < 6; i++) {
            const y = -size * 0.5 + (i * size * 0.2);
            const x = (i % 2 === 0) ? -size * 0.25 : size * 0.25;
            
            ctx.beginPath();
            ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Cicatrices/marques dangereuses (diagonales)
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.6);
        ctx.lineTo(-size * 0.1, -size * 0.3);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(size * 0.3, -size * 0.4);
        ctx.lineTo(size * 0.15, -size * 0.1);
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }

    drawTentacles(ctx, size) {
        // VUE DE FACE - Tentacules qui partent vers l'avant et les côtés
        for (let i = 0; i < this.tentacles.length; i++) {
            const tentacle = this.tentacles[i];
            const baseAngle = tentacle.baseAngle;
            
            ctx.strokeStyle = this.config.tentacleColor;
            ctx.lineWidth = size * 0.15;
            ctx.lineCap = 'round';
            
            // Position de départ (depuis le bas du corps)
            const startX = Math.cos(baseAngle) * size * 0.5;
            const startY = size * 0.7;  // Bas du corps
            
            let x = startX;
            let y = startY;
            let lastX = x;
            let lastY = y;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            // Segments du tentacule (descendent vers l'avant)
            for (let j = 1; j <= tentacle.segments; j++) {
                const segmentProgress = j / tentacle.segments;
                const wave = Math.sin(this.animationTime * 2 + tentacle.waveOffset + j * 0.5) * size * 0.2;
                
                // Descente vers l'avant (vers le bas de l'écran)
                const distance = size * tentacle.length * segmentProgress;
                
                x = startX + Math.cos(baseAngle) * wave;
                y = startY + distance;
                
                lastX = x;
                lastY = y;
                
                ctx.lineTo(x, y);
                ctx.lineWidth = size * 0.15 * (1 - segmentProgress * 0.5);
            }
            
            ctx.stroke();
            
            // Ventouses sur le tentacule
            ctx.fillStyle = this.config.bodyColor;
            for (let j = 1; j < tentacle.segments; j++) {
                const segmentProgress = j / tentacle.segments;
                const wave = Math.sin(this.animationTime * 2 + tentacle.waveOffset + j * 0.5) * size * 0.2;
                const distance = size * tentacle.length * segmentProgress;
                
                const sX = startX + Math.cos(baseAngle) * wave;
                const sY = startY + distance;
                
                ctx.beginPath();
                ctx.arc(sX, sY, size * 0.06 * (1 - segmentProgress * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }
            
            // CROCHET LASER à l'extrémité du tentacule
            this.drawLaserClaw(ctx, lastX, lastY, size * 0.3, baseAngle);
        }
    }

    drawLaserClaw(ctx, x, y, clawSize, angle) {
        // CROCHET LASER énergétique
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);  // Orientation du crochet
        
        // Glow laser
        ctx.shadowColor = this.config.laserColor;
        ctx.shadowBlur = 15;
        
        // Base du crochet (articulation)
        ctx.fillStyle = this.config.missileColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, clawSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Crochets laser (3 griffes)
        ctx.strokeStyle = this.config.laserColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        const clawAngle = Math.sin(this.animationTime * 3) * 0.3;  // Animation ouverture/fermeture
        
        // Griffe gauche
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos(-0.5 - clawAngle) * clawSize,
            Math.sin(-0.5 - clawAngle) * clawSize
        );
        ctx.stroke();
        
        // Griffe centrale
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, clawSize);
        ctx.stroke();
        
        // Griffe droite
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
            Math.cos(0.5 + clawAngle) * clawSize,
            Math.sin(0.5 + clawAngle) * clawSize
        );
        ctx.stroke();
        
        // Points lumineux aux extrémités
        ctx.fillStyle = this.config.laserColor;
        ctx.globalAlpha = 0.8 + Math.sin(this.animationTime * 5) * 0.2;
        
        ctx.beginPath();
        ctx.arc(
            Math.cos(-0.5 - clawAngle) * clawSize,
            Math.sin(-0.5 - clawAngle) * clawSize,
            clawSize * 0.15,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(0, clawSize, clawSize * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
            Math.cos(0.5 + clawAngle) * clawSize,
            Math.sin(0.5 + clawAngle) * clawSize,
            clawSize * 0.15,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawRocket(ctx, size) {
        // FUSÉE/MISSILE SUR LE VENTRE
        const rocketY = size * 0.5;
        const rocketSize = size * 0.4;
        
        // Glow de danger
        ctx.shadowColor = this.config.flameColor;
        ctx.shadowBlur = 20 * this.rocketPulse;
        
        // Corps de la fusée
        ctx.fillStyle = this.config.missileColor;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Corps cylindrique
        ctx.fillRect(-rocketSize * 0.3, rocketY - rocketSize * 0.2, rocketSize * 0.6, rocketSize * 0.8);
        ctx.strokeRect(-rocketSize * 0.3, rocketY - rocketSize * 0.2, rocketSize * 0.6, rocketSize * 0.8);
        
        // Ogive (pointe)
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(0, rocketY - rocketSize * 0.5);
        ctx.lineTo(-rocketSize * 0.3, rocketY - rocketSize * 0.2);
        ctx.lineTo(rocketSize * 0.3, rocketY - rocketSize * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Ailerons
        ctx.fillStyle = '#1a1a1a';
        
        // Aileron gauche
        ctx.beginPath();
        ctx.moveTo(-rocketSize * 0.3, rocketY + rocketSize * 0.4);
        ctx.lineTo(-rocketSize * 0.6, rocketY + rocketSize * 0.6);
        ctx.lineTo(-rocketSize * 0.3, rocketY + rocketSize * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Aileron droit
        ctx.beginPath();
        ctx.moveTo(rocketSize * 0.3, rocketY + rocketSize * 0.4);
        ctx.lineTo(rocketSize * 0.6, rocketY + rocketSize * 0.6);
        ctx.lineTo(rocketSize * 0.3, rocketY + rocketSize * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Flamme du propulseur
        this.drawRocketFlame(ctx, rocketSize, rocketY + rocketSize * 0.6);
        
        // Symbole de danger sur la fusée
        ctx.fillStyle = '#ffff00';
        ctx.font = `bold ${size * 0.15}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠', 0, rocketY + rocketSize * 0.1);
    }

    drawRocketFlame(ctx, rocketSize, flameY) {
        // Flamme animée du propulseur
        const flameLength = rocketSize * 0.4 * this.rocketFlame;
        
        // Gradient de flamme
        const gradient = ctx.createLinearGradient(0, flameY, 0, flameY + flameLength);
        gradient.addColorStop(0, '#ff4400');
        gradient.addColorStop(0.5, '#ff8800');
        gradient.addColorStop(1, 'rgba(255, 136, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-rocketSize * 0.2, flameY);
        ctx.lineTo(-rocketSize * 0.1, flameY + flameLength);
        ctx.lineTo(0, flameY + flameLength * 1.2);
        ctx.lineTo(rocketSize * 0.1, flameY + flameLength);
        ctx.lineTo(rocketSize * 0.2, flameY);
        ctx.closePath();
        ctx.fill();
        
        // Noyau brillant
        ctx.fillStyle = '#ffff00';
        ctx.globalAlpha = this.rocketFlame;
        ctx.beginPath();
        ctx.arc(0, flameY + flameLength * 0.3, rocketSize * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawEyes(ctx, size) {
        // Yeux rouges dangereux
        if (this.eyeBlink === 0) return; // Clignement
        
        ctx.fillStyle = this.config.eyeColor;
        ctx.shadowColor = this.config.eyeColor;
        ctx.shadowBlur = 15;
        
        // Œil gauche
        ctx.beginPath();
        ctx.arc(-size * 0.25, -size * 0.15, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Œil droit
        ctx.beginPath();
        ctx.arc(size * 0.25, -size * 0.15, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Pupilles verticales (dangereux)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-size * 0.25, -size * 0.15, size * 0.04, size * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(size * 0.25, -size * 0.15, size * 0.04, size * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGlow(ctx, size) {
        // Effet de glow violet autour du Kraken
        ctx.strokeStyle = this.config.glowColor;
        ctx.shadowColor = this.config.glowColor;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.3 + Math.sin(this.animationTime * 3) * 0.1;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}
