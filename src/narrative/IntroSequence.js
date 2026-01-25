// ============================================
// SÉQUENCE D'INTRODUCTION
// Le mouton arrive au paradis et découvre son équipement
// ============================================

import { SheepAnimator } from '../graphics/SheepAnimator.js';
import { i18n } from '../i18n/I18nManager.js';

export class IntroSequence {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.phase = 0;
        this.phaseTimer = 0;
        this.skipRequested = false;
        
        // Animator pour le mouton
        this.sheepAnimator = new SheepAnimator();
        
        // Phases de l'intro
        this.phases = [
            {
                duration: 240,  // 4 secondes (ralenti)
                textKey: 'intro.phases.paradise',
                action: null
            },
            {
                duration: 90,  // 1.5 secondes - coffre apparaît (ralenti)
                textKey: null,
                action: 'showChest'
            },
            {
                duration: 180,  // 3 secondes (ralenti)
                textKey: 'intro.phases.shield',
                action: 'showItem1'
            },
            {
                duration: 180,  // 3 secondes (ralenti)
                textKey: 'intro.phases.sword',
                action: 'showItem2'
            },
            {
                duration: 180,  // 3 secondes (ralenti)
                textKey: 'intro.phases.bomb',
                action: 'showItem3'
            },
            {
                duration: 210,  // 3.5 secondes (ralenti)
                textKey: 'intro.phases.wtf',
                action: null
            },
            {
                duration: 150,  // 2.5 secondes (ralenti)
                textKey: 'intro.phases.boom',
                action: 'explosion'
            },
            {
                duration: 120,  // 2 secondes - nouvelle phase
                textKey: 'intro.phases.no',
                action: 'gameStart'
            }
        ];
        
