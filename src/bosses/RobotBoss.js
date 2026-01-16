// ============================================
// MODULE ROBOT ÉLECTRIQUE
// Robot domestique bipède avec tête rotative, yeux fous, étincelles
// ============================================

export default class RobotBoss {
    constructor() {
        this.config = {
            bodyColor: '#2c3e50',      // Gris métallique
            headColor: '#34495e',      // Gris plus clair
            eyeColor: '#ff3333',       // Rouge fou
            jointColor: '#1a252f',     // Noir métallique
            sparkColor: '#00d4ff',     // Cyan électrique
            glowColor: '#00d4ff',      // Bleu électrique
        };

        // Animation
        this.animationTime = 0;
        this.headRotation = 0;
        this.headRotationSpeed = 0.02;
        
        // Yeux fous
        this.eyeOffset1 = { x: 0, y: 0 };
        this.eyeOffset2 = { x: 0, y: 0 };
        this.eyeChangeTimer = 0;
        
        // Étincelles électriques
        this.sparks = [];
        this.maxSparks = 6;
        this.sparkTimer = 0;
    }

    update(time, boss) {
        this.animationTime += 0.05;
        
        // Rotation lente de la tête
        this.headRotation += this.headRotationSpeed;
        
        // Yeux fous qui bougent aléatoirement
        this.eyeChangeTimer++;
        if (this.eyeChangeTimer > 8) {
            this.eyeOffset1.x = (Math.random() - 0.5) * 0.3;
            this.eyeOffset1.y = (Math.random() - 0.5) * 0.3;
            this.eyeOffset2.x = (Math.random() - 0.5) * 0.3;
            this.eyeOffset2.y = (Math.random() - 0.5) * 0.3;
            this.eyeChangeTimer = 0;
        }
        
        // Générer des étincelles électriques
        this.sparkTimer++;
        if (this.sparkTimer > 4 && this.sparks.length < this.maxSparks) {
            // Étincelles autour du corps
            const angle = Math.random() * Math.PI * 2;
            const distance = boss.size * 0.6;
            this.sparks.push({
                x: boss.x + Math.cos(angle) * distance,
                y: boss.y + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                size: Math.random() * 3 + 2
            });
            this.sparkTimer = 0;
        }

        // Mettre à jour les étincelles
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const spark = this.sparks[i];
            spark.x += spark.vx;
            spark.y += spark.vy;
            spark.life -= 0.05;
            spark.size *= 0.95;
            
            if (spark.life <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    getHeadPosition() {
        return null; // Utiliser la position du boss
    }

    render(ctx, boss) {
        const size = boss.size;
        
        // Dessiner les étincelles d'abord
        this.drawSparks(ctx);
        
        ctx.save();
        ctx.translate(boss.x, boss.y);
        
        // Jambes (bipède)
        this.drawLegs(ctx, size);
        
        // Corps principal
        this.drawBody(ctx, size);
        
        // Bras
        this.drawArms(ctx, size);
        
        // Tête rotative
        this.drawHead(ctx, size);
        
        // Effet électrique (glow)
        this.drawElectricGlow(ctx, size);
        
        ctx.restore();
    }

    drawBody(ctx, size) {
        // Corps rectangulaire de robot domestique
        ctx.fillStyle = this.config.bodyColor;
        ctx.strokeStyle = this.config.jointColor;
        ctx.lineWidth = 3;
        
        // Corps principal
        ctx.fillRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.9);
        ctx.strokeRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.9);
        
        // Panneau de contrôle (rectangles)
        ctx.fillStyle = this.config.jointColor;
        ctx.fillRect(-size * 0.25, -size * 0.1, size * 0.5, size * 0.15);
        
        // Lumières clignotantes
        ctx.fillStyle = this.config.glowColor;
        const blink = Math.sin(this.animationTime * 3) > 0 ? 1 : 0.3;
        ctx.globalAlpha = blink;
        ctx.beginPath();
        ctx.arc(-size * 0.15, 0, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.15, 0, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawHead(ctx, size) {
        ctx.save();
        
        // Rotation lente de la tête
        ctx.rotate(this.headRotation);
        
        // Tête carrée de robot
        ctx.fillStyle = this.config.headColor;
        ctx.strokeStyle = this.config.jointColor;
        ctx.lineWidth = 3;
        
        const headY = -size * 0.7;
        ctx.fillRect(-size * 0.35, headY - size * 0.4, size * 0.7, size * 0.5);
        ctx.strokeRect(-size * 0.35, headY - size * 0.4, size * 0.7, size * 0.5);
        
        // Antenne sur la tête
        ctx.strokeStyle = this.config.jointColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, headY - size * 0.4);
        ctx.lineTo(0, headY - size * 0.6);
        ctx.stroke();
        
        // Boule d'antenne (électrique)
        ctx.fillStyle = this.config.sparkColor;
        ctx.shadowColor = this.config.sparkColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, headY - size * 0.65, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // YEUX FOUS (qui bougent aléatoirement)
        ctx.fillStyle = this.config.eyeColor;
        ctx.shadowColor = this.config.eyeColor;
        ctx.shadowBlur = 8;
        
        // Œil gauche
        ctx.beginPath();
        ctx.arc(
            -size * 0.15 + this.eyeOffset1.x * size,
            headY - size * 0.15 + this.eyeOffset1.y * size,
            size * 0.1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Œil droit
        ctx.beginPath();
        ctx.arc(
            size * 0.15 + this.eyeOffset2.x * size,
            headY - size * 0.15 + this.eyeOffset2.y * size,
            size * 0.1,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Pupilles noires (pour effet fou)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(
            -size * 0.15 + this.eyeOffset1.x * size,
            headY - size * 0.15 + this.eyeOffset1.y * size,
            size * 0.04,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
            size * 0.15 + this.eyeOffset2.x * size,
            headY - size * 0.15 + this.eyeOffset2.y * size,
            size * 0.04,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }

    drawArms(ctx, size) {
        // Bras robotiques articulés
        ctx.strokeStyle = this.config.bodyColor;
        ctx.lineWidth = size * 0.15;
        ctx.lineCap = 'round';
        
        const armWave = Math.sin(this.animationTime * 2) * 0.2;
        
        // Bras gauche
        ctx.beginPath();
        ctx.moveTo(-size * 0.4, -size * 0.1);
        ctx.lineTo(-size * 0.7, size * 0.2 + armWave);
        ctx.lineTo(-size * 0.75, size * 0.5 + armWave);
        ctx.stroke();
        
        // Main gauche
        ctx.fillStyle = this.config.jointColor;
        ctx.beginPath();
        ctx.arc(-size * 0.75, size * 0.5 + armWave, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        
        // Bras droit
        ctx.beginPath();
        ctx.moveTo(size * 0.4, -size * 0.1);
        ctx.lineTo(size * 0.7, size * 0.2 - armWave);
        ctx.lineTo(size * 0.75, size * 0.5 - armWave);
        ctx.stroke();
        
        // Main droite
        ctx.fillStyle = this.config.jointColor;
        ctx.beginPath();
        ctx.arc(size * 0.75, size * 0.5 - armWave, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawLegs(ctx, size) {
        // Jambes bipèdes robotiques
        ctx.strokeStyle = this.config.bodyColor;
        ctx.lineWidth = size * 0.18;
        ctx.lineCap = 'round';
        
        const legWave = Math.sin(this.animationTime * 1.5) * 0.1;
        
        // Jambe gauche
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, size * 0.6);
        ctx.lineTo(-size * 0.25, size * 1.0 + legWave);
        ctx.stroke();
        
        // Pied gauche
        ctx.fillStyle = this.config.jointColor;
        ctx.fillRect(-size * 0.4, size * 1.0 + legWave, size * 0.3, size * 0.15);
        
        // Jambe droite
        ctx.beginPath();
        ctx.moveTo(size * 0.2, size * 0.6);
        ctx.lineTo(size * 0.25, size * 1.0 - legWave);
        ctx.stroke();
        
        // Pied droit
        ctx.fillStyle = this.config.jointColor;
        ctx.fillRect(size * 0.1, size * 1.0 - legWave, size * 0.3, size * 0.15);
    }

    drawElectricGlow(ctx, size) {
        // Effet de glow électrique autour du robot
        ctx.shadowColor = this.config.glowColor;
        ctx.shadowBlur = 25;
        ctx.globalAlpha = 0.3 + Math.sin(this.animationTime * 4) * 0.15;
        
        ctx.strokeStyle = this.config.glowColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-size * 0.5, -size * 0.8, size, size * 2);
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    drawSparks(ctx) {
        // Dessiner les étincelles électriques
        ctx.fillStyle = this.config.sparkColor;
        ctx.shadowColor = this.config.sparkColor;
        ctx.shadowBlur = 8;
        
        for (const spark of this.sparks) {
            ctx.globalAlpha = spark.life;
            ctx.beginPath();
            ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Traînée
            ctx.strokeStyle = this.config.sparkColor;
            ctx.lineWidth = spark.size * 0.5;
            ctx.beginPath();
            ctx.moveTo(spark.x, spark.y);
            ctx.lineTo(spark.x - spark.vx * 2, spark.y - spark.vy * 2);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}
