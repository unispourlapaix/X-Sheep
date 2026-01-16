// PixelArtRenderer.js - Rendu Pixel Art HD avec contours blancs (style vitrail)
// Par Emmanuel Payet - https://www.emmanuelpayet.art/

export class PixelArtRenderer {
    /**
     * Configure le contexte pour le style pixel art HD
     */
    static setupContext(ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'square';
    }

    /**
     * Effet glow pour les éléments spirituels
     */
    static drawGlow(ctx, x, y, radius, color, intensity = 0.6) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color.replace(')', `, ${intensity})`).replace('rgb', 'rgba'));
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // ===== OBSTACLES DU SOL =====

    static drawWheelchair(ctx, x, y) {
        ctx.save();
        // Roue gauche
        ctx.fillStyle = '#4169E1';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 8, y + 28, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2F4F7F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 8, y + 28, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Roue droite
        ctx.fillStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 32, y + 28, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2F4F7F';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 32, y + 28, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Dossier
        ctx.fillStyle = '#5B9BD5';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.fillRect(x + 10, y + 8, 3, 18);
        ctx.strokeRect(x + 10, y + 8, 3, 18);
        ctx.fillRect(x + 10, y + 8, 12, 3);
        ctx.strokeRect(x + 10, y + 8, 12, 3);
        
        // Accoudoirs
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(x + 5, y + 20, 30, 3);
        ctx.strokeRect(x + 5, y + 20, 30, 3);
        ctx.restore();
    }

    static drawCarAccident(ctx, x, y) {
        ctx.save();
        // Carrosserie
        ctx.fillStyle = '#DC143C';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.fillRect(x, y + 18, 40, 15);
        ctx.strokeRect(x, y + 18, 40, 15);
        ctx.fillStyle = '#B22222';
        ctx.fillRect(x + 8, y + 8, 24, 12);
        ctx.strokeRect(x + 8, y + 8, 24, 12);
        
        // Roues
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x + 10, y + 33, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 30, y + 33, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Fissures/dégâts
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 10);
        ctx.lineTo(x + 15, y + 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + 20, y + 16);
        ctx.stroke();
        ctx.restore();
    }

    static drawCoffin(ctx, x, y) {
        ctx.save();
        // Forme cercueil
        ctx.fillStyle = '#2F4F4F';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 5);
        ctx.lineTo(x + 30, y + 5);
        ctx.lineTo(x + 35, y + 25);
        ctx.lineTo(x + 25, y + 40);
        ctx.lineTo(x + 15, y + 40);
        ctx.lineTo(x + 5, y + 25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Croix dorée
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 12);
        ctx.lineTo(x + 20, y + 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 20);
        ctx.lineTo(x + 26, y + 20);
        ctx.stroke();
        
        // Ombre intérieure
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 10);
        ctx.lineTo(x + 28, y + 10);
        ctx.lineTo(x + 32, y + 24);
        ctx.lineTo(x + 24, y + 35);
        ctx.lineTo(x + 16, y + 35);
        ctx.lineTo(x + 8, y + 24);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    static drawSafe(ctx, x, y) {
        ctx.save();
        // Corps
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.fillRect(x + 5, y + 10, 35, 30);
        ctx.strokeRect(x + 5, y + 10, 35, 30);
        ctx.fillStyle = '#A0522D';
        ctx.lineWidth = 1;
        ctx.fillRect(x + 8, y + 13, 29, 24);
        ctx.strokeRect(x + 8, y + 13, 29, 24);
        
        // Serrure/cadran
        ctx.fillStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 25, y + 25, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.arc(x + 25, y + 25, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Charnières
        ctx.fillStyle = '#696969';
        ctx.lineWidth = 1;
        ctx.fillRect(x + 6, y + 15, 3, 5);
        ctx.strokeRect(x + 6, y + 15, 3, 5);
        ctx.fillRect(x + 6, y + 30, 3, 5);
        ctx.strokeRect(x + 6, y + 30, 3, 5);
        ctx.restore();
    }

    static drawBrokenHouse(ctx, x, y) {
        ctx.save();
        // Base maison
        ctx.fillStyle = '#800080';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.fillRect(x + 5, y + 20, 35, 20);
        ctx.strokeRect(x + 5, y + 20, 35, 20);
        
        // Toit
        ctx.fillStyle = '#9932CC';
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(x + 22.5, y + 5);
        ctx.lineTo(x + 45, y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Fissure
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 22, y + 5);
        ctx.lineTo(x + 25, y + 15);
        ctx.lineTo(x + 20, y + 25);
        ctx.lineTo(x + 22, y + 40);
        ctx.stroke();
        
        // Porte
        ctx.fillStyle = '#4B0082';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.fillRect(x + 16, y + 28, 8, 12);
        ctx.strokeRect(x + 16, y + 28, 8, 12);
        
        // Fenêtre cassée
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 28, y + 25, 8, 8);
        ctx.strokeRect(x + 28, y + 25, 8, 8);
        ctx.strokeStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(x + 28, y + 25);
        ctx.lineTo(x + 36, y + 33);
        ctx.stroke();
        ctx.restore();
    }

    // ===== OBSTACLES DU CIEL =====

    static drawDeath(ctx, x, y) {
        ctx.save();
        // Crâne
        ctx.fillStyle = '#EFEFEF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 20, 12, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Yeux
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(x + 15, y + 18, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 25, y + 18, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nez
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 22);
        ctx.lineTo(x + 18, y + 26);
        ctx.lineTo(x + 22, y + 26);
        ctx.closePath();
        ctx.fill();
        
        // Mâchoire
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.fillRect(x + 14, y + 28, 4, 3);
        ctx.strokeRect(x + 14, y + 28, 4, 3);
        ctx.fillRect(x + 18, y + 28, 4, 3);
        ctx.strokeRect(x + 18, y + 28, 4, 3);
        ctx.fillRect(x + 22, y + 28, 4, 3);
        ctx.strokeRect(x + 22, y + 28, 4, 3);
        ctx.restore();
    }

    static drawCancerRibbon(ctx, x, y) {
        ctx.save();
        // Ruban rose
        ctx.fillStyle = '#FF1493';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 10);
        ctx.quadraticCurveTo(x + 20, y + 15, x + 15, y + 30);
        ctx.quadraticCurveTo(x + 10, y + 25, x + 15, y + 10);
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 25, y + 10);
        ctx.quadraticCurveTo(x + 20, y + 15, x + 25, y + 30);
        ctx.quadraticCurveTo(x + 30, y + 25, x + 25, y + 10);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(x + 20, y + 15, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    static drawNuclear(ctx, x, y) {
        ctx.save();
        // Cercle principal
        ctx.fillStyle = '#32CD32';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Centre
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Pales radiations
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 20);
        ctx.lineTo(x + 20, y + 6);
        ctx.lineTo(x + 14, y + 12);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 20);
        ctx.lineTo(x + 33, y + 28);
        ctx.lineTo(x + 28, y + 22);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 20);
        ctx.lineTo(x + 7, y + 28);
        ctx.lineTo(x + 12, y + 22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    static drawMeteor(ctx, x, y) {
        ctx.save();
        // Flammes
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 15);
        ctx.quadraticCurveTo(x + 8, y + 10, x + 12, y + 8);
        ctx.stroke();
        
        ctx.strokeStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 20);
        ctx.quadraticCurveTo(x + 5, y + 18, x + 8, y + 15);
        ctx.stroke();
        
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 25);
        ctx.quadraticCurveTo(x + 10, y + 23, x + 12, y + 20);
        ctx.stroke();
        
        // Roche
        ctx.fillStyle = '#FF6347';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 25, y + 20, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(x + 22, y + 18, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 28, y + 23, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawAnger(ctx, x, y) {
        ctx.save();
        // Visage rouge
        ctx.fillStyle = '#FF4500';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Sourcils froncés
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 14);
        ctx.lineTo(x + 16, y + 16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 28, y + 14);
        ctx.lineTo(x + 24, y + 16);
        ctx.stroke();
        
        // Yeux en colère
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 14, y + 18, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 26, y + 18, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bouche furieuse
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 26);
        ctx.quadraticCurveTo(x + 20, y + 30, x + 28, y + 26);
        ctx.stroke();
        ctx.restore();
    }

    static drawWolf(ctx, x, y) {
        ctx.save();
        // Tête
        ctx.fillStyle = '#696969';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 22, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Oreilles
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 15);
        ctx.lineTo(x + 12, y + 8);
        ctx.lineTo(x + 15, y + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 15);
        ctx.lineTo(x + 28, y + 8);
        ctx.lineTo(x + 25, y + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Museau
        ctx.fillStyle = '#505050';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 26, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Yeux rouges menaçants
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x + 16, y + 20, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 24, y + 20, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Crocs
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 28);
        ctx.lineTo(x + 15, y + 32);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 25, y + 28);
        ctx.lineTo(x + 25, y + 32);
        ctx.stroke();
        ctx.restore();
    }

    static drawBlackSheep(ctx, x, y) {
        ctx.save();
        
        // Animation de balancement des pieds
        const time = Date.now() * 0.005;
        const swingLeft = Math.sin(time) * 3;
        const swingRight = Math.sin(time + Math.PI) * 3; // Opposé
        
        // Inverser pour qu'il regarde vers la gauche
        ctx.translate(x + 17.5, y + 20);
        ctx.scale(-1, 1);
        ctx.translate(-17.5, -20);
        
        // Corps noir
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(22, 25, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Tête
        ctx.beginPath();
        ctx.arc(32, 18, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Yeux tristes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(30, 17, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(35, 17, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pattes avec balancement
        ctx.fillStyle = '#333';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        
        // Patte gauche (balance)
        ctx.fillRect(16 + swingLeft, 32, 3, 8);
        ctx.strokeRect(16 + swingLeft, 32, 3, 8);
        
        // Patte droite (balance en opposition)
        ctx.fillRect(27 + swingRight, 32, 3, 8);
        ctx.strokeRect(27 + swingRight, 32, 3, 8);
        
        ctx.restore();
    }

    static drawAddictionBox(ctx, x, y) {
        ctx.save();
        // Boîte
        ctx.fillStyle = '#4B0082';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.fillRect(x + 8, y + 15, 25, 25);
        ctx.strokeRect(x + 8, y + 15, 25, 25);
        ctx.fillStyle = '#6A5ACD';
        ctx.lineWidth = 1;
        ctx.fillRect(x + 11, y + 18, 19, 19);
        ctx.strokeRect(x + 11, y + 18, 19, 19);
        
        // Chaînes
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.arc(x + 12, y + 20, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 30, y + 20, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.strokeStyle = '#696969';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 20);
        ctx.lineTo(x + 30, y + 20);
        ctx.stroke();
        
        // Croix interdiction
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 22);
        ctx.lineTo(x + 27, y + 34);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 27, y + 22);
        ctx.lineTo(x + 15, y + 34);
        ctx.stroke();
        ctx.restore();
    }

    // ===== POWER-UPS SPIRITUELS =====

    static drawCourage(ctx, x, y) {
        ctx.save();
        // Glow doré
        this.drawGlow(ctx, x, y, 25, 'rgb(255,215,0)', 0.6);
        
        // Cristal doré
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Symbole muscle
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 2);
        ctx.quadraticCurveTo(x - 2, y - 5, x, y - 2);
        ctx.quadraticCurveTo(x + 2, y - 5, x + 5, y - 2);
        ctx.stroke();
        
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x, y + 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawForce(ctx, x, y) {
        ctx.save();
        // Glow rouge
        this.drawGlow(ctx, x, y, 25, 'rgb(255,99,71)', 0.6);
        
        // Cristal rouge
        ctx.fillStyle = '#FF6347';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Éclair
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'bevel';
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 10);
        ctx.lineTo(x - 4, y);
        ctx.lineTo(x + 2, y);
        ctx.lineTo(x - 2, y + 10);
        ctx.stroke();
        ctx.restore();
    }

    static drawPatience(ctx, x, y) {
        ctx.save();
        // Glow bleu
        this.drawGlow(ctx, x, y, 25, 'rgb(135,206,235)', 0.6);
        
        // Cristal bleu
        ctx.fillStyle = '#87CEEB';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Horloge
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4, y + 2);
        ctx.stroke();
        ctx.restore();
    }

    static drawResilience(ctx, x, y) {
        ctx.save();
        // Glow vert
        this.drawGlow(ctx, x, y, 25, 'rgb(50,205,50)', 0.6);
        
        // Cristal vert
        ctx.fillStyle = '#32CD32';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Bouclier
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 6, y - 4);
        ctx.lineTo(x + 6, y + 4);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x - 6, y + 4);
        ctx.lineTo(x - 6, y - 4);
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.lineTo(x + 4, y);
        ctx.stroke();
        ctx.restore();
    }

    static drawLiberte(ctx, x, y) {
        ctx.save();
        // Glow bleu clair
        this.drawGlow(ctx, x, y, 25, 'rgb(135,206,250)', 0.6);
        
        // Cristal blanc/bleu
        ctx.fillStyle = '#87CEFA';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Colombe simple
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 2);
        ctx.quadraticCurveTo(x - 10, y - 2, x - 12, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 6, y - 2);
        ctx.quadraticCurveTo(x + 10, y - 2, x + 12, y);
        ctx.stroke();
        ctx.restore();
    }

    static drawAgir(ctx, x, y) {
        ctx.save();
        // Glow orange
        this.drawGlow(ctx, x, y, 25, 'rgb(255,69,0)', 0.6);
        
        // Cristal orange
        ctx.fillStyle = '#FF4500';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Fusée
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x - 4, y + 2);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 4, y + 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x - 2, y + 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 2, y + 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawSeBattre(ctx, x, y) {
        ctx.save();
        // Glow rouge foncé
        this.drawGlow(ctx, x, y, 25, 'rgb(139,0,0)', 0.6);
        
        // Cristal rouge foncé
        ctx.fillStyle = '#8B0000';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Épée
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x - 2, y - 8, 4, 16);
        ctx.strokeRect(x - 2, y - 8, 4, 16);
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x - 6, y - 10, 12, 3);
        ctx.strokeRect(x - 6, y - 10, 12, 3);
        
        ctx.beginPath();
        ctx.arc(x, y - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawPerseverer(ctx, x, y) {
        ctx.save();
        // Glow bleu foncé
        this.drawGlow(ctx, x, y, 25, 'rgb(30,144,255)', 0.6);
        
        // Cristal bleu foncé
        ctx.fillStyle = '#1E90FF';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Montagne
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 8, y + 8);
        ctx.lineTo(x, y - 8);
        ctx.lineTo(x + 8, y + 8);
        ctx.stroke();
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y - 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    static drawEtoileEspoir(ctx, x, y) {
        ctx.save();
        // Glow doré intense
        this.drawGlow(ctx, x, y, 30, 'rgb(255,215,0)', 0.8);
        
        // Étoile dorée extérieure
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const points = [[0,-10], [3,-2], [12,-2], [5,4], [8,12], [0,7], [-8,12], [-5,4], [-12,-2], [-3,-2]];
        ctx.moveTo(x + points[0][0], y + points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(x + points[i][0], y + points[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Étoile orange intérieure
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        const innerPoints = [[0,-3], [2,-1], [7,-1], [3,2], [5,7], [0,4], [-5,7], [-3,2], [-7,-1], [-2,-1]];
        ctx.moveTo(x + innerPoints[0][0], y + innerPoints[0][1]);
        for (let i = 1; i < innerPoints.length; i++) {
            ctx.lineTo(x + innerPoints[i][0], y + innerPoints[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // ===== MÉTHODE GÉNÉRIQUE POUR OBSTACLES =====

    static renderObstacle(ctx, obstacle) {
        const centerX = obstacle.x + obstacle.width / 2;
        const centerY = obstacle.y + obstacle.height / 2;

        switch (obstacle.id) {
            case 'wheelchair':
                this.drawWheelchair(ctx, obstacle.x, obstacle.y);
                break;
            case 'car_accident':
                this.drawCarAccident(ctx, obstacle.x, obstacle.y);
                break;
            case 'coffin':
                this.drawCoffin(ctx, obstacle.x, obstacle.y);
                break;
            case 'safe':
                this.drawSafe(ctx, obstacle.x, obstacle.y);
                break;
            case 'house':
                this.drawBrokenHouse(ctx, obstacle.x, obstacle.y);
                break;
            case 'wolf':
                this.drawWolf(ctx, obstacle.x, obstacle.y);
                break;
            case 'black_sheep':
                this.drawBlackSheep(ctx, obstacle.x, obstacle.y);
                break;
            case 'addiction':
                this.drawAddictionBox(ctx, obstacle.x, obstacle.y);
                break;
            case 'death':
                this.drawDeath(ctx, obstacle.x, obstacle.y);
                break;
            case 'cancer':
                this.drawCancerRibbon(ctx, obstacle.x, obstacle.y);
                break;
            case 'nuclear':
                this.drawNuclear(ctx, obstacle.x, obstacle.y);
                break;
            case 'meteor':
                this.drawMeteor(ctx, obstacle.x, obstacle.y);
                break;
            case 'anger':
                this.drawAnger(ctx, obstacle.x, obstacle.y);
                break;
            default:
                // Fallback: rendu simple avec icône seulement (sans rectangle)
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Ombre pour visibilité
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillText(obstacle.icon || '?', centerX + 2, centerY + 2);
                // Icône
                ctx.fillStyle = obstacle.color || '#666';
                ctx.fillText(obstacle.icon || '?', centerX, centerY);
                break;
        }
        
        // Afficher le texte pour les obstacles au sol et richesse
        if ((obstacle.type === 'ground' || obstacle.type === 'richness') && obstacle.text) {
            ctx.save();
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            // Contour blanc pour visibilité
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.strokeText(obstacle.text, centerX, obstacle.y - 3);
            // Texte noir
            ctx.fillStyle = '#000000';
            ctx.fillText(obstacle.text, centerX, obstacle.y - 3);
            ctx.restore();
        }
    }

    // ===== MÉTHODE GÉNÉRIQUE POUR POWER-UPS =====

    static renderPowerUp(ctx, powerUp) {
        switch (powerUp.id) {
            case 'courage':
                this.drawCourage(ctx, powerUp.x, powerUp.y);
                break;
            case 'force':
                this.drawForce(ctx, powerUp.x, powerUp.y);
                break;
            case 'patience':
                this.drawPatience(ctx, powerUp.x, powerUp.y);
                break;
            case 'resilience':
                this.drawResilience(ctx, powerUp.x, powerUp.y);
                break;
            case 'assurance':
                // Cristal violet royal avec couronne
                this.drawGlow(ctx, powerUp.x, powerUp.y, 25, 'rgb(218,160,221)', 0.6);
                ctx.fillStyle = '#DDA0DD';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Couronne simple
                ctx.fillStyle = '#FFD700';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
                    const x = powerUp.x + Math.cos(angle) * 6;
                    const y = powerUp.y + Math.sin(angle) * 6 - 3;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                }
                break;
            case 'liberte':
                this.drawLiberte(ctx, powerUp.x, powerUp.y);
                break;
            case 'controle':
                // Cristal rose avec cible
                this.drawGlow(ctx, powerUp.x, powerUp.y, 25, 'rgb(255,105,180)', 0.6);
                ctx.fillStyle = '#FF69B4';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Cible
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                for (let r = 3; r <= 9; r += 3) {
                    ctx.beginPath();
                    ctx.arc(powerUp.x, powerUp.y, r, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            case 'sagesse':
                // Cristal brun avec œil
                this.drawGlow(ctx, powerUp.x, powerUp.y, 25, 'rgb(184,134,11)', 0.6);
                ctx.fillStyle = '#B8860B';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Œil
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.ellipse(powerUp.x, powerUp.y, 6, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'gestion':
                // Cristal indigo avec balance
                this.drawGlow(ctx, powerUp.x, powerUp.y, 25, 'rgb(75,0,130)', 0.6);
                ctx.fillStyle = '#4B0082';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Balance simple
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(powerUp.x - 8, powerUp.y);
                ctx.lineTo(powerUp.x + 8, powerUp.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(powerUp.x, powerUp.y - 6);
                ctx.lineTo(powerUp.x, powerUp.y + 6);
                ctx.stroke();
                break;
            case 'agir':
                this.drawAgir(ctx, powerUp.x, powerUp.y);
                break;
            case 'se_battre':
                this.drawSeBattre(ctx, powerUp.x, powerUp.y);
                break;
            case 'ne_pas_abandonner':
                // Cristal vert mer avec cadenas
                this.drawGlow(ctx, powerUp.x, powerUp.y, 25, 'rgb(46,139,87)', 0.6);
                ctx.fillStyle = '#2E8B57';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                // Cadenas
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(powerUp.x - 4, powerUp.y, 8, 6);
                ctx.strokeRect(powerUp.x - 4, powerUp.y, 8, 6);
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y - 2, 4, Math.PI, 0, true);
                ctx.stroke();
                break;
            case 'perseverer':
                this.drawPerseverer(ctx, powerUp.x, powerUp.y);
                break;
            case 'espoir':
                this.drawEtoileEspoir(ctx, powerUp.x, powerUp.y);
                break;
            default:
                // Fallback: cristal simple avec aura
                this.drawGlow(ctx, powerUp.x, powerUp.y, 25, 'rgb(255,215,0)', 0.6);
                ctx.fillStyle = powerUp.color || '#FFD700';
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(powerUp.x, powerUp.y, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#FFF';
                ctx.fillText(powerUp.icon || '✨', powerUp.x, powerUp.y);
                break;
        }
    }
}
