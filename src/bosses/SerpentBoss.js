// ============================================
// MODULE SERPENT BOSS ULTIME (ID:E-manuel)
// Boss géométrique avec segments animés, écailles octogonales,
// yeux verts lumineux, langue fourchue, crocs venimeux, sonnette dorée
// ============================================

export default class SerpentBoss {
    constructor() {
        // Configuration du serpent
        this.config = {
            segments: 12,
            headSize: 200,           // Grosse tête
            tailSize: 30,            // Queue fine
            baseColor: '#1a4d1a',    // Vert sombre venimeux
            alternateColor: '#0d260d', // Vert très sombre
            accentColor: '#CCFF00',  // Jaune-vert toxique
            warningColor: '#000000', // Noir pour les marques
            eyeColor: '#00ff41',
            tongueColor: '#ff0000',
            fangColor: '#FFD700',    // Crochets dorés
            venomColor: '#00ff41',
            rattleColor: '#FFD700',  // Sonnette dorée
            scaleSize: 25,
            animationSpeed: 0.05,
            waveAmplitude: 50,
            waveFrequency: 0.1
        };

        // Cache pré-calculé pour les octogones (optimisation)
        this.octagonCache = {
            outer: [],
            inner: []
        };

        // Pré-calculer les points d'octogone UNE SEULE FOIS
        for (let i = 0; i <= 8; i++) {
            const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
            this.octagonCache.outer.push({
                x: Math.cos(angle),
                y: Math.sin(angle)
            });
            this.octagonCache.inner.push({
                x: Math.cos(angle) * 0.6,
                y: Math.sin(angle) * 0.6
            });
        }

        this.segments = [];
        this.animationTime = 0;
        this.mode = 'traverse'; // 'traverse' ou 'boss'
        
        // Pour détecter la direction du mouvement
        this.previousBossX = 0;
        this.previousBossY = 0;
        
        // État de la tête
        this.tongueExtension = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.venomDrop = 0;
        this.eyeGlow = 0;
    }

    init(x, y, bossSize, mode = 'traverse') {
        this.segments = [];
        this.mode = mode;
        
        if (mode === 'boss') {
            // Mode BOSS : gros serpent enroulé statique
            const centerX = x;
            const centerY = y;
            const radius = bossSize * 2;
            
            for (let i = 0; i < this.config.segments; i++) {
                const progression = i / (this.config.segments - 1);
                const angle = (i / this.config.segments) * Math.PI * 4; // 2 tours
                const spiralRadius = radius * (1 - progression * 0.5);
                
                this.segments.push({
                    x: centerX + Math.cos(angle) * spiralRadius,
                    y: centerY + Math.sin(angle) * spiralRadius,
                    index: i,
                    size: bossSize * (1.5 - progression * 1.2),
                    rotation: angle,
                    offsetX: 0,
                    offsetY: 0,
                    pulseOffset: i * 0.5,
                    pulsePhase: 0,
                    rattleShake: 0,
                    baseAngle: angle,
                    baseRadius: spiralRadius
                });
            }
        } else {
            // Mode TRAVERSE : petit serpent qui traverse
            const headSize = bossSize * 1.2;
            const tailSize = bossSize * 0.25;
            const spacing = bossSize * 0.8; // Espacement entre segments
            
            for (let i = 0; i < this.config.segments; i++) {
                const progression = i / (this.config.segments - 1);
                const size = headSize - (headSize - tailSize) * progression;
                
                this.segments.push({
                    x: x + (i * spacing),  // Espacés en ligne vers la droite
                    y: y,
                    index: i,
                    size: size,
                    rotation: Math.PI, // Orientés vers la gauche
                    offsetX: 0,
                    offsetY: 0,
                    pulseOffset: i * 0.5,
                    pulsePhase: 0,
                    rattleShake: 0
                });
            }
        }
    }

