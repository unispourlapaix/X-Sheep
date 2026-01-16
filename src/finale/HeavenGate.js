// HeavenGate.js - La Porte du Paradis (fin)
import { GameConfig } from '../config/GameConfig.js';

export class HeavenGate {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.x = GameConfig.CANVAS_WIDTH - GameConfig.HEAVEN_GATE.POSITION_X_OFFSET;
        this.y = (GameConfig.CANVAS_HEIGHT - GameConfig.HEAVEN_GATE.HEIGHT) / 2;
        this.width = GameConfig.HEAVEN_GATE.WIDTH;
        this.height = GameConfig.HEAVEN_GATE.HEIGHT;
        this.triggered = false;
    }
    
    update() {
        // Faire apparaître la porte après suffisamment d'obstacles
        if (this.game.obstaclesCleared >= 30 && !this.visible) {
            this.visible = true;
            console.log('🚪 La Porte du Paradis apparaît !');
            
            // Afficher un message d'avertissement
            if (this.game.notificationSystem) {
                this.game.notificationSystem.showNarrative({
                    text: 'ATTENTION À TA VIE !',
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
        this.game.paused = true;
        
        // Animation de rétrécissement
        let shrinkCount = 0;
        const shrinkInterval = setInterval(() => {
            if (this.game.player.size > 0.5) {
                this.game.player.size -= 0.05;
                this.game.player.x += 2;
            }
            
            // Particules célestes
            this.game.renderer.addParticle(
                this.game.player.x,
                this.game.player.y,
                ['✨', '🌟', '👼', '🕊️', '💖'][Math.floor(Math.random() * 5)],
                '#FFD700'
            );
            
            shrinkCount++;
            if (shrinkCount > 30) {
                clearInterval(shrinkInterval);
                this.showVictoryScreen();
            }
        }, 50);
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
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                        background:rgba(255,255,255,0.98);padding:40px;border-radius:20px;
                        text-align:center;z-index:9999;border:3px solid #FFD700;
                        box-shadow:0 10px 40px rgba(0,0,0,0.5)">
                <h2 style="color:#FFD700;font-size:36px">🎉 VICTOIRE CÉLESTE ! 🎉</h2>
                <div style="font-size:80px;margin:30px 0">🐑✨</div>
                <p style="font-size:28px;color:#DAA520">☁️ BIENVENUE AU PARADIS ! ☁️</p>
                <br>
                <div style="text-align:left;max-width:600px;margin:20px auto">
                    <p><strong>👼 Les Anges :</strong><br>
                    "Bienvenue petit frère ! Tu as compris la vraie leçon !"</p><br>
                    
                    <p><strong>🐑 Le Mouton :</strong><br>
                    "J'ai laissé mes richesses derrière moi. Mon cœur est léger !"</p><br>
                    
                    <p><strong>✝️ Message Divin :</strong><br>
                    "Il est plus facile à un chameau de passer par le trou d'une aiguille qu'à un riche d'entrer dans le royaume de Dieu. 
                    Mais toi, tu as choisi la VRAIE richesse : l'amour, la générosité, l'humilité."</p>
                </div>
                <br>
                <p style="font-size:20px"><strong>Score Final : ${Math.floor(this.game.score/10)} âmes touchées 💖</strong></p>
                <p style="font-style:italic;color:#888">- Emmanuel Payet</p>
                <br>
                <button onclick="location.reload()" style="background:linear-gradient(45deg,#FFD700,#FFA500);
                        border:none;padding:15px 40px;border-radius:25px;font-size:18px;
                        font-weight:bold;cursor:pointer">👑 TU AS GAGNÉ !</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    showGameOverRich() {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                        background:rgba(255,255,255,0.98);padding:40px;border-radius:20px;
                        text-align:center;z-index:9999;border:3px solid #FF0000;
                        box-shadow:0 10px 40px rgba(0,0,0,0.5)">
                <h2 style="color:#FF0000;font-size:36px">💥 GAME OVER - TROP LOURD ! 💥</h2>
                <div style="font-size:80px;margin:30px 0">🐑💰😵</div>
                <p style="font-size:24px;color:#DC143C">*BONK!* Tu t'es cogné sur la porte !</p>
                <br>
                <div style="text-align:left;max-width:600px;margin:20px auto">
                    <p><strong>🚪 La Porte :</strong><br>
                    "Désolé, tu es trop gros avec tous ces sacs d'or !"</p><br>
                    
                    <p><strong>🐑 Le Mouton (avec mèche) :</strong><br>
                    "Mais... mais... j'ai tant de richesses !"</p><br>
                    
                    <p><strong>👼 Un Ange :</strong><br>
                    "Tu ne peux pas emporter tes richesses au Paradis. Lâche prise et recommence !"</p><br>
                    
                    <p><strong>✝️ Leçon :</strong><br>
                    "La cupidité t'a alourdi. Le Paradis n'est pas pour ceux qui accumulent, 
                    mais pour ceux qui donnent. Essaie encore, mais voyage LÉGER !"</p>
                </div>
                <br>
                <p><strong>Or collecté : ${this.game.player.goldCollected} 💰 (Trop !)</strong></p>
                <p><strong>Taille : ${(this.game.player.size * 100).toFixed(0)}% (Trop gros !)</strong></p>
                <p style="font-style:italic;color:#888">- Emmanuel Payet</p>
                <br>
                <button onclick="location.reload()" style="background:linear-gradient(45deg,#FFD700,#FFA500);
                        border:none;padding:15px 40px;border-radius:25px;font-size:18px;
                        font-weight:bold;cursor:pointer">🔄 Recommencer Plus Humble</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    render(ctx) {
        if (!this.visible) return;
        
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
        ctx.fillText('PARADIS', this.x + this.width/2, this.y + this.height + 20);
        
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