        // État visuel
        this.chestVisible = false;
        this.chestOpenProgress = 0;
        this.chestShake = 0;
        this.itemsVisible = {
            shield: false,
            sword: false,
            bomb: false
        };
        this.itemFloatY = {
            shield: 0,
            sword: 0,
            bomb: 0
        };
        this.itemSparkles = {
            shield: [],
            sword: [],
            bomb: []
        };
        this.explosionProgress = 0;
        this.sheepX = 0;
        this.sheepY = 0;
        this.sheepBounce = 0;
    }

    start() {
        this.active = true;
        this.phase = 0;
        this.phaseTimer = 0;
        this.skipRequested = false;
        this.chestVisible = false;
        this.chestOpenProgress = 0;
        this.chestShake = 0;
        this.itemsVisible = { shield: false, sword: false, bomb: false };
        this.itemFloatY = { shield: 0, sword: 0, bomb: 0 };
        this.itemSparkles = { shield: [], sword: [], bomb: [] };
        this.explosionProgress = 0;
        this.sheepX = this.game.canvas.width / 2 - 150;
        this.sheepY = this.game.canvas.height / 2;
    }

    update() {
        if (!this.active) return;

        // Skip avec Espace ou clic
        if (this.skipRequested) {
            this.complete();
            return;
        }

        this.phaseTimer++;
        this.sheepBounce = Math.sin(this.phaseTimer * 0.08) * 3;

        const currentPhase = this.phases[this.phase];
        
        // Actions spécifiques par phase
        if (currentPhase.action === 'showChest' && this.phaseTimer > 10) {
            this.chestVisible = true;
            this.chestOpenProgress = Math.min(1, this.chestOpenProgress + 0.03);
            
            // Shake du coffre quand il s'ouvre
            if (this.chestOpenProgress < 0.9) {
                this.chestShake = Math.sin(this.phaseTimer * 0.5) * 2;
            }
        }
        
        if (currentPhase.action === 'showItem1' && this.phaseTimer > 20) {
            this.itemsVisible.shield = true;
            this.itemFloatY.shield = Math.min(0, this.itemFloatY.shield + 2);
            
            // Particules étincelles
            if (Math.random() > 0.8) {
                this.itemSparkles.shield.push({
                    x: (Math.random() - 0.5) * 40,
                    y: (Math.random() - 0.5) * 40,
                    life: 30
                });
            }
        }
        
        if (currentPhase.action === 'showItem2' && this.phaseTimer > 20) {
            this.itemsVisible.sword = true;
            this.itemFloatY.sword = Math.min(0, this.itemFloatY.sword + 2);
            
            if (Math.random() > 0.8) {
                this.itemSparkles.sword.push({
                    x: (Math.random() - 0.5) * 40,
                    y: (Math.random() - 0.5) * 40,
                    life: 30
                });
            }
        }
        
        if (currentPhase.action === 'showItem3' && this.phaseTimer > 20) {
            this.itemsVisible.bomb = true;
            this.itemFloatY.bomb = Math.min(0, this.itemFloatY.bomb + 2);
            
            if (Math.random() > 0.8) {
                this.itemSparkles.bomb.push({
                    x: (Math.random() - 0.5) * 40,
                    y: (Math.random() - 0.5) * 40,
                    life: 30
                });
            }
        }
        
        // Mettre à jour les étincelles
        for (const item in this.itemSparkles) {
            this.itemSparkles[item] = this.itemSparkles[item].filter(s => {
                s.life--;
                s.y -= 1;
                return s.life > 0;
            });
        }
        
        if (currentPhase.action === 'explosion') {
            this.explosionProgress = Math.min(1, this.explosionProgress + 0.02);
        }

        // Passer à la phase suivante
        if (this.phaseTimer >= currentPhase.duration) {
            this.phase++;
            this.phaseTimer = 0;
            
            if (this.phase >= this.phases.length) {
                this.complete();
            }
        }
    }

    render(ctx) {
        if (!this.active) return;

        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        
        // Fond sombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        // Nuages de paradis
        this.drawParadiseClouds(ctx);
        
        const currentPhase = this.phases[this.phase];
        
        // Dessiner le vrai mouton avec SheepAnimator
        this.drawSheep(ctx, this.sheepX, this.sheepY + this.sheepBounce);
        
        // Bulle de dialogue au-dessus de la tête du mouton
        if (currentPhase.textKey) {
            const dialogueText = i18n.t(currentPhase.textKey);
            this.drawDialogue(ctx, dialogueText, this.sheepX + 20, this.sheepY - 80);
        }
        
        // Dessiner le coffre et items
        if (this.chestVisible) {
            this.drawChest(ctx, width / 2 + 100, height / 2);
        }
        
        // Effet d'explosion finale
        if (currentPhase.action === 'explosion') {
            this.drawExplosion(ctx);
        }
        
        // Indication pour skip
        if (this.phase < this.phases.length - 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[ESPACE] pour passer', width / 2, height - 30);
        }
    }

    drawParadiseClouds(ctx) {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 + this.phaseTimer) % width;
            const y = i * 100;
            ctx.beginPath();
            ctx.arc(x, y, 60, 0, Math.PI * 2);
            ctx.arc(x + 50, y, 50, 0, Math.PI * 2);
            ctx.arc(x + 100, y, 60, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSheep(ctx, x, y) {
        // Utiliser le SheepAnimator pour dessiner le vrai mouton
        // Signature: draw(ctx, x, y, size, hairLength, state, rolling, hairEffect)
        this.sheepAnimator.draw(
            ctx,
            x,
            y,
            1.5,  // size: plus gros pour l'intro
            0,    // hairLength: pas de cheveux
            'normal',  // state: pas de vol au début
            false,     // rolling: pas de roulement
            0          // hairEffect: pas d'effet
        );
    }

    drawChest(ctx, x, y) {
        ctx.save();
        
        // Appliquer le shake
        ctx.translate(this.chestShake, 0);
        
        const openAngle = this.chestOpenProgress * (Math.PI / 3); // 60 degrés max
        
        // Ombre du coffre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y + 55, 50, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Base du coffre (3D)
        const gradient = ctx.createLinearGradient(x - 50, y, x + 50, y);
        gradient.addColorStop(0, '#654321');
        gradient.addColorStop(0.5, '#8B4513');
        gradient.addColorStop(1, '#654321');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 3;
        
        // Corps principal
        ctx.fillRect(x - 50, y, 100, 60);
        ctx.strokeRect(x - 50, y, 100, 60);
        
        // Bandes métalliques horizontales
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(x - 50, y + 10, 100, 6);
        ctx.fillRect(x - 50, y + 44, 100, 6);
        
        // Coins métalliques
        ctx.fillStyle = '#C9A068';
        for (let corner of [[x - 45, y + 5], [x + 35, y + 5], [x - 45, y + 49], [x + 35, y + 49]]) {
            ctx.fillRect(corner[0], corner[1], 10, 10);
        }
        
        // Serrure dorée
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + 30, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Trou de serrure
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(x, y + 28, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 2, y + 28, 4, 8);
        
        // Couvercle (qui s'ouvre avec animation)
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-openAngle);
        
        const lidGradient = ctx.createLinearGradient(-50, -50, 50, -50);
        lidGradient.addColorStop(0, '#7A5230');
        lidGradient.addColorStop(0.5, '#A0522D');
        lidGradient.addColorStop(1, '#7A5230');
        
        ctx.fillStyle = lidGradient;
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 3;
        
        // Forme du couvercle bombé
        ctx.beginPath();
        ctx.moveTo(-50, 0);
        ctx.lineTo(-50, -40);
        ctx.quadraticCurveTo(0, -55, 50, -40);
        ctx.lineTo(50, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Bandes sur le couvercle
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(-50, -10, 100, 6);
        
        // Lueur dorée à l'intérieur quand ouvert
        if (this.chestOpenProgress > 0.2) {
            const glowIntensity = Math.min(1, (this.chestOpenProgress - 0.2) * 2);
            ctx.globalAlpha = glowIntensity * 0.6;
            
            const innerGlow = ctx.createRadialGradient(0, -20, 0, 0, -20, 40);
            innerGlow.addColorStop(0, '#FFD700');
            innerGlow.addColorStop(0.5, '#FFA500');
            innerGlow.addColorStop(1, 'rgba(255, 165, 0, 0)');
            
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(0, -20, 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
        
        // Items qui sortent un par un du coffre
        if (this.chestOpenProgress > 0.4) {
            const baseY = y - 20;
            
            // Shield sort en premier
            if (this.itemsVisible.shield) {
                const itemY = baseY + this.itemFloatY.shield - 80;
                this.drawShield(ctx, x - 70, itemY);
                this.drawSparkles(ctx, x - 70, itemY, this.itemSparkles.shield);
            }
            
            // Sword sort en deuxième
            if (this.itemsVisible.sword) {
                const itemY = baseY + this.itemFloatY.sword - 100;
                this.drawSword(ctx, x, itemY);
                this.drawSparkles(ctx, x, itemY, this.itemSparkles.sword);
            }
            
            // Bomb sort en dernier
            if (this.itemsVisible.bomb) {
                const itemY = baseY + this.itemFloatY.bomb - 80;
                this.drawBomb(ctx, x + 70, itemY);
                this.drawSparkles(ctx, x + 70, itemY, this.itemSparkles.bomb);
            }
        }
        
        ctx.restore();
    }
    
    drawSparkles(ctx, x, y, sparkles) {
        for (const sparkle of sparkles) {
            const alpha = sparkle.life / 30;
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x + sparkle.x, y + sparkle.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawShield(ctx, x, y) {
        // Bouclier tactique
        ctx.fillStyle = '#00d4ff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y - 25);
        ctx.lineTo(x + 20, y);
        ctx.lineTo(x + 15, y + 30);
        ctx.lineTo(x - 15, y + 30);
        ctx.lineTo(x - 20, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Effet tech
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x - 5, y, 10, 15);
        ctx.globalAlpha = 1;
    }

    drawSword(ctx, x, y) {
        // Épée laser
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(x, y + 30);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Garde
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 25);
        ctx.lineTo(x + 15, y + 25);
        ctx.stroke();
        
        // Poignée
        ctx.fillStyle = '#404040';
        ctx.fillRect(x - 3, y + 25, 6, 15);
    }

    drawBomb(ctx, x, y) {
        // Bombe ionique
        ctx.fillStyle = '#2c3e50';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Mèche
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x + 5, y - 35);
        ctx.stroke();
        
        // Étincelle
        ctx.fillStyle = '#ffff00';
        const sparkle = Math.sin(this.phaseTimer * 0.3) > 0 ? 1 : 0;
        if (sparkle) {
            ctx.beginPath();
            ctx.arc(x + 5, y - 35, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Symbole radioactif
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☢', x, y);
    }

    drawDialogue(ctx, text, x, y) {
        // Bulle de dialogue stylée au-dessus de la tête
        const padding = 20;
        const maxWidth = 350;
        
        ctx.font = 'bold 18px Arial';
        
        // Découper le texte si trop long
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        
        // Dimensions de la bulle
        const lineHeight = 24;
        const totalHeight = lines.length * lineHeight + padding * 2;
        let maxLineWidth = 0;
        for (const line of lines) {
            const metrics = ctx.measureText(line);
            maxLineWidth = Math.max(maxLineWidth, metrics.width);
        }
        const width = maxLineWidth + padding * 2;
        
        // Fond de la bulle - style pixel art plat
        const bubbleX = x - width / 2;
        const bubbleY = y - totalHeight - 10;
        
        // Fond dégradé doux
        const gradient = ctx.createLinearGradient(bubbleX, bubbleY, bubbleX, bubbleY + totalHeight);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#F0F8FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(bubbleX, bubbleY, width, totalHeight);
        
        // Bordure épaisse noire
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(bubbleX, bubbleY, width, totalHeight);
        
        // Bordure interne dorée
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(bubbleX + 3, bubbleY + 3, width - 6, totalHeight - 6);
        
        // Coins décoratifs bleus (pixel art)
        const s = 4;
        ctx.fillStyle = '#4169E1';
        // Coin haut gauche
        ctx.fillRect(bubbleX + 8, bubbleY + 8, s, s);
        ctx.fillRect(bubbleX + 8 + s, bubbleY + 8, s, s);
        ctx.fillRect(bubbleX + 8, bubbleY + 8 + s, s, s);
        // Coin haut droit
        ctx.fillRect(bubbleX + width - 8 - 2*s, bubbleY + 8, s, s);
        ctx.fillRect(bubbleX + width - 8 - s, bubbleY + 8, s, s);
        ctx.fillRect(bubbleX + width - 8 - 2*s, bubbleY + 8 + s, s, s);
        // Coin bas gauche
        ctx.fillRect(bubbleX + 8, bubbleY + totalHeight - 8 - 2*s, s, s);
        ctx.fillRect(bubbleX + 8 + s, bubbleY + totalHeight - 8 - 2*s, s, s);
        ctx.fillRect(bubbleX + 8, bubbleY + totalHeight - 8 - s, s, s);
        // Coin bas droit
        ctx.fillRect(bubbleX + width - 8 - 2*s, bubbleY + totalHeight - 8 - 2*s, s, s);
        ctx.fillRect(bubbleX + width - 8 - s, bubbleY + totalHeight - 8 - 2*s, s, s);
        ctx.fillRect(bubbleX + width - 8 - 2*s, bubbleY + totalHeight - 8 - s, s, s);
        
        // Pointe de la bulle vers le mouton (triangle pixel art)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(bubbleX + width/2 - 10, bubbleY + totalHeight, 20, 10);
        ctx.fillRect(bubbleX + width/2 - 5, bubbleY + totalHeight + 10, 10, 5);
        
        // Bordure de la pointe
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(bubbleX + width/2 - 10, bubbleY + totalHeight, 20, 10);
        
        // Texte noir dans la bulle
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y - totalHeight - 5 + padding + i * lineHeight);
        }
    }

    drawExplosion(ctx) {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        const progress = this.explosionProgress;
        
        // Flash blanc
        ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress) * 0.9})`;
        ctx.fillRect(0, 0, width, height);
        
        // Cercles d'explosion
        for (let i = 0; i < 5; i++) {
            const radius = progress * (width / 2 + i * 100);
            const alpha = (1 - progress) * 0.3;
            
            ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    handleInput(key) {
        if (key === ' ' || key === 'Enter' || key === 'Escape') {
            this.skipRequested = true;
        }
    }

    complete() {
        this.active = false;
        // Déclencher le début du jeu
        if (this.game.startGame) {
            this.game.startGame();
        }
    }

    isActive() {
        return this.active;
    }
}
