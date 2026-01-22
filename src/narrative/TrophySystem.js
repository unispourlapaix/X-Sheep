// TrophySystem.js - Système de trophées et XP
import { NarrativeData } from './narrativeData.js';

export class TrophySystem {
    constructor() {
        this.trophies = new Map(); // obstacleId -> {unlocked: boolean, xp: number, readCount: number}
        this.totalXP = 0;
        this.loadFromStorage();
        this.createUI();

        // Notifications actives pour rendu canvas
        this.activeNotifications = [];
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('mouton_trophies');
        if (saved) {
            const data = JSON.parse(saved);
            this.trophies = new Map(data.trophies);
            this.totalXP = data.totalXP || 0;
        }
    }
    
    saveToStorage() {
        const data = {
            trophies: Array.from(this.trophies.entries()),
            totalXP: this.totalXP
        };
        localStorage.setItem('mouton_trophies', JSON.stringify(data));
    }
    
    unlockTrophy(obstacleId) {
        if (!this.trophies.has(obstacleId)) {
            const xpGain = 50;
            this.trophies.set(obstacleId, {
                unlocked: true,
                xp: xpGain,
                readCount: 0,
                unlockedAt: Date.now()
            });
            this.totalXP += xpGain;
            this.saveToStorage();
            this.showXPNotification(obstacleId, xpGain);
            return true;
        }
        return false;
    }
    
    showXPNotification(obstacleId, xp) {
        const message = NarrativeData[obstacleId];

        // Créer une notification pour rendu canvas
        const notification = {
            id: Date.now(),
            obstacleId: obstacleId,
            xp: xp,
            hope: message?.hope || 'Trophée débloqué',
            startTime: Date.now(),
            duration: 3000, // 3 secondes
            x: 0, // Sera calculé dans render
            y: 100,
            opacity: 1,
            slideProgress: 0 // 0-1 pour l'animation de slide
        };

        this.activeNotifications.push(notification);

        // Retirer automatiquement après la durée
        setTimeout(() => {
            const index = this.activeNotifications.findIndex(n => n.id === notification.id);
            if (index > -1) {
                this.activeNotifications.splice(index, 1);
            }
        }, 3000);
    }

    updateNotifications() {
        const now = Date.now();

        for (let i = this.activeNotifications.length - 1; i >= 0; i--) {
            const notif = this.activeNotifications[i];
            const elapsed = now - notif.startTime;
            const progress = elapsed / notif.duration;

            // Animation slide in (première demi-seconde)
            if (elapsed < 500) {
                notif.slideProgress = elapsed / 500;
            } else {
                notif.slideProgress = 1;
            }

            // Animation fade out (dernière demi-seconde)
            if (progress > 0.833) { // 2.5 / 3 = 0.833
                notif.opacity = 1 - ((progress - 0.833) / 0.167);
            } else {
                notif.opacity = 1;
            }
        }
    }