    update(time, boss) {
        this.animationTime += 0.05;
        
        // Initialiser si nécessaire
        if (this.segments.length === 0) {
            this.init(boss.x, boss.y, boss.size, this.mode);
        }

        if (this.mode === 'boss') {
            // Mode BOSS : serpent enroulé statique avec pulsation
            for (let i = 0; i < this.segments.length; i++) {
                const segment = this.segments[i];
                
                // Rester au centre du boss avec légère pulsation
                const pulse = Math.sin(this.animationTime + segment.pulseOffset) * 0.05;
                const angle = segment.baseAngle + this.animationTime * 0.1;
                const radius = segment.baseRadius * (1 + pulse);
                
                segment.x = boss.x + Math.cos(angle) * radius;
                segment.y = boss.y + Math.sin(angle) * radius;
                segment.rotation = angle + Math.PI / 2;
                
                segment.pulsePhase = this.animationTime + segment.pulseOffset;
                segment.rattleShake = Math.sin(this.animationTime * 2) * 2;
            }
        } else {
            // Mode TRAVERSE : suivi en chaîne avec direction
            
            // Calculer la direction du mouvement du boss
            const movementDirX = boss.x - this.previousBossX;
            const movementDirY = boss.y - this.previousBossY;
            this.previousBossX = boss.x;
            this.previousBossY = boss.y;
            
            for (let i = 0; i < this.segments.length; i++) {
                const segment = this.segments[i];
                
                if (i === 0) {
                    // Tête suit le boss
                    const dx = boss.x - segment.x;
                    const dy = boss.y - segment.y;
                    segment.x += dx * 0.7;
                    segment.y += dy * 0.7;
                    
                    // Rotation dans le sens du mouvement
                    if (Math.abs(movementDirX) > 0.1 || Math.abs(movementDirY) > 0.1) {
                        segment.rotation = Math.atan2(movementDirY, movementDirX);
                    }
                } else {
                    // Chaque segment suit le précédent avec distance fixe
                    const prevSegment = this.segments[i - 1];
                    const dx = prevSegment.x - segment.x;
                    const dy = prevSegment.y - segment.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Distance cible entre segments
                    const targetDist = (prevSegment.size + segment.size) * 0.4;
                    
                    if (dist > 0) {
                        // Déplacer vers le segment précédent
                        const ratio = targetDist / dist;
                        segment.x = prevSegment.x - dx * ratio;
                        segment.y = prevSegment.y - dy * ratio;
                    }
                    
                    // Rotation pour regarder vers le segment précédent
                    segment.rotation = Math.atan2(dy, dx);
                }
                
                segment.offsetX = 0;
                segment.offsetY = 0;
                
                segment.pulsePhase = this.animationTime + segment.pulseOffset;
                segment.rattleShake = Math.sin(this.animationTime * 2) * 1;
            }
        }

        // Animation de la tête
        this.tongueExtension = Math.sin(this.animationTime * 0.15) * 0.5 + 0.5;
        this.venomDrop = Math.sin(this.animationTime * 0.5) * 0.5 + 0.5;
        this.eyeGlow = 0.5 + Math.sin(this.animationTime * 0.2) * 0.3;

        // Clignement des yeux
        this.blinkTimer++;
        if (this.blinkTimer > 180 && Math.random() < 0.02) {
            this.isBlinking = true;
            this.blinkTimer = 0;
        }
        if (this.blinkTimer > 10) {
            this.isBlinking = false;
        }
    }

    getHeadPosition() {
        if (this.segments.length > 0) {
            return { x: this.segments[0].x, y: this.segments[0].y };
        }
        return null;
    }

    render(ctx, boss, mode = 'traverse') {
        // Si le mode change, réinitialiser
        if (this.mode !== mode) {
            this.mode = mode;
            this.segments = [];
            this.init(boss.x, boss.y, boss.size, mode);
        }
        
        // Vérifier que les segments existent
        if (this.segments.length === 0) {
            return; // Ne rien dessiner si pas initialisé
        }

        // Dessiner les segments du plus loin au plus proche
        for (let i = this.segments.length - 1; i >= 0; i--) {
            this.drawSegment(ctx, this.segments[i]);
        }

        // Dessiner la tête en dernier (par-dessus)
        this.drawHead(ctx, this.segments[0]);
    }

