// ============================================
// MODULE DRAGON BOSS (ID:E-manuel)
// Dragon de feu avec segments animés, ailes battantes, pattes griffues,
// cornes noires, yeux dorés, crocs dorés, particules de flammes
// ============================================

export default class DragonBoss {
    constructor() {
        // Configuration du dragon
        this.config = {
            segments: 12,
            headSize: 200,           // Grosse tête
            tailSize: 30,            // Queue fine
            baseColor: '#8B0000',    // Rouge sombre
            alternateColor: '#000000', // Noir
            accentColor: '#FF4500',  // Orange-rouge feu
            eyeColor: '#FFD700',     // Yeux dorés
            tongueColor: '#ff0000',
            fangColor: '#FFD700',    // Crochets dorés
            flameColor: '#FF6600',   // Flammes
            clawColor: '#333333',    // Griffes noires
            hornColor: '#1a1a1a',    // Cornes noires
            scaleSize: 20,
            animationSpeed: 0.05,
            waveAmplitude: 50,
            waveFrequency: 0.1
        };

        // Cache pré-calculé pour les triangles (optimisation)
        this.triangleCache = [];
        for (let i = 0; i < 3; i++) {
            const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
            this.triangleCache.push({
                x: Math.cos(angle),
                y: Math.sin(angle)
            });
        }

        this.segments = [];
        this.animationTime = 0;
        this.mode = 'traverse';
        
        // Pour détecter la direction du mouvement
        this.previousBossX = 0;
        this.previousBossY = 0;
        
        // État de la tête
        this.tongueExtension = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.flameParticles = [];
        this.eyeGlow = 0;
    }

