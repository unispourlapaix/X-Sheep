// VisualBoss.js - Rendu géométrique animé des boss
export class VisualBoss {
    constructor() {
        this.animationTime = 0;
    }
    
    update() {
        this.animationTime += 0.05;
    }
    
    /**
     * Dessine un boss avec des formes géométriques animées
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Object} boss - Objet boss avec {id, x, y, size, color, health, maxHealth}
     */
    render(ctx, boss) {
        ctx.save();
        
        const pulse = Math.sin(this.animationTime * 2) * 0.1 + 1;
        
        switch(boss.id) {
            case 'whale':
                this.drawWhale(ctx, boss, pulse);
                break;
            case 'pacman':
                this.drawPacman(ctx, boss, pulse);
                break;
            case 'dragon':
                this.drawDragon(ctx, boss, pulse);
                break;
            case 'ufo':
                this.drawUFO(ctx, boss, pulse);
                break;
            case 'shark':
                this.drawShark(ctx, boss, pulse);
                break;
            case 'robot':
                this.drawRobot(ctx, boss, pulse);
                break;
        }
        
        ctx.restore();
    }
    
    drawWhale(ctx, boss, pulse) {
        // Corps ovale noir (baleine radioactive)
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(boss.x, boss.y, boss.size * 0.6 * pulse, boss.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Insigne radioactif sur le corps
        ctx.save();
        ctx.fillStyle = '#FFFF00';
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(boss.x - boss.size * 0.2, boss.y, boss.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Symbole radioactif
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(boss.x - boss.size * 0.2, boss.y, boss.size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // 3 pales de radiation
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2 / 3) + this.animationTime;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(boss.x - boss.size * 0.2, boss.y);
            ctx.arc(boss.x - boss.size * 0.2, boss.y, boss.size * 0.12, angle - 0.3, angle + 0.3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        
        // Nageoire noire
        const tailWave = Math.sin(this.animationTime * 3) * 10;
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(boss.x - boss.size * 0.5, boss.y);
        ctx.lineTo(boss.x - boss.size * 0.7, boss.y + tailWave);
        ctx.lineTo(boss.x - boss.size * 0.5, boss.y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Yeux rouges lumineux
        ctx.fillStyle = '#FF0000';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(boss.x + boss.size * 0.3, boss.y - boss.size * 0.1, 10 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupille rouge plus foncée
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(boss.x + boss.size * 0.3, boss.y - boss.size * 0.1, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Bouche avec bave verte
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(boss.x + boss.size * 0.4, boss.y + boss.size * 0.1, boss.size * 0.15, 0, Math.PI);
        ctx.stroke();
        
        // Bave verte qui coule
        ctx.fillStyle = '#00FF00';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 10;
        const drip = Math.sin(this.animationTime * 2) * 5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(
                boss.x + boss.size * 0.35 + i * 10, 
                boss.y + boss.size * 0.25 + drip, 
                3, 
                8, 
                0, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        
        // Jet de liquide noir radioactif en haut de la tête (animé)
        if (pulse > 1.02) {
            // Liquide noir
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 8;
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(boss.x - boss.size * 0.1, boss.y - boss.size * 0.4);
            ctx.lineTo(boss.x - boss.size * 0.1, boss.y - boss.size * 0.8);
            ctx.stroke();
            
            // Gouttes toxiques
            ctx.fillStyle = '#000000';
            for (let i = 0; i < 5; i++) {
                const dropOffset = (this.animationTime * 2 + i) % 3;
                ctx.beginPath();
                ctx.arc(
                    boss.x - boss.size * 0.1 + (Math.random() - 0.5) * 10,
                    boss.y - boss.size * 0.4 - dropOffset * 20,
                    4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            ctx.shadowBlur = 0;
        }
    }
    
    drawPacman(ctx, boss, pulse) {
        // Corps de pieuvre alien (dôme violet futuriste)
        const gradient = ctx.createRadialGradient(boss.x, boss.y - boss.size * 0.2, 0, boss.x, boss.y - boss.size * 0.2, boss.size * 0.5);
        gradient.addColorStop(0, '#CC66FF');
        gradient.addColorStop(0.5, boss.color);
        gradient.addColorStop(1, '#6600CC');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        
        // Dôme principal
        ctx.beginPath();
        ctx.ellipse(boss.x, boss.y - boss.size * 0.15, boss.size * 0.4 * pulse, boss.size * 0.3 * pulse, 0, Math.PI, 0, true);
        ctx.fill();
        ctx.stroke();
        
        // Lignes bioluminescentes sur le corps
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;
        for (let i = 0; i < 5; i++) {
            const y = boss.y - boss.size * 0.35 + i * boss.size * 0.15;
            ctx.beginPath();
            ctx.moveTo(boss.x - boss.size * 0.3, y);
            ctx.lineTo(boss.x + boss.size * 0.3, y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        
        // 3 tentacules longues et filantes
        const tentacles = [
            { angle: -0.3, phase: 0 },
            { angle: 0, phase: 2 },
            { angle: 0.3, phase: 4 }
        ];
        
        tentacles.forEach(tent => {
            ctx.strokeStyle = boss.color;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            
            // Gradient pour effet filant
            const segments = 15;
            for (let i = 0; i < segments; i++) {
                const t = i / segments;
                const length = boss.size * 0.1 * i;
                const wave = Math.sin(this.animationTime * 4 + tent.phase + i * 0.3) * 15;
                const x = boss.x - length * Math.cos(tent.angle);
                const y = boss.y + boss.size * 0.1 + length * Math.sin(tent.angle) + wave;
                
                // Alpha décroissant pour effet filant
                const alpha = 1 - t * 0.7;
                ctx.strokeStyle = `rgba(153, 51, 255, ${alpha})`;
                
                if (i > 0) {
                    const prevLength = boss.size * 0.1 * (i - 1);
                    const prevWave = Math.sin(this.animationTime * 4 + tent.phase + (i - 1) * 0.3) * 15;
                    const prevX = boss.x - prevLength * Math.cos(tent.angle);
                    const prevY = boss.y + boss.size * 0.1 + prevLength * Math.sin(tent.angle) + prevWave;
                    
                    ctx.lineWidth = 8 * (1 - t * 0.6);
                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                
                // Ventouses lumineuses sur les tentacules
                if (i % 3 === 0 && i > 0) {
                    ctx.fillStyle = '#00FFFF';
                    ctx.shadowColor = '#00FFFF';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(x, y, 4 * (1 - t * 0.5), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        });
        
        // Yeux aliens (multiples)
        const eyePositions = [
            { x: -0.15, y: -0.2, size: 12 },
            { x: 0.15, y: -0.2, size: 12 },
            { x: -0.08, y: -0.1, size: 8 },
            { x: 0.08, y: -0.1, size: 8 }
        ];
        
        eyePositions.forEach(eye => {
            // Blanc de l'œil
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(boss.x + boss.size * eye.x, boss.y + boss.size * eye.y, eye.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Iris alien (vert lumineux)
            const irisPulse = Math.sin(this.animationTime * 3) * 0.2 + 0.8;
            ctx.fillStyle = `rgba(0, 255, 100, ${irisPulse})`;
            ctx.shadowColor = '#00FF64';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(boss.x + boss.size * eye.x, boss.y + boss.size * eye.y, eye.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupille
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(boss.x + boss.size * eye.x, boss.y + boss.size * eye.y, eye.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Bouche alien (mandibules)
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        const mouthOpen = Math.sin(this.animationTime * 2) * 5;
        ctx.beginPath();
        ctx.moveTo(boss.x - boss.size * 0.1, boss.y + boss.size * 0.05);
        ctx.quadraticCurveTo(boss.x, boss.y + boss.size * 0.1 + mouthOpen, boss.x + boss.size * 0.1, boss.y + boss.size * 0.05);
        ctx.stroke();
        
        // Antennes futuristes
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 15;
        
        const antennaWave = Math.sin(this.animationTime * 3) * 10;
        // Antenne gauche
        ctx.beginPath();
        ctx.moveTo(boss.x - boss.size * 0.25, boss.y - boss.size * 0.35);
        ctx.lineTo(boss.x - boss.size * 0.3, boss.y - boss.size * 0.5 + antennaWave);
        ctx.stroke();
        
        // Antenne droite
        ctx.beginPath();
        ctx.moveTo(boss.x + boss.size * 0.25, boss.y - boss.size * 0.35);
        ctx.lineTo(boss.x + boss.size * 0.3, boss.y - boss.size * 0.5 - antennaWave);
        ctx.stroke();
        
        // Boules lumineuses aux extrémités
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(boss.x - boss.size * 0.3, boss.y - boss.size * 0.5 + antennaWave, 5, 0, Math.PI * 2);
        ctx.arc(boss.x + boss.size * 0.3, boss.y - boss.size * 0.5 - antennaWave, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    drawDragon(ctx, boss, pulse) {
        // Corps de serpent long et ondulant (segments)
        const segments = 12;
        const segmentLength = boss.size * 0.15;
        const amplitude = Math.sin(this.animationTime * 2) * 20;
        
        ctx.fillStyle = boss.color; // Marron noir
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Dessiner le corps segment par segment
        for (let i = segments; i >= 0; i--) {
            const x = boss.x - i * segmentLength;
            const y = boss.y + Math.sin(this.animationTime * 3 + i * 0.5) * amplitude;
            const radius = boss.size * 0.15 * (1 - i / segments * 0.3); // Plus fin vers la queue
            
            // Segment du corps
            ctx.fillStyle = i % 2 === 0 ? boss.color : '#2B1810'; // Alternance de teintes
            ctx.beginPath();
            ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Écailles sur certains segments
            if (i % 3 === 0 && i > 0) {
                ctx.fillStyle = '#1A0F0A';
                ctx.beginPath();
                ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Tête du serpent (plus large)
        const headX = boss.x;
        const headY = boss.y + Math.sin(this.animationTime * 3) * amplitude;
        
        // Forme de la tête (ovale)
        ctx.fillStyle = boss.color;
        ctx.beginPath();
        ctx.ellipse(headX, headY, boss.size * 0.25 * pulse, boss.size * 0.18 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Yeux verts lumineux
        const eyeGlow = Math.sin(this.animationTime * 4) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 255, 0, ${eyeGlow})`;
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 20;
        
        // Œil gauche
        ctx.beginPath();
        ctx.ellipse(headX + boss.size * 0.08, headY - boss.size * 0.08, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Œil droit
        ctx.beginPath();
        ctx.ellipse(headX + boss.size * 0.08, headY + boss.size * 0.08, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilles fendues verticales (comme un serpent)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.fillRect(headX + boss.size * 0.08 - 1, headY - boss.size * 0.08 - 8, 2, 16);
        ctx.fillRect(headX + boss.size * 0.08 - 1, headY + boss.size * 0.08 - 8, 2, 16);
        
        // Narines
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(headX + boss.size * 0.2, headY - boss.size * 0.05, 3, 0, Math.PI * 2);
        ctx.arc(headX + boss.size * 0.2, headY + boss.size * 0.05, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Langue fourchue qui sort (animée)
        const tongueOut = Math.abs(Math.sin(this.animationTime * 5));
        if (tongueOut > 0.3) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 3;
            
            // Base de la langue
            const tongueLength = boss.size * 0.3 * tongueOut;
            ctx.beginPath();
            ctx.moveTo(headX + boss.size * 0.25, headY);
            ctx.lineTo(headX + boss.size * 0.25 + tongueLength, headY);
            ctx.stroke();
            
            // Fourche de la langue
            ctx.lineWidth = 2;
            const forkX = headX + boss.size * 0.25 + tongueLength;
            ctx.beginPath();
            ctx.moveTo(forkX, headY);
            ctx.lineTo(forkX + 10, headY - 8);
            ctx.moveTo(forkX, headY);
            ctx.lineTo(forkX + 10, headY + 8);
            ctx.stroke();
        }
        
        // Crocs venimeux
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX + boss.size * 0.15, headY - boss.size * 0.02);
        ctx.lineTo(headX + boss.size * 0.18, headY + boss.size * 0.08);
        ctx.moveTo(headX + boss.size * 0.15, headY + boss.size * 0.02);
        ctx.lineTo(headX + boss.size * 0.18, headY - boss.size * 0.08);
        ctx.stroke();
        
        // Goutte de venin
        if (tongueOut > 0.7) {
            ctx.fillStyle = '#00FF00';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(headX + boss.size * 0.18, headY + boss.size * 0.12, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    drawUFO(ctx, boss, pulse) {
        const hover = Math.sin(this.animationTime * 2) * 10;
        
        // Dôme vert
        ctx.fillStyle = boss.color;
        ctx.beginPath();
        ctx.ellipse(boss.x, boss.y + hover, boss.size * 0.4, boss.size * 0.2, 0, Math.PI, 0, true);
        ctx.fill();
        
        // Base métallique
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.ellipse(boss.x, boss.y + boss.size * 0.1 + hover, boss.size * 0.5 * pulse, boss.size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Lumières clignotantes
        const lights = [-0.3, 0, 0.3];
        lights.forEach((offset, i) => {
            if ((this.animationTime * 5 + i) % 2 < 1) {
                ctx.fillStyle = i % 2 === 0 ? '#FF0000' : '#00FF00';
                ctx.beginPath();
                ctx.arc(boss.x + boss.size * offset, boss.y + boss.size * 0.1 + hover, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Rayon tracteur animé
        if (pulse > 1.05) {
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.moveTo(boss.x, boss.y + boss.size * 0.2 + hover);
            ctx.lineTo(boss.x, boss.y + boss.size * 0.5 + hover);
            ctx.stroke();
        }
    }
    
    drawShark(ctx, boss, pulse) {
        // Corps gris bleuté
        ctx.fillStyle = boss.color;
        ctx.beginPath();
        ctx.moveTo(boss.x + boss.size * 0.4, boss.y);
        ctx.lineTo(boss.x - boss.size * 0.4, boss.y - boss.size * 0.2);
        ctx.lineTo(boss.x - boss.size * 0.5, boss.y);
        ctx.lineTo(boss.x - boss.size * 0.4, boss.y + boss.size * 0.2);
        ctx.closePath();
        ctx.fill();
        
        // Nageoire dorsale
        ctx.beginPath();
        ctx.moveTo(boss.x, boss.y - boss.size * 0.2);
        ctx.lineTo(boss.x - boss.size * 0.1, boss.y - boss.size * 0.4);
        ctx.lineTo(boss.x + boss.size * 0.1, boss.y - boss.size * 0.2);
        ctx.closePath();
        ctx.fill();
        
        // Queue animée
        const tailSwing = Math.sin(this.animationTime * 4) * 15;
        ctx.beginPath();
        ctx.moveTo(boss.x - boss.size * 0.5, boss.y);
        ctx.lineTo(boss.x - boss.size * 0.7, boss.y + tailSwing);
        ctx.lineTo(boss.x - boss.size * 0.6, boss.y);
        ctx.closePath();
        ctx.fill();
        
        // Œil
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(boss.x + boss.size * 0.2, boss.y - boss.size * 0.05, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(boss.x + boss.size * 0.2, boss.y - boss.size * 0.05, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Dents
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const x = boss.x + boss.size * 0.3 - i * 8;
            ctx.beginPath();
            ctx.moveTo(x, boss.y);
            ctx.lineTo(x - 3, boss.y + 5);
            ctx.lineTo(x + 3, boss.y + 5);
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    drawRobot(ctx, boss, pulse) {
        // Tête carrée métallique
        ctx.fillStyle = boss.color;
        const size = boss.size * 0.4 * pulse;
        ctx.fillRect(boss.x - size / 2, boss.y - size / 2, size, size);
        
        // Contour
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 3;
        ctx.strokeRect(boss.x - size / 2, boss.y - size / 2, size, size);
        
        // Yeux lumineux (clignotants)
        const eyeBlink = Math.sin(this.animationTime * 3) > 0.9;
        if (!eyeBlink) {
            ctx.fillStyle = '#00FF00';
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
            
            ctx.fillRect(boss.x - size * 0.3, boss.y - size * 0.2, size * 0.2, size * 0.15);
            ctx.fillRect(boss.x + size * 0.1, boss.y - size * 0.2, size * 0.2, size * 0.15);
            ctx.shadowBlur = 0;
        }
        
        // Antenne
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(boss.x, boss.y - size / 2);
        ctx.lineTo(boss.x, boss.y - size / 2 - 15);
        ctx.stroke();
        
        // Ampoule clignotante
        const bulbColor = Math.sin(this.animationTime * 4) > 0 ? '#FF0000' : '#FF6600';
        ctx.fillStyle = bulbColor;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y - size / 2 - 20, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bouche rectangulaire
        ctx.fillStyle = '#404040';
        ctx.fillRect(boss.x - size * 0.3, boss.y + size * 0.1, size * 0.6, size * 0.15);
        
        // Engrenage rotatif
        ctx.save();
        ctx.translate(boss.x + size * 0.4, boss.y + size * 0.4);
        ctx.rotate(this.animationTime);
        ctx.strokeStyle = '#606060';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(i * Math.PI / 3) * 10, Math.sin(i * Math.PI / 3) * 10);
            ctx.stroke();
        }
        ctx.restore();
    }
}