    renderNotifications(ctx, canvasWidth) {
        this.updateNotifications();

        for (let i = 0; i < this.activeNotifications.length; i++) {
            const notif = this.activeNotifications[i];

            // Dimensions de la notification
            const width = 300;
            const height = 90;
            const padding = 20;

            // Position avec animation slide in depuis la droite
            const targetX = canvasWidth - width - padding;
            notif.x = targetX + (1 - notif.slideProgress) * 400; // Commence 400px hors écran
            notif.y = 100 + (i * (height + 10)); // Empiler verticalement

            // Sauvegarder le contexte
            ctx.save();
            ctx.globalAlpha = notif.opacity;

            // Fond avec gradient
            const gradient = ctx.createLinearGradient(notif.x, notif.y, notif.x + width, notif.y);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
            ctx.fillStyle = gradient;

            // Ombre portée
            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 5;

            // Rectangle arrondi
            this.roundRect(ctx, notif.x, notif.y, width, height, 15);
            ctx.fill();

            // Réinitialiser l'ombre
            ctx.shadowBlur = 0;

            // Bordure
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            this.roundRect(ctx, notif.x, notif.y, width, height, 15);
            ctx.stroke();

            // Texte
            ctx.fillStyle = '#333';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('🏆 Nouveau Trophée !', notif.x + 15, notif.y + 25);

            ctx.font = '14px Arial';
            ctx.fillText(notif.hope, notif.x + 15, notif.y + 50);

            ctx.fillStyle = '#8B4513';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`+${notif.xp} XP`, notif.x + 15, notif.y + 72);

            ctx.restore();
        }
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    createUI() {
        // Container pour le menu des trophées (reste en HTML)
        this.container = document.createElement('div');
        this.container.id = 'trophy-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: none;
            overflow-y: auto;
            z-index: 3000;
            padding: 40px 20px;
        `;
        document.body.appendChild(this.container);
    }
    
    show() {
        this.render();
        this.container.style.display = 'block';
    }
    
    hide() {
        this.container.style.display = 'none';
    }
    
    render() {
        const unlockedCount = this.trophies.size;
        const totalCount = Object.keys(NarrativeData).filter(key => key !== 'finalDialogue').length;
        const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
        
        this.container.innerHTML = `
            <div style="max-width:900px;margin:0 auto;color:#FFF">
                <div style="text-align:center;margin-bottom:30px">
                    <h1 style="color:#FFD700;font-size:36px;margin:0">🏆 TROPHÉES & MESSAGES 🏆</h1>
                    <p style="color:#87CEEB;font-size:18px;margin:10px 0">Par Emmanuel Payet</p>
                    <div style="background:rgba(255,215,0,0.2);padding:15px;border-radius:15px;margin:20px 0">
                        <p style="font-size:20px;margin:5px 0">
                            <strong>XP Total : ${this.totalXP}</strong>
                        </p>
                        <p style="font-size:16px;margin:5px 0">
                            Trophées débloqués : ${unlockedCount} / ${totalCount} (${progress}%)
                        </p>
                        <div style="background:rgba(0,0,0,0.3);height:20px;border-radius:10px;overflow:hidden;margin:10px 0">
                            <div style="background:linear-gradient(90deg,#FFD700,#FFA500);height:100%;width:${progress}%;transition:width 0.5s"></div>
                        </div>
                    </div>
                </div>
                
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:20px;margin-bottom:80px">
                    ${this.renderTrophies()}
                </div>
                
                <div style="text-align:center">
                    <button onclick="window.closeTrophyMenu()" style="
                        background:linear-gradient(135deg,#FFD700,#FFA500);
                        border:none;
                        padding:15px 40px;
                        border-radius:25px;
                        font-size:18px;
                        font-weight:bold;
                        color:#333;
                        cursor:pointer;
                        box-shadow:0 5px 15px rgba(0,0,0,0.3);
                    ">🚪 Fermer</button>
                </div>
            </div>
        `;
        
        window.closeTrophyMenu = () => this.hide();
        window.shareTrophy = (obstacleId) => this.shareTrophyImage(obstacleId);
    }
    
    shareTrophyImage(obstacleId) {
        const message = NarrativeData[obstacleId];
        const trophy = this.trophies.get(obstacleId);
        if (!message || !trophy) return;
        
        // Créer un canvas temporaire pour générer l'image
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        
        // Fond dégradé style pixel art
        const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);
        
        // Grille pixel art en fond
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < 1080; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 1080);
            ctx.stroke();
        }
        for (let y = 0; y < 1080; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1080, y);
            ctx.stroke();
        }
        
        // Étoiles pixel art style neige (+ blancs)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.textAlign = 'center';
        for (let i = 0; i < 40; i++) {
            const x = Math.floor(Math.random() * 27) * gridSize + gridSize/2;
            const y = Math.floor(Math.random() * 27) * gridSize + gridSize/2;
            ctx.fillText('+', x, y);
        }
        
        // Titre X-SHEEP avec effet pixelisé
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 70px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 30;
        ctx.fillText('X-SHEEP', 540, 100);
        ctx.shadowBlur = 0;
        
        // Scène: Mouton poursuivi par un boss
        const sceneY = 180;
        const blockSize = 8;
        
        // Boss aléatoire
        const bosses = ['🦁', '🐺', '🐉', '👿', '💀', '🦈'];
        const randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
        
        // Dessiner le boss en pixel art (à gauche)
        ctx.font = '100px Arial';
        ctx.fillText(randomBoss, 200, sceneY + 100);
        
        // Flèche de poursuite
        ctx.fillStyle = '#FF6B6B';
        for (let i = 0; i < 3; i++) {
            const x = 320 + i * 40;
            ctx.fillRect(x, sceneY + 60, 30, blockSize * 2);
            ctx.fillRect(x + 30, sceneY + 52, blockSize * 2, blockSize * 4);
        }
        
        // Dessiner le mouton en pixel art (à droite, qui fuit)
        ctx.fillText('🐑', 540, sceneY + 100);
        
        // Effet de mouvement (lignes de vitesse)
        ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
        for (let i = 0; i < 5; i++) {
            const x = 650 + i * 30;
            const length = 40 - i * 6;
            ctx.fillRect(x, sceneY + 50 + i * 10, length, blockSize);
        }
        
        // Emoji trophée avec cadre pixel art
        ctx.font = '100px Arial';
        ctx.fillText('🏆', 540, 420);
        
        // Cadre pixelisé autour du trophée
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 6;
        const frameSize = 140;
        ctx.strokeRect(540 - frameSize/2, 340, frameSize, frameSize);
        ctx.strokeRect(540 - frameSize/2 - 8, 332, frameSize + 16, frameSize + 16);
        
        // Titre du trophée
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 40px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(message.hope, 540, 540);
        
        // Label avec fond pixel
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(340, 555, 400, 40);
        ctx.fillStyle = '#87CEEB';
        ctx.font = 'bold 24px "Courier New", monospace';
        ctx.fillText(this.getObstacleLabel(obstacleId), 540, 582);
        
        // Cadre du message style pixel art
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 6;
        const msgX = 80, msgY = 630, msgW = 920, msgH = 300;
        
        // Bordure externe
        ctx.strokeRect(msgX, msgY, msgW, msgH);
        // Bordure interne
        ctx.strokeRect(msgX + 10, msgY + 10, msgW - 20, msgH - 20);
        // Fond
        ctx.fillStyle = 'rgba(10, 14, 39, 0.9)';
        ctx.fillRect(msgX + 10, msgY + 10, msgW - 20, msgH - 20);
        
        // Message avec police monospace
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '22px "Courier New", monospace';
        ctx.textAlign = 'left';
        
        // Découper le texte en lignes
        const words = message.text.split(' ');
        let line = '';
        let y = msgY + 55;
        const maxWidth = msgW - 80;
        const lineHeight = 32;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, msgX + 40, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, msgX + 40, y);
        
        // XP avec cadre pixel
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(420, 960, 240, 50);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`+${trophy.xp} XP`, 540, 995);
        
        // Bas de page
        ctx.fillStyle = '#87CEEB';
        ctx.font = '20px "Courier New", monospace';
        ctx.fillText('Par Emmanuel Payet', 540, 1050);
        
        // Télécharger l'image
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `xsheep-trophee-${obstacleId}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }
    
    renderTrophies() {
        let html = '';
        
        for (const [obstacleId, message] of Object.entries(NarrativeData)) {
            if (obstacleId === 'finalDialogue') continue;
            
            const trophy = this.trophies.get(obstacleId);
            const unlocked = trophy !== undefined;
            
            html += `
                <div style="
                    background:${unlocked ? 'linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,165,0,0.15))' : 'rgba(50,50,50,0.5)'};
                    border:2px solid ${unlocked ? '#FFD700' : '#666'};
                    border-radius:15px;
                    padding:20px;
                    position:relative;
                    ${unlocked ? '' : 'filter:grayscale(1);opacity:0.6;'}
                ">
                    <div style="display:flex;align-items:center;margin-bottom:10px">
                        <span style="font-size:32px;margin-right:10px">${unlocked ? '🏆' : '🔒'}</span>
                        <div style="flex:1">
                            <h3 style="color:${unlocked ? '#FFD700' : '#888'};margin:0;font-size:18px">
                                ${message.hope}
                            </h3>
                            <p style="color:#AAA;font-size:12px;margin:5px 0">
                                ${this.getObstacleLabel(obstacleId)}
                            </p>
                        </div>
                        ${unlocked ? `<span style="color:#FFD700;font-weight:bold">+${trophy.xp} XP</span>` : ''}
                    </div>
                    
                    ${unlocked ? `
                        <div style="
                            background:rgba(0,0,0,0.3);
                            padding:15px;
                            border-radius:10px;
                            border-left:3px solid #FFD700;
                            margin-top:10px;
                        ">
                            <p style="color:#FFF;line-height:1.6;margin:0;font-size:14px">
                                ${message.text}
                            </p>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                            <p style="color:#666;font-size:11px;margin:0">
                                Débloqué le ${new Date(trophy.unlockedAt).toLocaleDateString('fr-FR')}
                            </p>
                            <button onclick="window.shareTrophy('${obstacleId}')" style="
                                background:linear-gradient(135deg,#FFD700,#FFA500);
                                border:none;
                                padding:8px 15px;
                                border-radius:8px;
                                font-size:12px;
                                font-weight:bold;
                                color:#333;
                                cursor:pointer;
                                box-shadow:0 2px 5px rgba(0,0,0,0.3);
                            ">📤 Partager</button>
                        </div>
                    ` : `
                        <p style="color:#666;font-style:italic;margin:10px 0 0 0">
                            Passe cet obstacle pour débloquer le message...
                        </p>
                    `}
                </div>
            `;
        }
        
        return html;
    }
    
    getObstacleLabel(id) {
        const labels = {
            wheelchair: '♿ Fauteuil Roulant',
            car_accident: '🚗 Accident',
            coffin: '⚰️ Cercueil',
            safe: '🏦 Coffre-Fort',
            house: '🏠 Maison Brisée',
            wolf: '🐺 Loup',
            black_sheep: '🐑 Mouton Noir',
            addiction: '📦 Addiction',
            death: '💀 Mort',
            cancer: '🎗️ Cancer',
            nuclear: '☢️ Reaction antiNucléaire',
            meteor: '☄️ Météorite',
            procrastination: '⏰ Procrastination',
            anger: '😡 Colère',
            madness: '🌀 Folie',
            avarice: '💰 Avarice',
            luxure: '💋 Luxure',
            nepotisme: '🤝 Népotisme',
            selection: '👥 Sélection',
            esclavage: '⛓️ Esclavage',
            surexploitation: '🏭 Surexploitation',
            white_sheep: '🐑✨ Mouton Blanc - La Grâce',
            charity: '💝 Charité',
            gold_coin: '💰 Pièce d\'Or - Liberté',
            grace: '✝️ La Grâce - Jésus',
            impatient: '⏰💔 Horloge brisée - Maître du temps'
        };
        return labels[id] || 'Obstacle';
    }
    
    getTotalXP() {
        return this.totalXP;
    }
    
    getProgress() {
        const total = Object.keys(NarrativeData).filter(key => key !== 'finalDialogue').length;
        return {
            unlocked: this.trophies.size,
            total: total,
            percentage: total > 0 ? Math.round((this.trophies.size / total) * 100) : 0
        };
    }
}
