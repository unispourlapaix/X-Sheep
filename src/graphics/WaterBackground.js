/**
 * WaterBackground.js - Fond aquatique nocturne avec étoiles pour le niveau 3
 */

export class WaterBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.waves = [];
        this.stars = [];
        this.moonX = canvas.width * 0.2;
        this.moonY = 80;
        this.time = 0;
        
        this.initStars();
        this.initWaves();
    }
    
    initStars() {
        // Créer des étoiles scintillantes
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.4, // 40% supérieur du ciel
                size: 1 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.01 + Math.random() * 0.02,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    initWaves() {
        // Créer plusieurs couches de vagues
        for (let i = 0; i < 3; i++) {
            this.waves.push({
                offset: 0,
                amplitude: 10 + i * 5,
                frequency: 0.02 - i * 0.005,
                speed: 1 + i * 0.5,
                y: this.canvas.height * 0.5 + i * 30,
                opacity: 0.3 - i * 0.1
            });
        }
    }
    
    update() {
        this.time += 0.02;
        
        // Animer les vagues
        this.waves.forEach(wave => {
            wave.offset += wave.speed;
        });
        
        // Animer les étoiles (scintillement)
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            star.opacity = 0.3 + Math.sin(star.twinklePhase) * 0.4;
        });
    }
    
    render(ctx) {
        // Ciel nocturne (dégradé)
        const skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.5);
        skyGradient.addColorStop(0, '#0a0e27'); // Bleu nuit très foncé
        skyGradient.addColorStop(1, '#1a2a4e'); // Bleu nuit plus clair
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.5);
        
        // Étoiles
        this.stars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.opacity;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Effet de brillance
            if (star.size > 1.5) {
                ctx.fillStyle = '#FFE6A0';
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        
        // Lune
        ctx.save();
        ctx.fillStyle = '#FFF8DC';
        ctx.shadowColor = '#FFE6A0';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(this.moonX, this.moonY, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Cratères lunaires
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#D3D3D3';
        ctx.beginPath();
        ctx.arc(this.moonX - 10, this.moonY - 8, 8, 0, Math.PI * 2);
        ctx.arc(this.moonX + 12, this.moonY + 5, 6, 0, Math.PI * 2);
        ctx.arc(this.moonX - 5, this.moonY + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Eau (dégradé)
        const waterGradient = ctx.createLinearGradient(0, this.canvas.height * 0.5, 0, this.canvas.height);
        waterGradient.addColorStop(0, '#1a3a52'); // Bleu océan foncé
        waterGradient.addColorStop(0.5, '#0d2535'); // Plus foncé au milieu
        waterGradient.addColorStop(1, '#051219'); // Très foncé en bas
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, this.canvas.height * 0.5, this.canvas.width, this.canvas.height * 0.5);
        
        // Reflet de la lune sur l'eau
        ctx.save();
        ctx.globalAlpha = 0.15;
        const moonReflectionGradient = ctx.createLinearGradient(
            this.moonX, 
            this.canvas.height * 0.5, 
            this.moonX, 
            this.canvas.height
        );
        moonReflectionGradient.addColorStop(0, '#FFE6A0');
        moonReflectionGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = moonReflectionGradient;
        ctx.fillRect(this.moonX - 30, this.canvas.height * 0.5, 60, this.canvas.height * 0.5);
        ctx.restore();
        
        // Vagues animées
        this.waves.forEach(wave => {
            ctx.save();
            ctx.globalAlpha = wave.opacity;
            ctx.strokeStyle = '#4A90A4';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x < this.canvas.width; x += 5) {
                const y = wave.y + Math.sin((x + wave.offset) * wave.frequency) * wave.amplitude;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            ctx.restore();
        });
        
        // Ligne d'horizon (séparation ciel/mer)
        ctx.strokeStyle = '#2a4a5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height * 0.5);
        ctx.lineTo(this.canvas.width, this.canvas.height * 0.5);
        ctx.stroke();
    }
}
