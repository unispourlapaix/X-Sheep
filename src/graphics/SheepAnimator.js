// SheepAnimator.js - Animations du mouton
import { GameConfig } from '../config/GameConfig.js';

export class SheepAnimator {
    draw(ctx, x, y, size, hairLength, state, rolling = false, hairEffect = 0) {
        ctx.save();
        
        // Si en mode roulement (handicap), faire tourner le mouton
        let rotationAngle = 0;
        if (rolling) {
            rotationAngle = (Date.now() / 100) % (Math.PI * 2); // Rotation continue
        }
        
        // Appliquer la taille (corruption par richesse) - centrer la transformation
        ctx.translate(x + 20, y + 25);
        ctx.rotate(rotationAngle);
        ctx.scale(size, size);
        
        // Aura si power-ups actifs  
        this.drawAura(ctx, 0, 0, size);
        
        // Corps du mouton (blanc) - coordonnées relatives au centre
        const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 20);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#F0F8FF');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Tête
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(15, -10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Yeux brillants d'espoir
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(12, -13, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(18, -13, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Étincelles dans les yeux
        ctx.fillStyle = GameConfig.COLORS.GOLD_LIGHT;
        ctx.beginPath();
        ctx.arc(13, -14, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(19, -14, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Mèche de cheveux (vanité de la richesse) - normale ou effet spécial
        const totalHair = hairLength + hairEffect;
        if (totalHair > 0) {
            this.drawHair(ctx, 0, 0, totalHair, hairEffect > 0);
        }
        
        // Ailes si en vol (mais pas si en mode roulement)
        if (state === 'flying' && !rolling) {
            this.drawWings(ctx, 0, 0);
        }
        
        // Pattes (cachées en mode roulement)
        if (!rolling) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10, 10);
            ctx.lineTo(-10, 20);
            ctx.moveTo(10, 10);
            ctx.lineTo(10, 20);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawAura(ctx, x, y, size) {
        // Aura divine selon size
        if (size > 1.5) {
            // Aura rouge (cupidité)
            ctx.fillStyle = 'rgba(255,0,0,0.2)';
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawHair(ctx, x, y, length, isSpecialEffect = false) {
        // Mèche en croissant/banane - courbée et moins longue
        const thickness = isSpecialEffect ? 8 : 3;
        const color = isSpecialEffect ? '#FFD700' : '#8B4513'; // Or si effet spécial
        const hairLength = length * 0.6; // Réduire la longueur (60% de l'original)
        
        ctx.save();
        
        // Dessiner la mèche courbée en forme de croissant
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(x + 15, y - 18); // Base sur la tête
        
        // Courbe en forme de banane/croissant
        ctx.bezierCurveTo(
            x + 25, y - 18 - hairLength * 0.3, // Point de contrôle 1 (vers la droite)
            x + 28, y - 18 - hairLength * 0.6, // Point de contrôle 2 (vers la droite et haut)
            x + 22, y - 18 - hairLength // Point final (revient légèrement vers le centre)
        );
        ctx.stroke();
        
        // Bout en pointe arrondie
        const endColor = isSpecialEffect ? '#FFA500' : '#654321';
        ctx.fillStyle = endColor;
        ctx.beginPath();
        ctx.arc(x + 22, y - 18 - hairLength, thickness * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawWings(ctx, x, y) {
        // Petites fusées horizontales sur le dos (en arrière)
        const time = Date.now() * 0.003; // Ralenti de 0.01 à 0.003
        
        // Fusée du haut
        ctx.save();
        ctx.translate(x - 10, y - 8);
        
        // Corps de la fusée (horizontal)
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-8, -4, 16, 8);
        
        // Embout (ogive pointant vers la droite)
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.lineTo(14, 0);
        ctx.lineTo(8, 4);
        ctx.fill();
        
        // Aileron haut
        ctx.fillStyle = '#FF6666';
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(-8, -8);
        ctx.lineTo(-4, -8);
        ctx.fill();
        
        // Aileron bas
        ctx.beginPath();
        ctx.moveTo(-4, 4);
        ctx.lineTo(-8, 8);
        ctx.lineTo(-4, 8);
        ctx.fill();
        
        // Flammes (sortant vers la gauche)
        const flameLength = 6 + Math.sin(time * 2) * 3;
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(-8, -3);
        ctx.lineTo(-8 - flameLength, 0);
        ctx.lineTo(-8, 3);
        ctx.fill();
        
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(-8 - flameLength * 0.7, 0);
        ctx.lineTo(-8, 2);
        ctx.fill();
        
        ctx.restore();
        
        // Fusée du bas
        ctx.save();
        ctx.translate(x - 10, y + 8);
        
        // Corps de la fusée (horizontal)
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-8, -4, 16, 8);
        
        // Embout (ogive pointant vers la droite)
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.lineTo(14, 0);
        ctx.lineTo(8, 4);
        ctx.fill();
        
        // Aileron haut
        ctx.fillStyle = '#FF6666';
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(-8, -8);
        ctx.lineTo(-4, -8);
        ctx.fill();
        
        // Aileron bas
        ctx.beginPath();
        ctx.moveTo(-4, 4);
        ctx.lineTo(-8, 8);
        ctx.lineTo(-4, 8);
        ctx.fill();
        
        // Flammes (sortant vers la gauche, décalées dans le temps)
        const flameLength2 = 6 + Math.sin(time * 2 + 1) * 3;
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(-8, -3);
        ctx.lineTo(-8 - flameLength2, 0);
        ctx.lineTo(-8, 3);
        ctx.fill();
        
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(-8, -2);
        ctx.lineTo(-8 - flameLength2 * 0.7, 0);
        ctx.lineTo(-8, 2);
        ctx.fill();
        
        ctx.restore();
    }
}