    drawSegment(ctx, segment) {
        ctx.save();
        ctx.translate(segment.x + segment.offsetX, segment.y + segment.offsetY);
        ctx.rotate(segment.rotation);

        // Couleur alternée pour effet écailles venimeux
        const color = segment.index % 2 === 0 ? this.config.baseColor : this.config.alternateColor;

        // Corps du segment avec effet géométrique
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, segment.size, segment.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bandes jaunes toxiques d'avertissement (tous les 3 segments)
        if (segment.index % 3 === 1) {
            ctx.fillStyle = this.config.accentColor;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(-segment.size * 0.3, -segment.size * 0.7, segment.size * 0.6, segment.size * 1.4);
            ctx.globalAlpha = 1;
        }

        // Contour lumineux toxique
        const pulse = 0.4 + Math.sin(segment.pulsePhase) * 0.3;
        ctx.strokeStyle = `rgba(204, 255, 0, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, segment.size, segment.size * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Écailles OCTOGONALES optimisées
        if (segment.size > 15) {
            const scaleCount = Math.min(Math.floor(segment.size / 15), 5);
            for (let i = 0; i < scaleCount; i++) {
                const angle = (i * Math.PI * 2) / scaleCount;
                const sx = Math.cos(angle) * segment.size * 0.5;
                const sy = Math.sin(angle) * segment.size * 0.35;
                
                this.drawOctagonalScale(ctx, sx, sy, segment.size * 0.15);
            }
        }

        // Sonnette dorée sur la queue (dernier segment)
        if (segment.index === this.config.segments - 1) {
            this.drawRattle(ctx, segment);
        }

        ctx.restore();
    }

    drawOctagonalScale(ctx, x, y, scaleSize) {
        ctx.save();
        ctx.translate(x, y);

        // Fond de l'écaille octogonale
        ctx.fillStyle = this.config.warningColor;
        ctx.beginPath();
        for (let i = 0; i < this.octagonCache.outer.length; i++) {
            const px = this.octagonCache.outer[i].x * scaleSize;
            const py = this.octagonCache.outer[i].y * scaleSize;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Centre toxique jaune-vert de l'écaille
        ctx.fillStyle = this.config.accentColor;
        ctx.beginPath();
        for (let i = 0; i < this.octagonCache.inner.length; i++) {
            const px = this.octagonCache.inner[i].x * scaleSize;
            const py = this.octagonCache.inner[i].y * scaleSize;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Contour lumineux
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.octagonCache.outer.length; i++) {
            const px = this.octagonCache.outer[i].x * scaleSize;
            const py = this.octagonCache.outer[i].y * scaleSize;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    drawRattle(ctx, segment) {
        const rattleSize = segment.size * 0.3; // Proportionnel à la taille
        const shake = segment.rattleShake;

        // Anneaux de la sonnette
        for (let i = 0; i < 3; i++) {
            const x = -segment.size - 10 - (i * (rattleSize * 0.4));
            const y = shake * (i + 1) * 0.3;
            const radius = rattleSize - (i * (rattleSize * 0.2));
            
            // Anneau doré avec effet de profondeur
            ctx.fillStyle = this.config.rattleColor;
            ctx.strokeStyle = '#B8860B';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Reflet simple
            ctx.fillStyle = '#FFF4A3';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Crochets dorés sur la sonnette
        ctx.fillStyle = this.config.rattleColor;
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;

        // Crochet haut
        ctx.beginPath();
        ctx.moveTo(-segment.size - 20, -rattleSize + 10);
        ctx.lineTo(-segment.size - 35, -rattleSize - 5);
        ctx.lineTo(-segment.size - 25, -rattleSize - 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crochet bas
        ctx.beginPath();
        ctx.moveTo(-segment.size - 20, rattleSize - 10);
        ctx.lineTo(-segment.size - 35, rattleSize + 5);
        ctx.lineTo(-segment.size - 25, rattleSize + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawHead(ctx, segment) {
        ctx.save();
        ctx.translate(segment.x + segment.offsetX, segment.y + segment.offsetY);
        ctx.rotate(segment.rotation);

        const size = segment.size;

        // Crocs avec venin (dessinés EN PREMIER = en dessous)
        this.drawFangs(ctx, size);

        // Tête triangulaire géométrique (dessinée PAR-DESSUS)
        ctx.fillStyle = this.config.baseColor;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.5, -size * 0.6);
        ctx.lineTo(-size * 0.5, size * 0.6);
        ctx.closePath();
        ctx.fill();

        // Marques d'avertissement jaunes toxiques sur la tête
        ctx.fillStyle = this.config.accentColor;
        ctx.globalAlpha = 0.7;
        
        // Bande toxique centrale
        ctx.beginPath();
        ctx.moveTo(size * 0.5, -size * 0.2);
        ctx.lineTo(0, -size * 0.15);
        ctx.lineTo(0, size * 0.15);
        ctx.lineTo(size * 0.5, size * 0.2);
        ctx.closePath();
        ctx.fill();

        // Motifs triangulaires toxiques sur les côtés
        for (let i = 0; i < 3; i++) {
            const offset = i * size * 0.2;
            ctx.beginPath();
            ctx.moveTo(-offset, -size * 0.4);
            ctx.lineTo(-offset - size * 0.1, -size * 0.5);
            ctx.lineTo(-offset - size * 0.15, -size * 0.35);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-offset, size * 0.4);
            ctx.lineTo(-offset - size * 0.1, size * 0.5);
            ctx.lineTo(-offset - size * 0.15, size * 0.35);
            ctx.closePath();
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        // Contour lumineux toxique
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.5, -size * 0.6);
        ctx.lineTo(-size * 0.5, size * 0.6);
        ctx.closePath();
        ctx.stroke();

        // Narines noires
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(size * 0.6, -size * 0.2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.6, size * 0.2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Yeux verts lumineux avec pupilles fendues
        this.drawEye(ctx, size * 0.2, -size * 0.4, size);
        this.drawEye(ctx, size * 0.2, size * 0.4, size);

        // Langue fourchue rouge animée
        if (!this.isBlinking) {
            this.drawTongue(ctx, size);
        }

        ctx.restore();
    }

    drawEye(ctx, x, y, baseSize) {
        const eyeSize = baseSize * 0.18; // Proportionnel à la taille de la tête

        // Lueur externe
        ctx.save();
        ctx.shadowColor = this.config.eyeColor;
        ctx.shadowBlur = eyeSize * 0.8;
        
        // Globe oculaire
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(x, y, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        if (!this.isBlinking) {
            // Iris vert lumineux
            ctx.fillStyle = this.config.eyeColor;
            ctx.beginPath();
            ctx.arc(x, y, eyeSize * 0.7, 0, Math.PI * 2);
            ctx.fill();

            // Pupille fendue verticale
            ctx.fillStyle = '#000000';
            ctx.fillRect(x - 4, y - eyeSize * 0.6, 8, eyeSize * 1.2);

            // Reflet lumineux
            ctx.fillStyle = `rgba(255, 255, 255, ${this.eyeGlow})`;
            ctx.beginPath();
            ctx.arc(x - 8, y - 10, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Œil fermé
            ctx.strokeStyle = this.config.baseColor;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(x - eyeSize, y);
            ctx.lineTo(x + eyeSize, y);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawTongue(ctx, size) {
        const tongueLength = size * 0.4 * this.tongueExtension; // Proportionnel
        const forkWidth = size * 0.08;

        ctx.save();
        ctx.strokeStyle = this.config.tongueColor;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        // Langue principale
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(size + tongueLength, 0);
        ctx.stroke();

        // Fourche de la langue
        if (tongueLength > 20) {
            ctx.beginPath();
            ctx.moveTo(size + tongueLength, 0);
            ctx.lineTo(size + tongueLength + forkWidth, -forkWidth);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(size + tongueLength, 0);
            ctx.lineTo(size + tongueLength + forkWidth, forkWidth);
            ctx.stroke();

            // Crochets blancs pointus de chaque côté du bout de la langue
            if (tongueLength > 40) {
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#cccccc';
                ctx.lineWidth = 1;

                // Crochets sur la fourche supérieure
                ctx.beginPath();
                ctx.moveTo(size + tongueLength + forkWidth - 5, -forkWidth - 3);
                ctx.lineTo(size + tongueLength + forkWidth + 8, -forkWidth - 8);
                ctx.lineTo(size + tongueLength + forkWidth + 5, -forkWidth - 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(size + tongueLength + forkWidth - 5, -forkWidth + 3);
                ctx.lineTo(size + tongueLength + forkWidth + 8, -forkWidth + 8);
                ctx.lineTo(size + tongueLength + forkWidth + 5, -forkWidth + 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Crochets sur la fourche inférieure
                ctx.beginPath();
                ctx.moveTo(size + tongueLength + forkWidth - 5, forkWidth - 3);
                ctx.lineTo(size + tongueLength + forkWidth + 8, forkWidth - 8);
                ctx.lineTo(size + tongueLength + forkWidth + 5, forkWidth - 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(size + tongueLength + forkWidth - 5, forkWidth + 3);
                ctx.lineTo(size + tongueLength + forkWidth + 8, forkWidth + 8);
                ctx.lineTo(size + tongueLength + forkWidth + 5, forkWidth + 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawFangs(ctx, size) {
        ctx.save();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = Math.max(1, size * 0.01);
        
        const tongueBaseX = size * 0.6;
        const fangLength = size * 0.2;
        
        // Croc gauche HAUT
        ctx.beginPath();
        ctx.moveTo(tongueBaseX - 20, -size * 0.12);
        ctx.lineTo(tongueBaseX + 40, -size * 0.05);
        ctx.lineTo(tongueBaseX + 30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Croc gauche BAS
        ctx.beginPath();
        ctx.moveTo(tongueBaseX - 20, -size * 0.02);
        ctx.lineTo(tongueBaseX + 40, size * 0.05);
        ctx.lineTo(tongueBaseX + 30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Croc droit HAUT
        ctx.beginPath();
        ctx.moveTo(tongueBaseX - 20, size * 0.02);
        ctx.lineTo(tongueBaseX + 40, -size * 0.05);
        ctx.lineTo(tongueBaseX + 30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Croc droit BAS
        ctx.beginPath();
        ctx.moveTo(tongueBaseX - 20, size * 0.12);
        ctx.lineTo(tongueBaseX + 40, size * 0.05);
        ctx.lineTo(tongueBaseX + 30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Reflets blancs brillants sur les crochets
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.9;
        
        ctx.beginPath();
        ctx.arc(tongueBaseX + 20, -size * 0.04, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(tongueBaseX + 20, size * 0.04, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;

        // Gouttes de venin vert au bout des crochets
        ctx.fillStyle = this.config.venomColor;
        ctx.shadowColor = this.config.venomColor;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.arc(tongueBaseX + 40, -size * 0.05 + this.venomDrop * 15, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tongueBaseX + 40, size * 0.05 + this.venomDrop * 15, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
