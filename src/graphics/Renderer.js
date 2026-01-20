// Renderer.js - Moteur de rendu avec style vitrail
import { GameConfig } from '../config/GameConfig.js';
import { SheepAnimator } from './SheepAnimator.js';
import { ParticleSystem } from './ParticleSystem.js';
import { PixelArtRenderer } from './PixelArtRenderer.js';
import { CloudBackground } from './CloudBackground.js';
import { WaterBackground } from './WaterBackground.js';

export class Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        this.sheepAnimator = new SheepAnimator();
        this.particleSystem = new ParticleSystem();
        
        // Configure pixel art rendering
        PixelArtRenderer.setupContext(this.ctx);
        
        // Animation frames
        this.cloudOffset = 0;
        this.starOpacity = [0.6, 0.5, 0.4];
        this.starDirection = [1, 1, 1];
        
        // Effet de recharge
        this.refuelEffects = [];
        
        // Background image de backup
        this.useBackgroundImage = false;
        this.backgroundImage = null;
        this.loadBackgroundImage();
        
        // Cloud background pour niveau 2
        this.cloudBackground = new CloudBackground(this.canvas);
        
        // Water background pour niveau 3
        this.waterBackground = new WaterBackground(this.canvas);
    }
    
    loadBackgroundImage() {
        this.backgroundImage = new Image();
        this.backgroundImage.onload = () => {
            this.useBackgroundImage = true;
            console.log('✅ Background image loaded - Performance mode');
        };
        this.backgroundImage.onerror = () => {
            console.log('⚠️ Background image not found - Using canvas rendering');
        };
        this.backgroundImage.src = 'assets/background.png';
    }
    
    render() {
        // Appliquer le tremblement d'écran si actif
        let shakeActive = false;
        if (this.game.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.game.screenShakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.game.screenShakeIntensity;
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
            shakeActive = true;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // NIVEAU 3: Fond d'eau nocturne avec étoiles
        if (this.game.level3Active || this.game.level3Entering) {
            this.waterBackground.update();
            this.waterBackground.render(this.ctx);
            
            // Dessiner le phare en arrière-plan
            if (this.game.lighthouse) {
                this.game.lighthouse.render(this.ctx);
            }
            
            // Dessiner la porte du paradis si visible
            if (this.game.heavenGate && this.game.heavenGate.visible) {
                this.game.heavenGate.render(this.ctx);
            }
            
            // Dessiner les obstacles marins
            this.game.level3Obstacles.forEach(obstacle => {
                this.drawSeaObstacle(obstacle);
            });
            
            // Dessiner les projectiles du Léviathan
            this.game.level3Projectiles.forEach(proj => {
                this.ctx.save();
                this.ctx.font = '28px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                // Effet de lueur
                this.ctx.shadowColor = '#4A90A4';
                this.ctx.shadowBlur = 10;
                
                this.ctx.fillText(proj.icon, proj.x, proj.y);
                this.ctx.restore();
            });
            
            // Dessiner le Léviathan
            if (this.game.leviathan && this.game.leviathan.isActive) {
                this.game.leviathan.render(this.ctx);
            }
            
            // Dessiner les proverbes (viennent de droite)
            this.game.level3Proverbs.forEach(proverb => {
                if (!proverb.collected) {
                    this.ctx.save();
                    
                    // Effet de lueur
                    this.ctx.shadowColor = '#4A90A4';
                    this.ctx.shadowBlur = 15;
                    
                    // Icône du proverbe
                    this.ctx.font = '32px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(proverb.icon, proverb.x, proverb.y);
                    
                    // Cercle autour
                    this.ctx.strokeStyle = '#4A90A4';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(proverb.x, proverb.y, 25, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                }
            });
        }
        // NIVEAU 2: Fond de ciel avec nuages
        else if (this.game.level2Active) {
            this.cloudBackground.update();
            this.cloudBackground.render(this.ctx);
        }
        // NIVEAU 1: Background normal
        else if (this.useBackgroundImage && this.backgroundImage.complete) {
            this.drawBackgroundImage();
        } else {
            this.drawBackgroundCanvas();
        }
        
        // Mode infini simplifié (boss avec obstacles)
        if (this.game.mode === 'endless' && this.game.endlessMode) {
            this.game.endlessMode.render(this.ctx);
        } else {
            // Obstacles normaux (mode aventure)
            this.game.obstacleManager.getAll().forEach(obs => {
                this.drawObstacle(obs);
            });
            
            // Armes anti-boss (séparées)
            this.game.obstacleManager.getWeapons().forEach(weapon => {
                this.drawObstacle(weapon);
            });
            
            // Objets qui tombent
            this.game.obstacleManager.getFallingObjects().forEach(obj => {
                this.drawFallingObject(obj);
            });
            
            // Explosions
            this.game.obstacleManager.explosions.forEach(exp => {
                this.drawExplosion(exp);
            });
        }
        
        // Power-ups
        this.game.powerUpManager?.getAll().forEach(pu => {
            this.drawPowerUp(pu);
        });
        
        // Réservoirs d'eau
        if (this.game.waterTankSystem) {
            this.game.waterTankSystem.render(this.ctx);
        }
        
        // Sacs d'or
        if (this.game.goldSystem) {
            this.game.goldSystem.render(this.ctx);
        }
        
        // Projectiles des boss
        this.drawProjectiles();
        
        // Joueur (mouton)
        this.drawPlayer();
        
        // Lasers (mode infini)
        if (this.game.mode === 'endless' && this.game.laserSystem) {
            this.game.laserSystem.render(this.ctx);
        }
        
        // Effets de recharge
        this.updateRefuelEffects();
        this.drawRefuelEffects();
        
        // Particules
        this.particleSystem.render(this.ctx);
        
        // Interface utilisateur unifiée
        this.drawUnifiedUI();
        
        // Animation naufrage iceberg avec effets BD
        if (this.game.icebergSinking) {
            const timer = this.game.sinkingTimer;
            
            // Assombrir l'écran progressivement
            this.ctx.fillStyle = `rgba(0, 30, 60, ${Math.min(timer / 240, 0.5)})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Afficher les "TOUIK..." à des intervalles - version compacte
            this.ctx.save();
            this.ctx.font = 'bold 36px Arial';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            
            // TOUIK 1 (frame 40-120)
            if (timer >= 40 && timer < 120) {
                const alpha = timer < 55 ? (timer - 40) / 15 : (timer > 105 ? (120 - timer) / 15 : 1);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.strokeText('TOUIK', 120, 120);
                this.ctx.fillText('TOUIK', 120, 120);
            }
            
            // TOUIK 2 (frame 70-150)
            if (timer >= 70 && timer < 150) {
                const alpha = timer < 85 ? (timer - 70) / 15 : (timer > 135 ? (150 - timer) / 15 : 1);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.strokeText('TOUIK', this.canvas.width - 200, 160);
                this.ctx.fillText('TOUIK', this.canvas.width - 200, 160);
            }
            
            // TOUIK 3 (frame 100-180)
            if (timer >= 100 && timer < 180) {
                const alpha = timer < 115 ? (timer - 100) / 15 : (timer > 165 ? (180 - timer) / 15 : 1);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.strokeText('TOUIK', this.canvas.width / 2 - 60, 280);
                this.ctx.fillText('TOUIK', this.canvas.width / 2 - 60, 280);
            }
            
            this.ctx.restore();
            
            // Lignes de mouvement (manga style) compactes
            if (timer > 50) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                this.ctx.lineWidth = 1.5;
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x1 = this.game.player.x + Math.cos(angle) * 60;
                    const y1 = this.game.player.y + Math.sin(angle) * 40;
                    const x2 = x1 + Math.cos(angle) * 30;
                    const y2 = y1 + Math.sin(angle) * 15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            }
        };
        
        // Porte du Paradis (mode aventure)
        if (this.game.heavenGate) {
            this.game.heavenGate.render(this.ctx);
        }
        
        // Bulle de rejet
        if (this.game.rejectionBubble) {
            this.drawRejectionBubble(this.game.rejectionBubble);
        }
        
        // Intro sequence (mode endless)
        if (this.game.introSequence && this.game.introSequence.isActive()) {
            this.game.introSequence.render(this.ctx);
        }
        
        // Commentaires de boss et onomatopées (mode endless)
        if (this.game.mode === 'endless' && this.game.endlessMode) {
            this.game.endlessMode.renderOnomatopoeia(this.ctx);
            this.game.endlessMode.renderBossComment(this.ctx);
        }
        
        // Restaurer le contexte si tremblement était actif
        if (shakeActive) {
            this.ctx.restore();
        }
    }
    
    drawBackgroundImage() {
        // Mode performance - image pré-rendue
        this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackgroundCanvas() {
        // Mode canvas - rendu temps réel avec animations
        
        // CIEL VITRAIL
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height - 80);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.4, '#B0E0E6');
        skyGradient.addColorStop(0.7, '#98FB98');
        skyGradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height - 80);
        
        // RAYONS DIVINS
        this.drawDivineRays();
        
        // LIGNES DE SÉPARATION VITRAIL
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 150);
        this.ctx.lineTo(this.canvas.width, 150);
        this.ctx.moveTo(0, 300);
        this.ctx.lineTo(this.canvas.width, 300);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // NUAGES ANIMÉS
        this.drawAnimatedClouds();
        
        // ÉTOILES SCINTILLANTES
        this.drawTwinklingStars();
        
        // SOL VITRAIL
        this.drawStainedGlassGround();
        
        // PARTICULES DIVINES
        this.drawDivineParticles();
    }
    
    drawDivineRays() {
        this.ctx.globalAlpha = 0.15;
        const rayPositions = [150, 350, 550];
        
        rayPositions.forEach(x => {
            const gradient = this.ctx.createLinearGradient(x, 0, x, this.canvas.height - 80);
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
            gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 15, 0, 30, this.canvas.height - 80);
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawAnimatedClouds() {
        // Animation douce
        this.cloudOffset += 0.02;
        
        const clouds = [
            { x: 100, y: 80 + Math.sin(this.cloudOffset) * 5 },
            { x: 350, y: 120 + Math.sin(this.cloudOffset + 1) * 6 },
            { x: 600, y: 90 + Math.sin(this.cloudOffset + 2) * 4 }
        ];
        
        this.ctx.globalAlpha = 0.8;
        clouds.forEach(cloud => {
            this.drawCloud(cloud.x, cloud.y);
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawCloud(x, y) {
        const cloudGradient = this.ctx.createRadialGradient(x + 30, y, 10, x + 30, y, 30);
        cloudGradient.addColorStop(0, '#FFFFFF');
        cloudGradient.addColorStop(0.7, '#F8F8F8');
        cloudGradient.addColorStop(1, 'rgba(232, 232, 232, 0.7)');
        
        // Cercles du nuage avec contours blancs
        this.ctx.fillStyle = cloudGradient;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 30, y - 5, 30, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    drawTwinklingStars() {
        const stars = [
            { x: 200, y: 50, speed: 0.02 },
            { x: 450, y: 100, speed: 0.015 },
            { x: 700, y: 60, speed: 0.025 }
        ];
        
        stars.forEach((star, i) => {
            // Animation scintillement
            this.starOpacity[i] += this.starDirection[i] * star.speed;
            if (this.starOpacity[i] >= 1) {
                this.starOpacity[i] = 1;
                this.starDirection[i] = -1;
            } else if (this.starOpacity[i] <= 0.4) {
                this.starOpacity[i] = 0.4;
                this.starDirection[i] = 1;
            }
            
            this.ctx.globalAlpha = this.starOpacity[i];
            this.drawStar(star.x, star.y);
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawStar(x, y) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const x1 = x + Math.cos(angle) * 10;
            const y1 = y + Math.sin(angle) * 10;
            const angle2 = ((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2;
            const x2 = x + Math.cos(angle2) * 5;
            const y2 = y + Math.sin(angle2) * 5;
            
            if (i === 0) this.ctx.moveTo(x1, y1);
            else this.ctx.lineTo(x1, y1);
            this.ctx.lineTo(x2, y2);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#FFD700';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawStainedGlassGround() {
        // Sol avec gradient
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - 80, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#98FB98');
        groundGradient.addColorStop(0.5, '#90EE90');
        groundGradient.addColorStop(1, '#7CCD7C');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);
        
        // CONTOUR BLANC VITRAIL (trait épais)
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 80);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 80);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // HERBE HAUTE
        this.ctx.globalAlpha = 0.6;
        this.ctx.strokeStyle = '#7CCD7C';
        this.ctx.lineWidth = 2;
        
        for (let x = 20; x < this.canvas.width; x += 50) {
            // Brins d'herbe variés plus hauts que le trait
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height - 100);
            this.ctx.quadraticCurveTo(x + 2, this.canvas.height - 90, x, this.canvas.height - 75);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = '#66BB66';
            this.ctx.beginPath();
            this.ctx.moveTo(x + 5, this.canvas.height - 105);
            this.ctx.quadraticCurveTo(x + 7, this.canvas.height - 93, x + 5, this.canvas.height - 78);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = '#7CCD7C';
            this.ctx.beginPath();
            this.ctx.moveTo(x + 10, this.canvas.height - 95);
            this.ctx.quadraticCurveTo(x + 8, this.canvas.height - 87, x + 10, this.canvas.height - 75);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
        
        // FLEURS DORÉES
        this.drawFlowers();
    }
    
    drawFlowers() {
        const flowers = [
            { x: 150, y: this.canvas.height - 65, color: '#FFD700' },
            { x: 400, y: this.canvas.height - 60, color: '#FF69B4' },
            { x: 650, y: this.canvas.height - 62, color: '#FFD700' }
        ];
        
        this.ctx.globalAlpha = 0.7;
        flowers.forEach(flower => {
            // Centre
            this.ctx.fillStyle = flower.color;
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(flower.x, flower.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Pétales
            const petalColor = flower.color === '#FFD700' ? '#FFA500' : '#FF1493';
            this.ctx.fillStyle = petalColor;
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const px = flower.x + Math.cos(angle) * 6;
                const py = flower.y + Math.sin(angle) * 6;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawDivineParticles() {
        const particles = [
            { x: 250, y: 200 },
            { x: 480, y: 250 },
            { x: 320, y: 180 },
            { x: 580, y: 220 },
            { x: 150, y: 280 }
        ];
        
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#FFD700';
        
        particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    drawObstacle(obs) {
        // Dessiner l'effet nuage pour les boss qui apparaissent
        if (obs.type === 'boss' && obs.cloudEffect > 0) {
            this.drawCloudEffect(obs);
        }
        
        // Dessiner le cercle de ciblage jaune si le boss est ciblé
        if (obs.type === 'boss' && obs.targetIndicator > 0) {
            this.ctx.save();
            const centerX = obs.x + obs.width / 2;
            const centerY = obs.y + obs.height / 2;
            const radius = Math.max(obs.width, obs.height) / 2 + 20;
            
            // Animation pulsante
            const pulse = Math.sin(Date.now() * 0.01) * 5;
            
            // Cercle extérieur jaune
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius + pulse, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Cercle intérieur
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius - 10 + pulse / 2, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Réticule
            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - radius - 10, centerY);
            this.ctx.lineTo(centerX + radius + 10, centerY);
            this.ctx.moveTo(centerX, centerY - radius - 10);
            this.ctx.lineTo(centerX, centerY + radius + 10);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        // Utilise le nouveau système Pixel Art HD
        PixelArtRenderer.renderObstacle(this.ctx, obs);
    }
    
    drawFallingObject(obj) {
        this.ctx.save();
        
        // Ombre
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.arc(obj.x + 2, obj.y + 2, obj.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Aura selon dangerosité (style pixel art)
        const radius = obj.width / 2;
        const auraGradient = this.ctx.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, radius + 8);
        if (obj.isDangerous) {
            auraGradient.addColorStop(0, 'rgba(255,0,0,0.6)');
            auraGradient.addColorStop(1, 'rgba(255,0,0,0)');
        } else {
            auraGradient.addColorStop(0, 'rgba(0,200,255,0.6)');
            auraGradient.addColorStop(1, 'rgba(0,200,255,0)');
        }
        this.ctx.fillStyle = auraGradient;
        this.ctx.beginPath();
        this.ctx.arc(obj.x, obj.y, radius + 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Objet avec couleur selon dangerosité
        if (obj.isDangerous) {
            this.ctx.fillStyle = '#FF0000';
        } else {
            this.ctx.fillStyle = '#00BFFF';
        }
        this.ctx.beginPath();
        this.ctx.arc(obj.x, obj.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Contour BLANC pixel art (style vitrail)
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Icône
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(obj.icon, obj.x, obj.y);
        
        // Traînée de mouvement avec contours
        this.ctx.strokeStyle = obj.isDangerous ? '#FF0000' : '#00BFFF';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(obj.x, obj.y - radius - 2);
        this.ctx.lineTo(obj.x, obj.y - radius - 12);
        this.ctx.stroke();
        
        // Contour blanc de la traînée
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(obj.x, obj.y - radius - 2);
        this.ctx.lineTo(obj.x, obj.y - radius - 12);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawExplosion(exp) {
        this.ctx.save();
        
        // Cercle principal de l'explosion
        const gradient = this.ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
        gradient.addColorStop(0, `rgba(255, 200, 0, ${exp.opacity})`);
        gradient.addColorStop(0.4, `rgba(255, 100, 0, ${exp.opacity * 0.7})`);
        gradient.addColorStop(0.7, `rgba(255, 50, 0, ${exp.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Particules éjectionnelles
        exp.particles.forEach(p => {
            const px = exp.x + Math.cos(p.angle) * p.distance;
            const py = exp.y + Math.sin(p.angle) * p.distance;
            
            this.ctx.fillStyle = `rgba(255, ${150 - p.distance * 3}, 0, ${exp.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Anneau extérieur
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${exp.opacity * 0.8})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawSeaObstacle(obstacle) {
        this.ctx.save();
        
        // Boss requin géant (animation spéciale) - PRIORITÉ ABSOLUE
        if (obstacle.sharkBoss && obstacle.sharkBoss.active) {
            const boss = obstacle.sharkBoss;
            console.log('🦈 RENDU BOSS:', boss.x, boss.y, 'frame:', boss.frame);
            
            // Ombre sous-marine massive
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.ellipse(boss.x, boss.y + 40, boss.width * 0.7, boss.height * 0.4, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Corps du requin géant
            const gradient = this.ctx.createLinearGradient(
                boss.x - boss.width/2, boss.y - boss.height/2,
                boss.x + boss.width/2, boss.y + boss.height/2
            );
            gradient.addColorStop(0, '#2A5A7A');
            gradient.addColorStop(0.5, '#1E3A5A');
            gradient.addColorStop(1, '#0D1F3A');
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 6;
            
            // Tête du requin (grande ellipse)
            this.ctx.beginPath();
            this.ctx.ellipse(boss.x, boss.y - boss.height * 0.25, boss.width * 0.45, boss.height * 0.25, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Corps principal
            this.ctx.beginPath();
            this.ctx.ellipse(boss.x, boss.y, boss.width * 0.5, boss.height * 0.35, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Queue
            this.ctx.beginPath();
            this.ctx.moveTo(boss.x, boss.y + boss.height * 0.25);
            this.ctx.lineTo(boss.x - boss.width * 0.25, boss.y + boss.height * 0.45);
            this.ctx.lineTo(boss.x + boss.width * 0.25, boss.y + boss.height * 0.45);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Nageoires latérales
            this.ctx.beginPath();
            this.ctx.moveTo(boss.x - boss.width * 0.35, boss.y);
            this.ctx.lineTo(boss.x - boss.width * 0.55, boss.y - boss.height * 0.12);
            this.ctx.lineTo(boss.x - boss.width * 0.3, boss.y + boss.height * 0.08);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(boss.x + boss.width * 0.35, boss.y);
            this.ctx.lineTo(boss.x + boss.width * 0.55, boss.y - boss.height * 0.12);
            this.ctx.lineTo(boss.x + boss.width * 0.3, boss.y + boss.height * 0.08);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Yeux rouges menaçants ÉNORMES
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(boss.x - boss.width * 0.18, boss.y - boss.height * 0.28, 20, 0, Math.PI * 2);
            this.ctx.arc(boss.x + boss.width * 0.18, boss.y - boss.height * 0.28, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupilles noires
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(boss.x - boss.width * 0.18, boss.y - boss.height * 0.28, 10, 0, Math.PI * 2);
            this.ctx.arc(boss.x + boss.width * 0.18, boss.y - boss.height * 0.28, 10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Dents acérées ÉNORMES (bouche ouverte)
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 5;
            this.ctx.lineCap = 'round';
            for (let i = 0; i < 10; i++) {
                const x = boss.x - boss.width * 0.25 + i * (boss.width * 0.05);
                this.ctx.beginPath();
                this.ctx.moveTo(x, boss.y - boss.height * 0.12);
                this.ctx.lineTo(x, boss.y - boss.height * 0.02);
                this.ctx.stroke();
            }
            
            // Trombe d'eau tourbillonnante autour du requin
            this.ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2 + boss.frame * 0.15;
                const radius = boss.width * 0.4 + Math.sin(boss.frame * 0.2 + i) * 25;
                const px = boss.x + Math.cos(angle) * radius;
                const py = boss.y + Math.sin(angle) * radius;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 12, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
            // NE PAS FAIRE DE RETURN - continuer pour dessiner l'aileron aussi
        }
        
        // Vagues - Deux lignes blanches simples
        if (obstacle.type === 'wave') {
            const waveWidth = obstacle.width;
            
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            
            // Première ligne ondulée
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x - waveWidth/2, obstacle.y);
            this.ctx.quadraticCurveTo(
                obstacle.x - waveWidth/4, obstacle.y - 8,
                obstacle.x, obstacle.y
            );
            this.ctx.quadraticCurveTo(
                obstacle.x + waveWidth/4, obstacle.y + 8,
                obstacle.x + waveWidth/2, obstacle.y
            );
            this.ctx.stroke();
            
            // Deuxième ligne ondulée (plus petite, en dessous)
            this.ctx.lineWidth = 2.5;
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x - waveWidth/3, obstacle.y + 10);
            this.ctx.quadraticCurveTo(
                obstacle.x - waveWidth/6, obstacle.y + 4,
                obstacle.x, obstacle.y + 10
            );
            this.ctx.quadraticCurveTo(
                obstacle.x + waveWidth/6, obstacle.y + 16,
                obstacle.x + waveWidth/3, obstacle.y + 10
            );
            this.ctx.stroke();
            
            this.ctx.restore();
            return;
        }
        
        // Tourbillon - Animation optimisée avec centre sombre
        if (obstacle.type === 'whirlpool') {
            this.ctx.translate(obstacle.x, obstacle.y);
            this.ctx.rotate(obstacle.rotation);
            
            // Centre sombre du tourbillon
            const centerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
            centerGradient.addColorStop(0, 'rgba(0, 20, 40, 0.8)');
            centerGradient.addColorStop(1, 'rgba(30, 144, 255, 0.3)');
            this.ctx.fillStyle = centerGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 3 spirales
            for (let i = 0; i < 3; i++) {
                const radius = (i + 1) * 18;
                const alpha = 0.5 - i * 0.15;
                this.ctx.strokeStyle = `rgba(30, 144, 255, ${alpha})`;
                this.ctx.lineWidth = 5 - i;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius, 0, Math.PI * 1.7);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
            return;
        }
        
        // Icebergs - Forme géométrique détaillée
        if (obstacle.type === 'rock') {
            // Dégradé blanc-bleu glacé
            const gradient = this.ctx.createRadialGradient(
                obstacle.x - 8, obstacle.y - 8, 5,
                obstacle.x, obstacle.y, 28
            );
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.4, '#E8F8FF');
            gradient.addColorStop(0.7, '#D0EFFF');
            gradient.addColorStop(1, '#A8D8E8');
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#90C8D8';
            this.ctx.lineWidth = 2.5;
            
            // Hexagone irrégulier pour l'iceberg
            this.ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                const radiusVar = 20 + (i % 2) * 4; // Variation pour irrégularité
                const x = obstacle.x + Math.cos(angle) * radiusVar;
                const y = obstacle.y + Math.sin(angle) * radiusVar;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Fissures glacées
            this.ctx.strokeStyle = 'rgba(150, 200, 220, 0.6)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x - 8, obstacle.y - 5);
            this.ctx.lineTo(obstacle.x + 5, obstacle.y + 8);
            this.ctx.moveTo(obstacle.x + 6, obstacle.y - 10);
            this.ctx.lineTo(obstacle.x - 3, obstacle.y + 6);
            this.ctx.stroke();
            
            // Reflets glacés (2 points brillants)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x - 6, obstacle.y - 8, 4, 0, Math.PI * 2);
            this.ctx.arc(obstacle.x + 8, obstacle.y - 3, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
            return;
        }
        
        // Requins et Sirènes - Aileron détaillé avec trace blanche
        if (obstacle.type === 'shark' || obstacle.type === 'siren') {
            const finHeight = 56; // 2x plus grand (28 * 2)
            const finWidth = 36;  // 2x plus grand (18 * 2)
            
            // Lignes de traînée blanches derrière l'aileron (sillage en haut)
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            for (let i = 0; i < 4; i++) {
                const offset = i * 15;
                const alpha = 0.6 - i * 0.15;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x + offset, obstacle.y - 8);
                this.ctx.lineTo(obstacle.x + offset + 10, obstacle.y - 8);
                this.ctx.stroke();
            }
            
            // Lignes de traînée à la base (sillage en bas)
            for (let i = 0; i < 4; i++) {
                const offset = i * 15;
                const alpha = 0.6 - i * 0.15;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x + offset, obstacle.y + 8);
                this.ctx.lineTo(obstacle.x + offset + 10, obstacle.y + 8);
                this.ctx.stroke();
            }
            this.ctx.globalAlpha = 1;
            
            // Dégradé noir-gris
            const gradient = this.ctx.createLinearGradient(
                obstacle.x - finWidth/2, obstacle.y - finHeight,
                obstacle.x + finWidth/2, obstacle.y
            );
            gradient.addColorStop(0, '#2a2a2a');
            gradient.addColorStop(0.5, '#1a1a1a');
            gradient.addColorStop(1, '#0a0a0a');
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            
            // Aileron avec courbe réaliste
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x, obstacle.y - finHeight); // Sommet
            // Courbe arrière (gauche) - plus arrondie
            this.ctx.quadraticCurveTo(
                obstacle.x - finWidth/2.5, obstacle.y - finHeight * 0.7,
                obstacle.x - finWidth/2, obstacle.y
            );
            // Base
            this.ctx.lineTo(obstacle.x + finWidth/2, obstacle.y);
            // Courbe avant (droite) - plus inclinée
            this.ctx.quadraticCurveTo(
                obstacle.x + finWidth/3, obstacle.y - finHeight * 0.4,
                obstacle.x, obstacle.y - finHeight
            );
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Détail : ligne de découpe
            this.ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x - 2, obstacle.y - finHeight * 0.3);
            this.ctx.lineTo(obstacle.x - finWidth/3, obstacle.y - 2);
            this.ctx.stroke();
            
            // Notes de musique pour sirène
            if (obstacle.type === 'siren' && obstacle.singing) {
                this.ctx.shadowBlur = 0;
                this.ctx.font = '14px Arial';
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillText('♪', obstacle.x - 15, obstacle.y - 35);
                this.ctx.fillText('♫', obstacle.x + 15, obstacle.y - 30);
            }
            
            this.ctx.restore();
            return;
        }
        
        // Méduses - Forme détaillée avec tentacules
        if (obstacle.type === 'jellyfish') {
            // Corps de la méduse (dôme)
            const domeGradient = this.ctx.createRadialGradient(
                obstacle.x, obstacle.y - 5, 5,
                obstacle.x, obstacle.y, 20
            );
            domeGradient.addColorStop(0, 'rgba(255, 100, 200, 0.8)');
            domeGradient.addColorStop(0.6, 'rgba(255, 20, 147, 0.6)');
            domeGradient.addColorStop(1, 'rgba(199, 21, 133, 0.4)');
            
            this.ctx.fillStyle = domeGradient;
            this.ctx.beginPath();
            this.ctx.arc(obstacle.x, obstacle.y, 18, Math.PI, 0);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Bordure du dôme
            this.ctx.strokeStyle = 'rgba(255, 20, 147, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Tentacules ondulantes (3)
            this.ctx.strokeStyle = 'rgba(255, 20, 147, 0.6)';
            this.ctx.lineWidth = 2.5;
            const time = Date.now() * 0.005;
            for (let i = 0; i < 3; i++) {
                const x = obstacle.x - 8 + i * 8;
                const wave = Math.sin(time + i * 1.2) * 4;
                const wave2 = Math.cos(time + i * 1.5) * 3;
                this.ctx.beginPath();
                this.ctx.moveTo(x, obstacle.y + 15);
                this.ctx.quadraticCurveTo(x + wave, obstacle.y + 22, x + wave2, obstacle.y + 30);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
            return;
        }
        
        // Autres obstacles - Rendu emoji simple
        this.ctx.font = `${obstacle.width}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        if (obstacle.damage > 0) {
            this.ctx.shadowColor = '#FF0000';
            this.ctx.shadowBlur = 8;
        }
        
        this.ctx.fillText(obstacle.icon, obstacle.x, obstacle.y);
        
        this.ctx.restore();
    }
    
    drawPowerUp(pu) {
        // Utilise le nouveau système Pixel Art HD
        PixelArtRenderer.renderPowerUp(this.ctx, pu);
        
        // Particules dansantes autour
        const time = Date.now() * 0.01;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI / 3) + time;
            const px = pu.x + Math.cos(angle) * 30;
            const py = pu.y + Math.sin(angle) * 30;
            this.ctx.fillStyle = 'rgba(255,215,0,0.6)';
            this.ctx.beginPath();
            this.ctx.arc(px, py, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawJumpTrajectory() {
        const trajectory = this.game.player.getJumpTrajectory();
        if (!trajectory) return;
        
        const player = this.game.player;
        const startX = player.x + player.width / 2;
        const startY = player.y + player.height / 2;
        
        this.ctx.save();
        
        // Dessiner l'arc de trajectoire en noir
        this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.6 + trajectory.chargePercent * 0.4})`;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        
        // Simuler la trajectoire
        let x = startX;
        let y = startY;
        let velX = trajectory.velX;
        let velY = trajectory.velY;
        
        for (let i = 0; i < 50; i++) {
            velY += GameConfig.PLAYER.GRAVITY;
            velX *= GameConfig.PLAYER.FRICTION;
            x += velX;
            y += velY;
            
            this.ctx.lineTo(x, y);
            
            if (y >= player.groundY) break;
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Point d'atterrissage estimé en rouge
        this.ctx.fillStyle = `rgba(255, 0, 0, ${0.7 + trajectory.chargePercent * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(x, player.groundY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Barre de charge
        const barWidth = 60;
        const barHeight = 8;
        const barX = player.x + player.width / 2 - barWidth / 2;
        const barY = player.y - 20;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        this.ctx.fillStyle = `rgba(255, 215, 0, ${0.7 + trajectory.chargePercent * 0.3})`;
        this.ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * trajectory.chargePercent, barHeight - 2);
        
        this.ctx.restore();
    }
    
    drawPlayer() {
        const p = this.game.player;
        
        this.ctx.save();
        
        // NIVEAU 3: Dessiner le mouton dans un bateau
        if (this.game.boatMode) {
            const boatWidth = 80;
            const boatHeight = 30;
            const waterLevel = 256; // Niveau de l'eau (canvas.height * 0.5)
            const isFlying = p.y < waterLevel; // Bateau au-dessus de l'eau
            
            // Échelle du tourbillon (aspiration)
            const whirlpoolScale = p.whirlpoolScale !== undefined ? p.whirlpoolScale : 1.0;
            
            // Sauvegarder le contexte et appliquer rotation si active
            this.ctx.save();
            this.ctx.translate(p.x + boatWidth / 2, p.y + boatHeight / 2);
            this.ctx.rotate(p.rotation || 0);
            this.ctx.scale(whirlpoolScale, whirlpoolScale); // Appliquer l'échelle du tourbillon
            this.ctx.translate(-(p.x + boatWidth / 2), -(p.y + boatHeight / 2));
            
            // Fusées améliorées si le bateau vole
            if (isFlying) {
                const time = Date.now() * 0.01;
                
                // Fusée arrière gauche
                this.ctx.save();
                
                // Corps de la fusée (métal)
                const gradient1 = this.ctx.createLinearGradient(p.x + 10, p.y + boatHeight + 20, p.x + 20, p.y + boatHeight + 20);
                gradient1.addColorStop(0, '#666666');
                gradient1.addColorStop(0.5, '#999999');
                gradient1.addColorStop(1, '#666666');
                this.ctx.fillStyle = gradient1;
                this.ctx.fillRect(p.x + 12, p.y + boatHeight + 15, 8, 15);
                
                // Cône de la fusée
                this.ctx.fillStyle = '#FF6600';
                this.ctx.beginPath();
                this.ctx.moveTo(p.x + 16, p.y + boatHeight + 15);
                this.ctx.lineTo(p.x + 12, p.y + boatHeight + 20);
                this.ctx.lineTo(p.x + 20, p.y + boatHeight + 20);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Flammes animées (dégradé)
                for (let i = 0; i < 3; i++) {
                    const flameY = p.y + boatHeight + 30 + i * 8 + Math.sin(time + i) * 3;
                    const flameSize = 12 - i * 3;
                    
                    const flameGradient = this.ctx.createRadialGradient(
                        p.x + 16, flameY, 0,
                        p.x + 16, flameY, flameSize
                    );
                    flameGradient.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
                    flameGradient.addColorStop(0.4, 'rgba(255, 150, 0, 0.7)');
                    flameGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                    
                    this.ctx.fillStyle = flameGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x + 16, flameY, flameSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Étincelles
                for (let i = 0; i < 3; i++) {
                    const sparkY = p.y + boatHeight + 35 + Math.random() * 15;
                    const sparkX = p.x + 16 + (Math.random() - 0.5) * 8;
                    this.ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
                
                // Fusée arrière droite (même style)
                this.ctx.save();
                
                // Corps de la fusée (métal)
                const gradient2 = this.ctx.createLinearGradient(p.x + boatWidth - 20, p.y + boatHeight + 20, p.x + boatWidth - 10, p.y + boatHeight + 20);
                gradient2.addColorStop(0, '#666666');
                gradient2.addColorStop(0.5, '#999999');
                gradient2.addColorStop(1, '#666666');
                this.ctx.fillStyle = gradient2;
                this.ctx.fillRect(p.x + boatWidth - 20, p.y + boatHeight + 15, 8, 15);
                
                // Cône de la fusée
                this.ctx.fillStyle = '#FF6600';
                this.ctx.beginPath();
                this.ctx.moveTo(p.x + boatWidth - 16, p.y + boatHeight + 15);
                this.ctx.lineTo(p.x + boatWidth - 20, p.y + boatHeight + 20);
                this.ctx.lineTo(p.x + boatWidth - 12, p.y + boatHeight + 20);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Flammes animées (dégradé)
                for (let i = 0; i < 3; i++) {
                    const flameY = p.y + boatHeight + 30 + i * 8 + Math.sin(time + i + 1) * 3;
                    const flameSize = 12 - i * 3;
                    
                    const flameGradient = this.ctx.createRadialGradient(
                        p.x + boatWidth - 16, flameY, 0,
                        p.x + boatWidth - 16, flameY, flameSize
                    );
                    flameGradient.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
                    flameGradient.addColorStop(0.4, 'rgba(255, 150, 0, 0.7)');
                    flameGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                    
                    this.ctx.fillStyle = flameGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x + boatWidth - 16, flameY, flameSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Étincelles
                for (let i = 0; i < 3; i++) {
                    const sparkY = p.y + boatHeight + 35 + Math.random() * 15;
                    const sparkX = p.x + boatWidth - 16 + (Math.random() - 0.5) * 8;
                    this.ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            }
            
            // Coque du bateau (forme plus jolie)
            this.ctx.fillStyle = '#8B4513';
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - 10, p.y + 20);
            this.ctx.lineTo(p.x + boatWidth + 10, p.y + 20);
            this.ctx.quadraticCurveTo(p.x + boatWidth + 5, p.y + boatHeight + 25, p.x + boatWidth, p.y + boatHeight + 20);
            this.ctx.lineTo(p.x, p.y + boatHeight + 20);
            this.ctx.quadraticCurveTo(p.x - 5, p.y + boatHeight + 25, p.x - 10, p.y + 20);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Ombre intérieure du bateau
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - 5, p.y + 22);
            this.ctx.lineTo(p.x + boatWidth + 5, p.y + 22);
            this.ctx.lineTo(p.x + boatWidth, p.y + boatHeight + 18);
            this.ctx.lineTo(p.x, p.y + boatHeight + 18);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Bordure du bateau
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - 10, p.y + 20);
            this.ctx.lineTo(p.x + boatWidth + 10, p.y + 20);
            this.ctx.quadraticCurveTo(p.x + boatWidth + 5, p.y + boatHeight + 25, p.x + boatWidth, p.y + boatHeight + 20);
            this.ctx.lineTo(p.x, p.y + boatHeight + 20);
            this.ctx.quadraticCurveTo(p.x - 5, p.y + boatHeight + 25, p.x - 10, p.y + 20);
            this.ctx.stroke();
            
            // Bancs du bateau
            this.ctx.fillStyle = '#A0522D';
            this.ctx.fillRect(p.x + 10, p.y + 25, boatWidth - 20, 3);
            this.ctx.fillRect(p.x + 10, p.y + 35, boatWidth - 20, 3);
            
            // Mât (plus épais)
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + boatWidth / 2, p.y + 20);
            this.ctx.lineTo(p.x + boatWidth / 2, p.y - 35);
            this.ctx.stroke();
            
            // Poulie au sommet du mât
            this.ctx.fillStyle = '#654321';
            this.ctx.beginPath();
            this.ctx.arc(p.x + boatWidth / 2, p.y - 35, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Voile (plus grande et courbée)
            const sailGradient = this.ctx.createLinearGradient(
                p.x + boatWidth / 2, p.y - 30,
                p.x + boatWidth / 2 + 35, p.y
            );
            sailGradient.addColorStop(0, '#FFFFFF');
            sailGradient.addColorStop(0.5, '#F5F5F5');
            sailGradient.addColorStop(1, '#E8E8E8');
            this.ctx.fillStyle = sailGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + boatWidth / 2, p.y - 30);
            this.ctx.quadraticCurveTo(p.x + boatWidth / 2 + 25, p.y - 10, p.x + boatWidth / 2 + 35, p.y + 5);
            this.ctx.lineTo(p.x + boatWidth / 2, p.y + 18);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Bordure de la voile
            this.ctx.strokeStyle = '#CCCCCC';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Mouton à l'arrière du bateau (plus petit)
            this.ctx.save();
            const sheepScale = 0.5;
            this.sheepAnimator.draw(
                this.ctx,
                p.x + boatWidth - 30, // Positionné à l'arrière
                p.y + 10,
                sheepScale,
                0,
                isFlying ? 'flying' : 'normal',
                false,
                0
            );
            this.ctx.restore();
            
            this.ctx.restore();
            return;
        }
        
        // Effet de clignotement si invincible
        if (p.invincible && Math.floor(p.invincibleTimer / 5) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }
        
        // Appliquer rotation si en animation de game over
        if (p.rotation) {
            const centerX = p.x + p.width / 2;
            const centerY = p.y + p.height / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(p.rotation);
            this.ctx.translate(-centerX, -centerY);
        }
        
        // Inverser horizontalement selon la direction
        if (p.facingDirection === -1) {
            this.ctx.translate(p.x + p.width, 0);
            this.ctx.scale(-1, 1);
            this.ctx.translate(-p.x, 0);
        }
        
        // Effet de glace si frozen
        if (p.frozen) {
            // Si attrapé par les tentacules, dessiner les tentacules
            if (p.tentacleGrab) {
                this.ctx.save();
                this.ctx.strokeStyle = '#FF1493';
                this.ctx.lineWidth = 4;
                this.ctx.lineCap = 'round';
                
                const time = Date.now() * 0.01;
                const boatCenterX = p.x + 40;
                const boatCenterY = p.y + 15;
                
                // Dessiner 4 tentacules depuis la pieuvre vers le bateau
                for (let i = 0; i < 4; i++) {
                    const wave = Math.sin(time + i * 1.5) * 8;
                    const wave2 = Math.cos(time + i * 2) * 6;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.jellyfishX, p.jellyfishY + 20);
                    
                    // Courbe sinueuse
                    const midX = (p.jellyfishX + boatCenterX) / 2 + wave;
                    const midY = (p.jellyfishY + boatCenterY) / 2 + wave2;
                    
                    this.ctx.quadraticCurveTo(
                        midX,
                        midY,
                        boatCenterX + (Math.random() - 0.5) * 30,
                        boatCenterY + (Math.random() - 0.5) * 20
                    );
                    this.ctx.stroke();
                    
                    // Ventouses sur le tentacule
                    for (let j = 0; j < 3; j++) {
                        const t = j / 3;
                        const suctionX = p.jellyfishX + (boatCenterX - p.jellyfishX) * t + wave * (1 - t);
                        const suctionY = p.jellyfishY + 20 + (boatCenterY - p.jellyfishY - 20) * t + wave2 * (1 - t);
                        
                        this.ctx.fillStyle = 'rgba(255, 20, 147, 0.6)';
                        this.ctx.beginPath();
                        this.ctx.arc(suctionX, suctionY, 3, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
                
                this.ctx.restore();
            } else {
                // Bloc de glace autour du mouton (phantom)
            const iceGradient = this.ctx.createRadialGradient(
                p.x + p.width / 2, 
                p.y + p.height / 2, 
                0,
                p.x + p.width / 2, 
                p.y + p.height / 2, 
                p.width
            );
            iceGradient.addColorStop(0, 'rgba(135, 206, 235, 0.6)');
            iceGradient.addColorStop(1, 'rgba(173, 216, 230, 0.3)');
            
            this.ctx.fillStyle = iceGradient;
            this.ctx.fillRect(p.x - 5, p.y - 5, p.width + 10, p.height + 10);
            
            // Cristaux de glace
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('❄️', p.x - 10, p.y);
            this.ctx.fillText('❄️', p.x + p.width, p.y);
            this.ctx.fillText('❄️', p.x + p.width / 2 - 10, p.y + p.height + 10);
            }
        }
        
        // Afficher les fusées si riche OU en vol
        const state = (p.flying || p.isRich) ? 'flying' : 'normal';
        
        this.sheepAnimator.draw(
            this.ctx, 
            p.x, 
            p.y, 
            p.size, 
            p.hairLength, 
            state,
            p.rolling,        // Mode roulement (handicap)
            p.hairEffect      // Effet de mèche spéciale (richesse)
        );
        
        // Afficher l'arme équipée
        if (p.equippedWeapon) {
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                p.equippedWeapon.icon,
                p.x + p.width / 2,
                p.y - 10
            );
        }
        
        // Point d'exclamation au-dessus de la tête
        if (p.exclamationMark && p.exclamationTimer > 0) {
            this.ctx.save();
            
            const exclamX = p.x + p.width / 2;
            const exclamY = p.y - 50;
            const bounce = Math.sin(Date.now() * 0.01) * 3;
            
            // Ombre du point d'exclamation
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetY = 2;
            
            // Point d'exclamation rouge géant
            this.ctx.font = 'bold 40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillStyle = '#FF0000';
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 3;
            
            // Contour blanc
            this.ctx.strokeText('!', exclamX, exclamY + bounce);
            // Remplissage rouge
            this.ctx.fillText('!', exclamX, exclamY + bounce);
            
            this.ctx.restore();
        }
        
        // Pistolet laser en mode infini
        if (this.game.mode === 'endless') {
            this.ctx.save();
            
            // Canon du pistolet (rectangles métalliques) - positionné sur la patte avant (plus bas)
            const gunY = p.y + p.height * 0.75; // 75% vers le bas pour être sur la patte
            this.ctx.fillStyle = '#888888';
            this.ctx.fillRect(p.x + p.width, gunY - 3, 15, 6);
            
            // Détails du canon
            this.ctx.fillStyle = '#AAAAAA';
            this.ctx.fillRect(p.x + p.width, gunY - 2, 15, 4);
            
            // Tip du canon (vert lumineux)
            this.ctx.shadowColor = '#00FF00';
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(p.x + p.width + 13, gunY - 2, 3, 4);
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    drawConcentrationAura(player) {
        this.ctx.save();
        
        const centerX = player.x + player.width / 2;
        const centerY = player.y + player.height / 2;
        const time = Date.now() * 0.003;
        
        // Aura principale pulsante
        const auraRadius = 30 + Math.sin(time * 2) * 5;
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, auraRadius);
        gradient.addColorStop(0, `rgba(135, 206, 235, ${0.3 * player.concentrationLevel})`);
        gradient.addColorStop(0.5, `rgba(100, 149, 237, ${0.2 * player.concentrationLevel})`);
        gradient.addColorStop(1, 'rgba(100, 149, 237, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Particules tournantes
        const particleCount = Math.floor(6 * player.concentrationLevel);
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time;
            const radius = 25 + Math.sin(time + i) * 5;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            
            this.ctx.fillStyle = `rgba(173, 216, 230, ${0.6 * player.concentrationLevel})`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Anneaux concentriques
        for (let i = 1; i <= 2; i++) {
            const ringRadius = 20 * i + Math.sin(time + i) * 3;
            this.ctx.strokeStyle = `rgba(135, 206, 235, ${0.4 * player.concentrationLevel})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Texte de concentration
        if (player.concentrationLevel > 0.5) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${player.concentrationLevel})`;
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🧘 CONCENTRATION', centerX, player.y - 30);
        }
        
        this.ctx.restore();
    }
    
    drawJumpRockets(player) {
        this.ctx.save();
        
        // Position des fusées sous le mouton
        const leftRocketX = player.x + 10;
        const rightRocketX = player.x + player.width - 10;
        const rocketY = player.y + player.height;
        
        // Flammes des fusées (effet animé) - ralenti
        const flameLength = 20 + Math.random() * 10;
        const time = Date.now() * 0.003; // Ralenti de 0.01 à 0.003
        
        // Fusée gauche
        this.drawRocketFlame(leftRocketX, rocketY, flameLength, time);
        
        // Fusée droite
        this.drawRocketFlame(rightRocketX, rocketY, flameLength, time + 0.5);
        
        this.ctx.restore();
    }
    
    drawRocketFlame(x, y, length, time) {
        // Gradient de flamme
        const gradient = this.ctx.createLinearGradient(x, y, x, y + length);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 140, 0, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 69, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        
        // Forme de flamme ondulante
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        const wave = Math.sin(time) * 3;
        this.ctx.lineTo(x - 4 + wave, y + length * 0.3);
        this.ctx.lineTo(x + wave, y + length);
        this.ctx.lineTo(x + 4 + wave, y + length * 0.3);
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // Particules de feu
        for (let i = 0; i < 3; i++) {
            const particleY = y + length + Math.random() * 10;
            const particleX = x + (Math.random() - 0.5) * 8;
            const particleSize = 2 + Math.random() * 2;
            
            this.ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${0.5 + Math.random() * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawEndlessUI() {
        const endless = this.game.endlessMode;
        if (!endless) return;
        
        const isMobile = this.canvas.width <= 1024 || this.canvas.height <= 768;
        
        if (isMobile) {
            // UI Mobile compacte en bas à droite
            const boxWidth = 150;
            const boxHeight = 80;
            const boxX = this.canvas.width - boxWidth - 10;
            const boxY = this.canvas.height - boxHeight - 35; // Au-dessus de la jauge de fuel
            
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            
            this.ctx.textAlign = 'left';
            this.ctx.font = 'bold 11px monospace';
            
            // Score
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText(`🎯 ${this.game.score.toLocaleString()}`, boxX + 5, boxY + 15);
            
            // Distance
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillText(`📏 ${Math.floor(endless.distance)}m`, boxX + 5, boxY + 32);
            
            // Vague
            this.ctx.fillStyle = '#FF4500';
            this.ctx.fillText(`🔥 V${endless.waveLevel}`, boxX + 5, boxY + 49);
            
            // Multiplicateur
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fillText(`⚡ x${endless.multiplier.toFixed(1)}`, boxX + 5, boxY + 66);
            
        } else {
            // UI Desktop - panneau en haut à droite
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(this.canvas.width - 250, 10, 240, 180);
            
            this.ctx.textAlign = 'left';
            
            // Score
            this.ctx.fillStyle = GameConfig.COLORS.GOLD_LIGHT;
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(`� SCORE: ${this.game.score.toLocaleString()}`, this.canvas.width - 240, 35);
            
            // Distance
            this.ctx.fillStyle = GameConfig.COLORS.SKY_BLUE;
            this.ctx.fillText(`📏 ${Math.floor(endless.distance)}m`, this.canvas.width - 240, 60);
            
            // Vague
            this.ctx.fillStyle = '#FF4500';
            this.ctx.fillText(`🔥 Vague ${endless.waveLevel}`, this.canvas.width - 240, 130);
            
            // Multiplicateur
            this.ctx.fillStyle = '#32CD32';
            this.ctx.fillText(`⚡ x${endless.multiplier.toFixed(1)}`, this.canvas.width - 240, 155);
            
            // Record
            this.ctx.fillStyle = '#DDA0DD';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(`🏆 Record: ${endless.highScore.toLocaleString()}`, this.canvas.width - 240, 175);
        }
    }
    
    /**
     * Interface utilisateur unifiée - optimisée PC et Mobile
     */
    drawUnifiedUI() {
        const player = this.game.player;
        const isMobile = this.canvas.width <= 1024 || this.canvas.height <= 768;
        
        // === BARRE DU BAS (PC et Mobile) ===
        this.drawBottomBar(isMobile);
        
        // === INFO DU HAUT (selon le mode) ===
        if (this.game.mode === 'endless' && this.game.endlessMode) {
            this.drawTopInfo(isMobile);
        }
    }
    
    /**
     * Barre du bas unifiée : Vies + Fuel + Score + XP
     */
    drawBottomBar(isMobile) {
        const player = this.game.player;
        const barHeight = isMobile ? 35 : 45;
        const barY = this.canvas.height - barHeight;
        
        // Fond noir semi-transparent
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, barY, this.canvas.width, barHeight);
        
        // Bordure supérieure
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, barY);
        this.ctx.lineTo(this.canvas.width, barY);
        this.ctx.stroke();
        
        const fontSize = isMobile ? 10 : 12;
        const iconSize = isMobile ? 14 : 18;
        const padding = isMobile ? 8 : 12;
        const centerY = barY + barHeight / 2;
        
        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.textBaseline = 'middle';
        
        // === VIES (Gauche) ===
        let currentX = padding;
        
        // Icône cœur
        this.ctx.font = `${iconSize}px Arial`;
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillText('❤️', currentX, centerY);
        currentX += iconSize + 4;
        
        // Nombre de vies
        this.ctx.font = `bold ${fontSize + 2}px monospace`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${player.lives}`, currentX, centerY);
        currentX += this.ctx.measureText(`${player.lives}`).width + padding * 2;
        
        // Séparateur
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(currentX, barY + 8, 2, barHeight - 16);
        currentX += padding * 2;
        
        // === FUEL (Après vies) ===
        const fuelBarWidth = isMobile ? this.canvas.width * 0.3 : 200;
        const fuelBarHeight = isMobile ? 16 : 20;
        const fuelBarY = centerY - fuelBarHeight / 2;
        
        // Barre de fuel
        const totalFuel = Math.max(0, Math.floor(player.fuel + player.bonusFuel));
        const fuelPercent = Math.min(1, totalFuel / 100);
        
        // Fond
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(currentX, fuelBarY, fuelBarWidth, fuelBarHeight);
        
        // Remplissage
        let fuelColor;
        if (fuelPercent > 0.5) fuelColor = '#00FF00';
        else if (fuelPercent > 0.25) fuelColor = '#FFD700';
        else fuelColor = '#FF0000';
        
        this.ctx.fillStyle = fuelColor;
        this.ctx.fillRect(currentX + 1, fuelBarY + 1, (fuelBarWidth - 2) * fuelPercent, fuelBarHeight - 2);
        
        // Texte fuel
        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.fillStyle = fuelPercent > 0.3 ? '#000' : '#FFF';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`💧${totalFuel}%`, currentX + fuelBarWidth / 2, centerY);
        
        // Bordure
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(currentX, fuelBarY, fuelBarWidth, fuelBarHeight);
        
        currentX += fuelBarWidth + padding * 2;
        
        // === SAGESSE (Niveau 3 uniquement) ===
        if (this.game.level3Active) {
            // Séparateur
            this.ctx.fillStyle = '#444';
            this.ctx.fillRect(currentX, barY + 8, 2, barHeight - 16);
            currentX += padding * 2;
            
            // Icône sagesse
            this.ctx.font = `${iconSize}px Arial`;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText('🦉', currentX, centerY);
            currentX += iconSize + 4;
            
            // Nombre sagesse
            this.ctx.font = `bold ${fontSize + 2}px monospace`;
            this.ctx.fillStyle = '#FFD700';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${this.game.level3Wisdom}/777`, currentX, centerY);
            currentX += this.ctx.measureText(`${this.game.level3Wisdom}/777`).width + padding * 2;
        }
        
        // === SCORE ET XP (Droite) ===
        this.ctx.textAlign = 'right';
        let rightX = this.canvas.width - padding;
        
        // XP
        const xpValue = this.game.obstacleManager?.totalXP || 0;
        this.ctx.font = `bold ${fontSize + 2}px monospace`;
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`${xpValue}`, rightX, centerY);
        rightX -= this.ctx.measureText(`${xpValue}`).width + 4;
        
        // Label XP
        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('XP', rightX, centerY);
        rightX -= this.ctx.measureText('XP').width + padding * 2;
        
        // Séparateur
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(rightX, barY + 8, 2, barHeight - 16);
        rightX -= padding * 2;
        
        // Score
        this.ctx.font = `bold ${fontSize + 2}px monospace`;
        this.ctx.fillStyle = '#FFFFFF';
        const scoreText = this.game.score.toLocaleString('fr-FR');
        this.ctx.fillText(scoreText, rightX, centerY);
        rightX -= this.ctx.measureText(scoreText).width + 4;
        
        // Label Score
        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.fillStyle = '#888';
        this.ctx.fillText('🎯', rightX, centerY);
        
        this.ctx.restore();
    }
    
    /**
     * Info du haut pour mode Endless
     */
    drawTopInfo(isMobile) {
        const endless = this.game.endlessMode;
        if (!endless) return;
        
        this.ctx.save();
        
        const boxHeight = isMobile ? 60 : 75;
        const boxWidth = isMobile ? 140 : 200;
        const boxX = this.canvas.width - boxWidth - (isMobile ? 8 : 15);
        const boxY = isMobile ? 8 : 15;
        const fontSize = isMobile ? 10 : 12;
        const lineHeight = isMobile ? 14 : 18;
        
        // Fond
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Bordure
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        this.ctx.font = `bold ${fontSize}px monospace`;
        this.ctx.textAlign = 'left';
        
        let currentY = boxY + lineHeight;
        
        // Distance
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillText(`📏 ${Math.floor(endless.distance)}m`, boxX + 8, currentY);
        currentY += lineHeight;
        
        // Vague
        this.ctx.fillStyle = '#FF4500';
        this.ctx.fillText(`� Vague ${endless.waveLevel}`, boxX + 8, currentY);
        currentY += lineHeight;
        
        // Multiplicateur
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillText(`⚡ x${endless.multiplier.toFixed(1)}`, boxX + 8, currentY);
        
        // Record (desktop seulement)
        if (!isMobile) {
            currentY += lineHeight;
            this.ctx.fillStyle = '#DDA0DD';
            this.ctx.font = `bold ${fontSize - 1}px monospace`;
            this.ctx.fillText(`🏆 ${endless.highScore.toLocaleString('fr-FR')}`, boxX + 8, currentY);
        }
        
        this.ctx.restore();
    }
    
    drawHealthBar() {
        const player = this.game.player;
        const isMobile = this.canvas.width <= 1024 || this.canvas.height <= 768;
        
        const heartSize = isMobile ? 18 : 25;
        const spacing = isMobile ? 3 : 5;
        const startX = isMobile ? 10 : 20;
        const startY = isMobile ? 8 : 20;
        
        // Dessiner chaque cœur
        for (let i = 0; i < player.maxLives; i++) {
            const x = startX + i * (heartSize + spacing);
            const isFilled = i < player.lives;
            
            // Cœur avec pixel art style
            this.ctx.save();
            
            if (isFilled) {
                // Cœur plein (rouge vif)
                this.ctx.fillStyle = '#FF0000';
            } else {
                // Cœur vide (gris foncé)
                this.ctx.fillStyle = '#444444';
            }
            
            // Dessiner le cœur
            this.ctx.beginPath();
            this.ctx.moveTo(x + heartSize/2, startY + heartSize);
            
            // Courbe gauche
            this.ctx.bezierCurveTo(
                x, startY + heartSize * 0.6,
                x, startY + heartSize * 0.2,
                x + heartSize/2, startY + heartSize * 0.2
            );
            
            // Courbe droite
            this.ctx.bezierCurveTo(
                x + heartSize, startY + heartSize * 0.2,
                x + heartSize, startY + heartSize * 0.6,
                x + heartSize/2, startY + heartSize
            );
            
            this.ctx.fill();
            
            // Contour blanc (style vitrail)
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = isMobile ? 2 : 3;
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
            
            // Effet de brillance pour les cœurs pleins
            if (isFilled) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(x + heartSize * 0.35, startY + heartSize * 0.35, heartSize * 0.15, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
    }
    
    drawFuelGauge() {
        const player = this.game.player;
        const fuelPercent = player.fuel / player.maxFuel;
        const isMobile = this.canvas.width <= 1024 || this.canvas.height <= 768;
        
        // Position en bas de l'écran sur mobile, sous les cœurs sur desktop
        const gaugeX = isMobile ? 10 : 20;
        const gaugeY = isMobile ? this.canvas.height - 32 : 110;
        const gaugeWidth = isMobile ? this.canvas.width - 20 : 200;
        const gaugeHeight = isMobile ? 20 : 25;
        
        // Calculer extension pour bonus
        const bonusPercent = Math.min(player.bonusFuel / player.maxFuel, 0.5);
        const bonusExtension = isMobile ? 0 : gaugeWidth * bonusPercent; // Pas d'extension sur mobile
        const totalGaugeWidth = gaugeWidth + bonusExtension;
        
        // Fond de la jauge (étendu si bonus)
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(gaugeX, gaugeY, totalGaugeWidth, gaugeHeight);
        
        // Bordure
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(gaugeX, gaugeY, totalGaugeWidth, gaugeHeight);
        
        // Barre de carburant normale (gradient selon niveau)
        const gradient = this.ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeWidth * fuelPercent, 0);
        if (fuelPercent > 0.5) {
            gradient.addColorStop(0, '#00BFFF');
            gradient.addColorStop(1, '#87CEEB');
        } else if (fuelPercent > 0.25) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
        } else {
            gradient.addColorStop(0, '#FF4500');
            gradient.addColorStop(1, '#FF0000');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(gaugeX + 2, gaugeY + 2, (gaugeWidth - 4) * fuelPercent, gaugeHeight - 4);
        
        // Carrés jaunes de bonus fuel (étendent la jauge vers la droite) - Desktop seulement
        if (player.bonusFuel > 0 && !isMobile) {
            const squareSize = 18;
            const numSquares = Math.ceil(bonusExtension / squareSize);
            const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
            
            this.ctx.save();
            for (let i = 0; i < numSquares; i++) {
                const x = gaugeX + gaugeWidth + i * squareSize;
                
                this.ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
                this.ctx.fillRect(x + 2, gaugeY + 2, squareSize - 2, gaugeHeight - 4);
                
                // Bordure brillante
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x + 2, gaugeY + 2, squareSize - 2, gaugeHeight - 4);
                
                // Étincelle au centre
                this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.8})`;
                this.ctx.beginPath();
                this.ctx.arc(x + squareSize/2, gaugeY + gaugeHeight/2, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }
        
        // Texte - pixel art style et plus petit sur mobile
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = isMobile ? 'bold 10px monospace' : 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const totalFuel = Math.floor(player.fuel + player.bonusFuel);
        const fuelText = isMobile ? `💧 ${totalFuel}%` : `💧 CARBURANT ${totalFuel}%`;
        this.ctx.fillText(fuelText, gaugeX + gaugeWidth/2, gaugeY + gaugeHeight/2);
        
        // Avertissement si carburant bas
        if (fuelPercent < 0.25 && player.bonusFuel <= 0 && Math.floor(Date.now() / 500) % 2 === 0) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('⚠️ CARBURANT FAIBLE', gaugeX + gaugeWidth/2, gaugeY - 10);
        }
    }
    
    addParticle(x, y, text, color = '#FFD700') {
        this.particleSystem.add(x, y, text, color);
    }
    
    triggerRefuelEffect(x, y) {
        this.refuelEffects.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 60,
            opacity: 1,
            duration: 30 // 0.5 secondes
        });
    }
    
    updateRefuelEffects() {
        for (let i = this.refuelEffects.length - 1; i >= 0; i--) {
            const effect = this.refuelEffects[i];
            effect.radius += 3;
            effect.opacity -= 0.033;
            effect.duration--;
            
            if (effect.duration <= 0 || effect.opacity <= 0) {
                this.refuelEffects.splice(i, 1);
            }
        }
    }
    
    drawRefuelEffects() {
        this.refuelEffects.forEach(effect => {
            this.ctx.save();
            
            // Cercle bleu brillant
            const gradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.radius);
            gradient.addColorStop(0, `rgba(0, 191, 255, ${effect.opacity * 0.6})`);
            gradient.addColorStop(0.5, `rgba(135, 206, 235, ${effect.opacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Anneau étincellant
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${effect.opacity})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Gouttelettes qui jaillissent
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const dist = effect.radius * 0.5;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;
                
                this.ctx.fillStyle = `rgba(0, 191, 255, ${effect.opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(effect.x + dx, effect.y + dy, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }
    
    triggerRefuelEffect(x, y) {
        this.refuelEffects.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 60,
            opacity: 1,
            duration: 30
        });
    }
    
    updateRefuelEffects() {
        for (let i = this.refuelEffects.length - 1; i >= 0; i--) {
            const effect = this.refuelEffects[i];
            effect.radius += 3;
            effect.opacity -= 0.033;
            effect.duration--;
            
            if (effect.duration <= 0 || effect.opacity <= 0) {
                this.refuelEffects.splice(i, 1);
            }
        }
    }
    
    drawRejectionBubble(bubble) {
        this.ctx.save();
        
        const width = 380;
        const height = 100;
        const x = bubble.x - width / 2;
        const y = bubble.y;
        const pulse = Math.sin(Date.now() / 200) * 5;
        
        // Aura lumineuse rouge pulsante
        this.ctx.shadowColor = `rgba(255, 0, 0, ${bubble.opacity * 0.8})`;
        this.ctx.shadowBlur = 30 + pulse;
        
        // Fond dégradé dramatique
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, `rgba(139, 0, 0, ${bubble.opacity * 0.95})`);
        gradient.addColorStop(0.5, `rgba(178, 34, 34, ${bubble.opacity * 0.95})`);
        gradient.addColorStop(1, `rgba(220, 20, 60, ${bubble.opacity * 0.95})`);
        this.ctx.fillStyle = gradient;
        
        // Bordure dorée brillante
        const borderGradient = this.ctx.createLinearGradient(x, y, x + width, y);
        borderGradient.addColorStop(0, `rgba(255, 215, 0, ${bubble.opacity})`);
        borderGradient.addColorStop(0.5, `rgba(255, 255, 255, ${bubble.opacity})`);
        borderGradient.addColorStop(1, `rgba(255, 215, 0, ${bubble.opacity})`);
        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = 5;
        
        // Rectangle arrondi avec coins
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 15);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Bordure intérieure noire
        this.ctx.strokeStyle = `rgba(0, 0, 0, ${bubble.opacity * 0.6})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(x + 5, y + 5, width - 10, height - 10, 12);
        this.ctx.stroke();
        
        // Petit triangle pointant vers le mouton (plus large)
        const triangleGradient = this.ctx.createLinearGradient(bubble.x, y + height, bubble.x, y + height + 15);
        triangleGradient.addColorStop(0, `rgba(220, 20, 60, ${bubble.opacity * 0.95})`);
        triangleGradient.addColorStop(1, `rgba(139, 0, 0, ${bubble.opacity * 0.95})`);
        this.ctx.fillStyle = triangleGradient;
        
        this.ctx.beginPath();
        this.ctx.moveTo(bubble.x, y + height);
        this.ctx.lineTo(bubble.x - 15, y + height + 15);
        this.ctx.lineTo(bubble.x + 15, y + height + 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = `rgba(255, 215, 0, ${bubble.opacity})`;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Icônes aux coins
        this.ctx.font = '24px Arial';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = `rgba(255, 215, 0, ${bubble.opacity})`;
        this.ctx.fillText('⚠️', x + 15, y + 20);
        this.ctx.fillText('⚠️', x + width - 15, y + 20);
        this.ctx.fillText('🔄', x + 15, y + height - 20);
        this.ctx.fillText('⚡', x + width - 15, y + height - 20);
        
        // Texte principal - ligne 1
        this.ctx.shadowColor = `rgba(0, 0, 0, ${bubble.opacity})`;
        this.ctx.shadowBlur = 8;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
        this.ctx.font = 'bold 20px "Arial Black", Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('VA VIE! et renai !', bubble.x, y + 30);
        
        // Texte principal - ligne 2 (plus grosse)
        this.ctx.font = 'bold 24px "Arial Black", Arial';
        const textGradient = this.ctx.createLinearGradient(bubble.x - 100, 0, bubble.x + 100, 0);
        textGradient.addColorStop(0, `rgba(255, 255, 0, ${bubble.opacity})`);
        textGradient.addColorStop(0.5, `rgba(255, 255, 255, ${bubble.opacity})`);
        textGradient.addColorStop(1, `rgba(255, 255, 0, ${bubble.opacity})`);
        this.ctx.fillStyle = textGradient;
        this.ctx.fillText('RETOURNE VIVRE !', bubble.x, y + 65);
        
        this.ctx.restore();
    }
    
    drawProjectiles() {
        const projectiles = this.game.obstacleManager.getProjectiles();
        
        projectiles.forEach(proj => {
            this.ctx.save();
            
            // Ombre
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetY = 5;
            
            // Lueur de couleur
            this.ctx.shadowColor = proj.color;
            this.ctx.shadowBlur = 15;
            
            // Emoji du projectile
            this.ctx.font = `${proj.height}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(proj.icon, proj.x + proj.width / 2, proj.y + proj.height / 2);
            
            this.ctx.restore();
        });
    }
    
    drawCloudEffect(boss) {
        this.ctx.save();
        
        // Calculer l'opacité basée sur l'effet restant (fade in puis stable)
        const maxDuration = 120;
        let opacity;
        if (boss.cloudEffect > 90) {
            // Fade in (premiers 30 frames)
            opacity = (maxDuration - boss.cloudEffect) / 30;
        } else {
            // Reste visible
            opacity = 0.8;
        }
        
        // Position du nuage centré sur le boss
        const cloudX = boss.x + boss.width / 2;
        const cloudY = boss.y + boss.height / 2;
        const cloudSize = Math.max(boss.width, boss.height) + 40;
        
        // Dessiner plusieurs couches de nuage
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 + (Date.now() / 1000);
            const offsetX = Math.cos(angle) * 15;
            const offsetY = Math.sin(angle) * 10;
            
            const gradient = this.ctx.createRadialGradient(
                cloudX + offsetX, cloudY + offsetY, 0,
                cloudX + offsetX, cloudY + offsetY, cloudSize / 2
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.9})`);
            gradient.addColorStop(0.5, `rgba(240, 240, 255, ${opacity * 0.6})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(cloudX + offsetX, cloudY + offsetY, cloudSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Particules scintillantes autour du nuage
        if (boss.cloudEffect > 60) {
            this.ctx.fillStyle = `rgba(255, 255, 200, ${opacity})`;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI * 2) / 8;
                const dist = cloudSize / 2 + 10;
                const px = cloudX + Math.cos(angle) * dist;
                const py = cloudY + Math.sin(angle) * dist;
                const sparkleSize = 2 + Math.sin(Date.now() / 100 + i) * 1;
                
                this.ctx.beginPath();
                this.ctx.arc(px, py, sparkleSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }
    
    drawLEDPanel() {
        // Obsolète - remplacé par drawUnifiedUI
        // Gardé pour rétrocompatibilité
    }
    
    drawLEDNumber(text, x, y, color, size) {
        this.ctx.save();
        
        // Police style LED avec ombre
        this.ctx.font = `bold ${size}px "Courier New", monospace`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        // Effet d'ombre/glow LED
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillStyle = color;
        
        // Dessiner chaque chiffre avec effet LED
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charX = x + i * (size * 0.7);
            
            // Fond sombre pour chaque chiffre
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(charX - 3, y - size/2, size * 0.65, size);
            
            // Chiffre lumineux
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = color;
            this.ctx.fillStyle = color;
            this.ctx.fillText(char, charX, y);
            
            // Double glow pour effet intense
            this.ctx.shadowBlur = 15;
            this.ctx.fillText(char, charX, y);
        }
        
        this.ctx.restore();
    }
}
