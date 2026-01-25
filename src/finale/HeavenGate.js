// HeavenGate.js - La Porte du Paradis (fin)
import { GameConfig } from '../config/GameConfig.js';
import { i18n } from '../i18n/I18nManager.js';

export class HeavenGate {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.x = GameConfig.CANVAS_WIDTH - GameConfig.HEAVEN_GATE.POSITION_X_OFFSET;
        this.y = (GameConfig.CANVAS_HEIGHT - GameConfig.HEAVEN_GATE.HEIGHT) / 2;
        this.width = GameConfig.HEAVEN_GATE.WIDTH;
        this.height = GameConfig.HEAVEN_GATE.HEIGHT;
        this.triggered = false;
        this.victoryScreenActive = false;
        this.continueButton = null;

        // Animation de victoire
        this.shrinkAnimation = false;
        this.shrinkTimer = 0;

        // Bind click handler
        this.handleClick = this.handleClick.bind(this);
    }
    
    update() {
        // Animation de rétrécissement en cours
        if (this.shrinkAnimation) {
            this.shrinkTimer++;

            // Rétrécir le joueur
            if (this.game.player.size > 0.5) {
                this.game.player.size -= 0.05;
                this.game.player.x += 2;
            }

            // Particules célestes toutes les frames
            if (this.shrinkTimer % 2 === 0) {
                this.game.renderer.addParticle(
                    this.game.player.x,
                    this.game.player.y,
                    ['✨', '🌟', '👼', '🕊️', '💖'][Math.floor(Math.random() * 5)],
                    '#FFD700'
                );
            }

            // Terminer l'animation après ~1.5 secondes (30 * 50ms = 1500ms à 60fps)
            if (this.shrinkTimer > 90) {
                this.shrinkAnimation = false;
                this.showVictoryScreen();
            }
            return;
        }

        // Faire apparaître la porte après suffisamment d'obstacles
        if (this.game.obstaclesCleared >= 30 && !this.visible) {
            this.visible = true;
            console.log('🚪 La Porte du Paradis apparaît !');

            // Afficher un message d'avertissement
            if (this.game.notificationSystem) {
                this.game.notificationSystem.showNarrative({
                    text: i18n.t('game.messages.watchYourLife'),
                    duration: 3000
                });
            }
        }

        // Vérifier si le joueur arrive
        if (this.visible && !this.triggered) {
            this.checkVictory();
        }
    }
    
    checkVictory() {
        const player = this.game.player;
        
        // Le joueur arrive à la porte ?
        if (player.x >= this.x - 50) {
            this.triggered = true;
            
            const totalSize = player.size * player.width;
            
            // VICTOIRE - Assez humble pour passer !
            if (totalSize <= this.width) {
                this.victoryShrink();
            }
            // ÉCHEC - Trop gros !
            else {
                this.gameOverRich();
            }
        }
    }
    
    victoryShrink() {
        console.log('✨ VICTOIRE ! Le mouton entre au Paradis !');

        // Activer l'animation de rétrécissement (gérée par update())
        this.shrinkAnimation = true;
        this.shrinkTimer = 0;
    }
    
    gameOverRich() {
        console.log('💥 BONK ! Trop riche pour le Paradis !');
        this.game.paused = true;
        
        // Animation de recul (BONK!)
        this.game.renderer.addParticle(
            this.game.player.x,
            this.game.player.y,
            '💥 BONK!',
            '#FF0000'
        );
        
        let bounceCount = 0;
        const bounceInterval = setInterval(() => {
            this.game.player.x -= 5;
            this.game.player.y += Math.sin(bounceCount * 0.5) * 10;
            
            // Étoiles qui tournent
            this.game.renderer.addParticle(
                this.game.player.x + Math.cos(bounceCount * 0.2) * 30,
                this.game.player.y - 20 + Math.sin(bounceCount * 0.2) * 30,
                '⭐',
                '#FFD700'
            );
            
            bounceCount++;
            if (bounceCount > 20) {
                clearInterval(bounceInterval);
                this.showGameOverRich();
            }
        }, 50);
    }
    
    showVictoryScreen() {
        // Débloquer le trophée "Horloge brisée - Maître du temps" pour victoire impatiente
        if (this.game.obstacleManager?.trophySystem) {
            this.game.obstacleManager.trophySystem.unlockTrophy('impatient');
            console.log('⏰💔 Trophée Horloge brisée débloqué (victoire impatiente)!');
        }

        // Activer l'écran de victoire dans le canvas
        this.victoryScreenActive = true;
        this.game.paused = true;

        // Définir le bouton de continuation - plus compact
        const canvas = this.game.canvas;
        this.continueButton = {
            x: canvas.width / 2 - 100,
            y: canvas.height / 2 + 180,
            width: 200,
            height: 40,
            text: '⏰ Victoire rapide !'
        };

        // Ajouter le listener de clic
        canvas.addEventListener('click', this.handleClick);
    }

    handleClick(event) {
        if (!this.victoryScreenActive || !this.continueButton) return;

        const canvas = this.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Vérifier si le clic est sur le bouton
        if (x >= this.continueButton.x && x <= this.continueButton.x + this.continueButton.width &&
            y >= this.continueButton.y && y <= this.continueButton.y + this.continueButton.height) {
            // Son toc sur le bouton continuer
            if (this.game.audioManager && this.game.audioManager.initialized) {
                this.game.audioManager.playTokeSound();
            }
            // Nettoyer tous les overlays avant reload
            const overlays = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
            overlays.forEach(el => el.style.display = 'none');
            // Retirer le listener
            canvas.removeEventListener('click', this.handleClick);
            // Recharger la page
            setTimeout(() => {
                location.reload();
            }, 50);
        }
    }

    renderVictoryScreen(ctx) {
        if (!this.victoryScreenActive) return;

        const canvas = this.game.canvas;

        // Fond semi-transparent plus opaque
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cadre principal - PLUS COMPACT
        const boxWidth = 550;
        const boxHeight = 450;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = (canvas.height - boxHeight) / 2 - 10;

        // Fond du cadre
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Titre - plus petit
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⏰💔 IMPATIENCE ! ⏰💔', canvas.width / 2, boxY + 32);

        // Émoji - plus petit
        ctx.font = '36px Arial';
        ctx.fillText('🐑✨⏰', canvas.width / 2, boxY + 75);

        // Sous-titre - plus petit
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(i18n.t('game.ui.brokenClock'), canvas.width / 2, boxY + 105);

        // Messages - plus compacts
        ctx.textAlign = 'left';
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';

        let textY = boxY + 135;
        const leftMargin = boxX + 60;
        const maxWidth = boxWidth - 120;

        // Le Temps
        ctx.font = 'bold 12px Arial';
        ctx.fillText('⏰ Le Temps :', leftMargin, textY);
        ctx.font = '12px Arial';
        this.wrapText(ctx, '"Trop pressé d\'arriver, tu as voulu tout rapidement !"', leftMargin, textY + 16, maxWidth, 15);

        // Le Mouton
        textY += 45;
        ctx.font = 'bold 12px Arial';
        ctx.fillText('🐑 Le Mouton :', leftMargin, textY);
        ctx.font = '12px Arial';
        this.wrapText(ctx, '"Je n\'avais pas le temps d\'attendre... La porte était là !"', leftMargin, textY + 16, maxWidth, 15);

        // Un Ange
        textY += 45;
        ctx.font = 'bold 12px Arial';
        ctx.fillText('👼 Un Ange :', leftMargin, textY);
        ctx.font = '12px Arial';
        this.wrapText(ctx, '"Quand on veut tout rapidement, on rate l\'essentiel du moment présent. Prends le temps et profite de chaque instant."', leftMargin, textY + 16, maxWidth, 15);

        // Leçon
        textY += 65;
        ctx.font = 'bold 12px Arial';
        ctx.fillText('✝️ Leçon :', leftMargin, textY);
        ctx.font = '12px Arial';
        this.wrapText(ctx, '"Le temps est un allié, pas un ennemi. As-tu vraiment vécu le voyage ?"', leftMargin, textY + 16, maxWidth, 15);

        // Score final
        textY += 55;
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(`${i18n.t('game.ui.score')} : ${this.game.score.toLocaleString('fr-FR')} ${i18n.t('game.ui.souls')} 💖`, canvas.width / 2, textY);

        // Trophée débloqué
        ctx.font = 'bold 13px Arial';
        ctx.fillStyle = '#FF8C00';
        ctx.fillText('🏆 Horloge brisée - Maître du temps', canvas.width / 2, textY + 22);

        // Signature
        ctx.font = 'italic 11px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('- Emmanuel Payet', canvas.width / 2, textY + 40);

        // Bouton "Continuer" - plus petit
        const btn = this.continueButton;
        const gradient = ctx.createLinearGradient(btn.x, btn.y, btn.x + btn.width, btn.y);
        gradient.addColorStop(0, '#FF8C00');
        gradient.addColorStop(1, '#FFA500');

        ctx.fillStyle = gradient;
        ctx.fillRect(btn.x, btn.y, btn.width, btn.height);

        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.strokeRect(btn.x, btn.y, btn.width, btn.height);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(btn.text, btn.x + btn.width / 2, btn.y + btn.height / 2 + 5);
    }

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    
    showGameOverRich() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                        background:rgba(255,255,255,0.98);padding:20px 30px;border-radius:15px;
                        text-align:center;z-index:9999;border:3px solid #FF0000;
                        box-shadow:0 10px 40px rgba(0,0,0,0.5);max-width:700px;max-height:90vh;overflow-y:auto">
                <h2 style="color:#FF0000;font-size:26px;margin:10px 0">💥 GAME OVER - TROP LOURD ! 💥</h2>
                <div style="font-size:50px;margin:15px 0">🐑💰😵</div>
                <p style="font-size:18px;color:#DC143C;margin:10px 0">*BONK!* Tu t'es cogné sur la porte !</p>
                <div style="text-align:left;max-width:500px;margin:15px auto;font-size:14px;line-height:1.4">
                    <p style="margin:8px 0"><strong>🚪 La Porte :</strong><br>
                    "Désolé, tu es trop gros avec tous ces sacs d'or !"</p>
                    
                    <p style="margin:8px 0"><strong>🐑 Le Mouton (avec mèche) :</strong><br>
                    "Mais... mais... j'ai tant de richesses !"</p>
                    
                    <p style="margin:8px 0"><strong>👼 Un Ange :</strong><br>
                    "Tu ne peux pas emporter tes richesses au Paradis. Lâche prise et recommence !"</p>
                    
                    <p style="margin:8px 0"><strong>✝️ Leçon :</strong><br>
                    "La cupidité t'a alourdi. Le Paradis n'est pas pour ceux qui accumulent, 
                    mais pour ceux qui donnent. Essaie encore, mais voyage LÉGER !"</p>
                </div>
                <p style="margin:8px 0;font-size:15px"><strong>Or collecté : ${this.game.player.goldCollected} 💰 (Trop !)</strong></p>
                <p style="margin:8px 0;font-size:15px"><strong>Taille : ${(this.game.player.size * 100).toFixed(0)}% (Trop gros !)</strong></p>
                <p style="font-style:italic;color:#888;font-size:13px;margin:8px 0">- Emmanuel Payet</p>
                <button id="heaven-retry-btn" style="background:linear-gradient(45deg,#FFD700,#FFA500);
                        border:none;padding:12px 30px;border-radius:20px;font-size:16px;
                        font-weight:bold;cursor:pointer;margin-top:10px">🔄 Recommencer Plus Humble</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Ajouter le son toc au bouton
        document.getElementById('heaven-retry-btn').addEventListener('click', () => {
            if (this.game.audioManager && this.game.audioManager.initialized) {
                this.game.audioManager.playTokeSound();
            }
            document.querySelectorAll('[style*=\'position: fixed\']').forEach(el => el.style.display = 'none');
            setTimeout(() => location.reload(), 50);
        });
    }
    
    render(ctx) {
        // L'écran de victoire est maintenant rendu dans gameLoop pour être au premier plan
        // Ne pas le rendre ici pour éviter qu'il soit couvert par les bulles/notifications

        if (!this.visible || this.victoryScreenActive) return;

        // Aura céleste
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2,
            this.y + this.height/2,
            10,
            this.x + this.width/2,
            this.y + this.height/2,
            100
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 50, this.y - 50, this.width + 100, this.height + 100);

        // Porte dorée
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 4;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Croix
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + 20);
        ctx.lineTo(this.x + this.width/2, this.y + 60);
        ctx.moveTo(this.x + 15, this.y + 35);
        ctx.lineTo(this.x + this.width - 15, this.y + 35);
        ctx.stroke();

        // Inscription
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('☁️', this.x + this.width/2, this.y - 10);
        ctx.font = 'bold 10px Arial';
        ctx.fillText(i18n.t('game.ui.paradise'), this.x + this.width/2, this.y + this.height + 20);

        // Rayons divins
        const time = Date.now() * 0.001;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI / 4) + time;
            const x1 = this.x + this.width/2;
            const y1 = this.y + this.height/2;
            const x2 = x1 + Math.cos(angle) * 80;
            const y2 = y1 + Math.sin(angle) * 80;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}