    init(x, y, bossSize, mode = 'traverse') {
        this.segments = [];
        this.mode = mode;
        
        if (mode === 'boss') {
            // Mode BOSS : gros dragon enroulé statique
            const centerX = x;
            const centerY = y;
            const radius = bossSize * 2;
            
            for (let i = 0; i < this.config.segments; i++) {
                const progression = i / (this.config.segments - 1);
                const angle = (i / this.config.segments) * Math.PI * 4;
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
                    hasLegs: (i === 3 || i === 6 || i === 9) && bossSize > 30,
                    baseAngle: angle,
                    baseRadius: spiralRadius
                });
            }
        } else {
            // Mode TRAVERSE : petit dragon qui traverse
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
                    hasLegs: false
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
            // Mode BOSS : dragon enroulé statique avec pulsation
            for (let i = 0; i < this.segments.length; i++) {
                const segment = this.segments[i];
                
                const pulse = Math.sin(this.animationTime + segment.pulseOffset) * 0.05;
                const angle = segment.baseAngle + this.animationTime * 0.1;
                const radius = segment.baseRadius * (1 + pulse);
                
                segment.x = boss.x + Math.cos(angle) * radius;
                segment.y = boss.y + Math.sin(angle) * radius;
                segment.rotation = angle + Math.PI / 2;
                
                segment.pulsePhase = this.animationTime + segment.pulseOffset;
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
            }
        }

        // Animation de la tête
        this.tongueExtension = Math.sin(this.animationTime * 0.15) * 0.5 + 0.5;
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

        // Particules de flammes
        if (Math.random() < 0.3) {
            this.flameParticles.push({
                x: 0,
                y: 0,
                vx: 5 + Math.random() * 5,
                vy: (Math.random() - 0.5) * 3,
                life: 1,
                size: 5 + Math.random() * 10
            });
        }

        // Mise à jour des flammes
        this.flameParticles = this.flameParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.size *= 0.98;
            return p.life > 0;
        });
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

        // Ailes (sur les segments 2 et 4)
        if (segment.index === 2 || segment.index === 4) {
            this.drawWings(ctx, segment);
        }

        // Couleur alternée rouge/noir
        const color = segment.index % 2 === 0 ? this.config.baseColor : this.config.alternateColor;

        // Corps du segment
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, segment.size, segment.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Contour rouge feu
        const pulse = 0.4 + Math.sin(segment.pulsePhase) * 0.3;
        ctx.strokeStyle = `rgba(255, 69, 0, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, segment.size, segment.size * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Écailles triangulaires de dragon
        if (segment.size > 15) {
            const scaleCount = Math.min(Math.floor(segment.size / 15), 6);
            for (let i = 0; i < scaleCount; i++) {
                const angle = (i * Math.PI * 2) / scaleCount;
                const sx = Math.cos(angle) * segment.size * 0.5;
                const sy = Math.sin(angle) * segment.size * 0.35;
                
                this.drawTriangleScale(ctx, segment, sx, sy, angle, segment.size * 0.15);
            }
        }

        // Pattes avec griffes
        if (segment.hasLegs) {
            this.drawLegs(ctx, segment);
        }

        ctx.restore();
    }

    drawWings(ctx, segment) {
        const wingSize = segment.size * 1.5;
        const flapPhase = Math.sin(segment.pulsePhase * 2) * 0.3;
        
        // Aile gauche
        ctx.save();
        ctx.globalAlpha = 0.8;
        
        // Membrane de l'aile
        ctx.fillStyle = this.config.baseColor;
        ctx.strokeStyle = this.config.alternateColor;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(0, -segment.size * 0.5);
        ctx.quadraticCurveTo(
            -wingSize * 0.7, -wingSize * (1 + flapPhase),
            -wingSize, -wingSize * 0.3
        );
        ctx.lineTo(-wingSize * 0.8, -segment.size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Os de l'aile
        ctx.strokeStyle = this.config.alternateColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -segment.size * 0.5);
        ctx.lineTo(-wingSize * 0.7, -wingSize * (1 + flapPhase));
        ctx.stroke();

        // Griffe au bout de l'aile
        ctx.fillStyle = this.config.clawColor;
        ctx.beginPath();
        ctx.moveTo(-wingSize, -wingSize * 0.3);
        ctx.lineTo(-wingSize - 20, -wingSize * 0.4);
        ctx.lineTo(-wingSize - 15, -wingSize * 0.25);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();

        // Aile droite (miroir)
        ctx.save();
        ctx.globalAlpha = 0.8;
        
        ctx.fillStyle = this.config.baseColor;
        ctx.strokeStyle = this.config.alternateColor;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(0, segment.size * 0.5);
        ctx.quadraticCurveTo(
            -wingSize * 0.7, wingSize * (1 + flapPhase),
            -wingSize, wingSize * 0.3
        );
        ctx.lineTo(-wingSize * 0.8, segment.size * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = this.config.alternateColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, segment.size * 0.5);
        ctx.lineTo(-wingSize * 0.7, wingSize * (1 + flapPhase));
        ctx.stroke();

        ctx.fillStyle = this.config.clawColor;
        ctx.beginPath();
        ctx.moveTo(-wingSize, wingSize * 0.3);
        ctx.lineTo(-wingSize - 20, wingSize * 0.4);
        ctx.lineTo(-wingSize - 15, wingSize * 0.25);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    drawLegs(ctx, segment) {
        const legLength = segment.size * 0.8;
        const legWidth = segment.size * 0.15;
        
        // Patte gauche
        ctx.fillStyle = this.config.alternateColor;
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 2;
        
        // Cuisse
        ctx.beginPath();
        ctx.moveTo(-segment.size * 0.2, -segment.size * 0.5);
        ctx.lineTo(-segment.size * 0.3, -segment.size * 0.5 - legLength * 0.6);
        ctx.lineTo(-segment.size * 0.4, -segment.size * 0.5 - legLength * 0.6);
        ctx.lineTo(-segment.size * 0.3, -segment.size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Patte
        ctx.beginPath();
        ctx.moveTo(-segment.size * 0.3, -segment.size * 0.5 - legLength * 0.6);
        ctx.lineTo(-segment.size * 0.2, -segment.size * 0.5 - legLength);
        ctx.lineTo(-segment.size * 0.3, -segment.size * 0.5 - legLength);
        ctx.lineTo(-segment.size * 0.4, -segment.size * 0.5 - legLength * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Griffes (3 griffes)
        ctx.fillStyle = this.config.clawColor;
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 8;
            ctx.beginPath();
            ctx.moveTo(-segment.size * 0.25 + offset, -segment.size * 0.5 - legLength);
            ctx.lineTo(-segment.size * 0.25 + offset - 5, -segment.size * 0.5 - legLength - 15);
            ctx.lineTo(-segment.size * 0.25 + offset + 5, -segment.size * 0.5 - legLength - 12);
            ctx.closePath();
            ctx.fill();
        }

        // Patte droite (miroir)
        ctx.fillStyle = this.config.alternateColor;
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(-segment.size * 0.2, segment.size * 0.5);
        ctx.lineTo(-segment.size * 0.3, segment.size * 0.5 + legLength * 0.6);
        ctx.lineTo(-segment.size * 0.4, segment.size * 0.5 + legLength * 0.6);
        ctx.lineTo(-segment.size * 0.3, segment.size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-segment.size * 0.3, segment.size * 0.5 + legLength * 0.6);
        ctx.lineTo(-segment.size * 0.2, segment.size * 0.5 + legLength);
        ctx.lineTo(-segment.size * 0.3, segment.size * 0.5 + legLength);
        ctx.lineTo(-segment.size * 0.4, segment.size * 0.5 + legLength * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.config.clawColor;
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 8;
            ctx.beginPath();
            ctx.moveTo(-segment.size * 0.25 + offset, segment.size * 0.5 + legLength);
            ctx.lineTo(-segment.size * 0.25 + offset - 5, segment.size * 0.5 + legLength + 15);
            ctx.lineTo(-segment.size * 0.25 + offset + 5, segment.size * 0.5 + legLength + 12);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawTriangleScale(ctx, segment, x, y, rotation, scaleSize) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Triangle rouge/noir
        ctx.fillStyle = segment.index % 2 === 0 ? this.config.accentColor : this.config.alternateColor;
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i <= 3; i++) {
            const point = this.triangleCache[i % 3];
            const px = point.x * scaleSize;
            const py = point.y * scaleSize;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    drawHead(ctx, segment) {
        ctx.save();
        ctx.translate(segment.x + segment.offsetX, segment.y + segment.offsetY);
        ctx.rotate(segment.rotation);

        const size = segment.size;

        // Flammes/fumée EN PREMIER (derrière)
        this.drawFlames(ctx, size);

        // Crocs dorés
        this.drawFangs(ctx, size);

        // Tête triangulaire de dragon
        ctx.fillStyle = this.config.baseColor;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.5, -size * 0.6);
        ctx.lineTo(-size * 0.5, size * 0.6);
        ctx.closePath();
        ctx.fill();

        // Motifs noirs sur la tête
        ctx.fillStyle = this.config.alternateColor;
        ctx.globalAlpha = 0.7;
        
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

        // Contour rouge feu
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.5, -size * 0.6);
        ctx.lineTo(-size * 0.5, size * 0.6);
        ctx.closePath();
        ctx.stroke();

        // Cornes noires
        this.drawHorns(ctx, size);

        // Narines avec fumée
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(size * 0.6, -size * 0.2, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size * 0.6, size * 0.2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Yeux dorés avec pupilles
        this.drawEye(ctx, size * 0.2, -size * 0.4, size);
        this.drawEye(ctx, size * 0.2, size * 0.4, size);

        // Langue fourchue rouge
        if (!this.isBlinking) {
            this.drawTongue(ctx, size);
        }

        ctx.restore();
    }

    drawHorns(ctx, size) {
        ctx.fillStyle = this.config.hornColor;
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 2;

        // Corne gauche
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, -size * 0.7);
        ctx.lineTo(-size * 0.4, -size * 1.2);
        ctx.lineTo(-size * 0.35, -size * 1.15);
        ctx.lineTo(-size * 0.25, -size * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Anneaux sur la corne
        for (let i = 0; i < 3; i++) {
            const y = -size * 0.8 - i * size * 0.12;
            ctx.strokeStyle = this.config.accentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-size * 0.38, y);
            ctx.lineTo(-size * 0.32, y);
            ctx.stroke();
        }

        // Corne droite
        ctx.fillStyle = this.config.hornColor;
        ctx.strokeStyle = this.config.accentColor;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, size * 0.7);
        ctx.lineTo(-size * 0.4, size * 1.2);
        ctx.lineTo(-size * 0.35, size * 1.15);
        ctx.lineTo(-size * 0.25, size * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < 3; i++) {
            const y = size * 0.8 + i * size * 0.12;
            ctx.strokeStyle = this.config.accentColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-size * 0.38, y);
            ctx.lineTo(-size * 0.32, y);
            ctx.stroke();
        }
    }

    drawFlames(ctx, size) {
        // Dessiner les particules de flammes
        this.flameParticles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            
            // Gradient de flamme
            const gradient = ctx.createRadialGradient(
                size + p.x, p.y, 0,
                size + p.x, p.y, p.size
            );
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.5, this.config.flameColor);
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(size + p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }

    drawEye(ctx, x, y, baseSize) {
        const eyeSize = baseSize * 0.18; // Proportionnel

        ctx.save();
        ctx.shadowColor = this.config.eyeColor;
        ctx.shadowBlur = eyeSize * 0.8;
        
        // Globe oculaire
        ctx.fillStyle = '#1a0000';
        ctx.beginPath();
        ctx.arc(x, y, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        if (!this.isBlinking) {
            // Iris doré
            ctx.fillStyle = this.config.eyeColor;
            ctx.beginPath();
            ctx.arc(x, y, eyeSize * 0.7, 0, Math.PI * 2);
            ctx.fill();

            // Pupille fendue verticale
            ctx.fillStyle = '#000000';
            ctx.fillRect(x - 4, y - eyeSize * 0.6, 8, eyeSize * 1.2);

            // Reflet lumineux
            ctx.fillStyle = `rgba(255, 215, 0, ${this.eyeGlow})`;
            ctx.beginPath();
            ctx.arc(x - 8, y - 10, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
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

        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(size + tongueLength, 0);
        ctx.stroke();

        if (tongueLength > 20) {
            ctx.beginPath();
            ctx.moveTo(size + tongueLength, 0);
            ctx.lineTo(size + tongueLength + forkWidth, -forkWidth);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(size + tongueLength, 0);
            ctx.lineTo(size + tongueLength + forkWidth, forkWidth);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawFangs(ctx, size) {
        const tongueBaseX = size * 0.7;
        
        ctx.save();
        
        const gradient = ctx.createLinearGradient(size * 0.3, 0, size * 0.7, 0);
        gradient.addColorStop(0, '#B8860B');
        gradient.addColorStop(0.5, this.config.fangColor);
        gradient.addColorStop(1, '#FFF4A3');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        
        // Crocs dorés
        ctx.beginPath();
        ctx.moveTo(tongueBaseX - 20, -size * 0.12);
        ctx.lineTo(tongueBaseX + 40, -size * 0.05);
        ctx.lineTo(tongueBaseX + 30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(tongueBaseX - 20, size * 0.12);
        ctx.lineTo(tongueBaseX + 40, size * 0.05);
        ctx.lineTo(tongueBaseX + 30, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(tongueBaseX + 20, -size * 0.04, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(tongueBaseX + 20, size * 0.04, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
