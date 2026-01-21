// TrophySystem.js - Système de trophées et XP
import { NarrativeData } from './narrativeData.js';

export class TrophySystem {
    constructor() {
        this.trophies = new Map(); // obstacleId -> {unlocked: boolean, xp: number, readCount: number}
        this.totalXP = 0;
        this.loadFromStorage();
        this.createUI();
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
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #333;
            padding: 15px 25px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 5px 20px rgba(255,215,0,0.5);
            z-index: 2000;
            animation: slideInRight 0.5s, fadeOut 0.5s 2.5s;
        `;
        
        const message = NarrativeData[obstacleId];
        notification.innerHTML = `
            🏆 <strong>Nouveau Trophée !</strong><br>
            <span style="font-size:14px">${message?.hope || 'Trophée débloqué'}</span><br>
            <span style="color:#8B4513">+${xp} XP</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    createUI() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
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
        
        // Fond dégradé
        const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#1a3a52');
        gradient.addColorStop(1, '#0a0e27');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1080);
        
        // Étoiles
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 1080;
            const y = Math.random() * 1080;
            const size = Math.random() * 3 + 1;
            ctx.fillRect(x, y, size, size);
        }
        
        // Titre X-SHEEP
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.fillText('X-SHEEP', 540, 100);
        ctx.shadowBlur = 0;
        
        // Emoji trophée
        ctx.font = '120px Arial';
        ctx.fillText('🏆', 540, 250);
        
        // Titre du trophée
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(message.hope, 540, 340);
        
        // Label
        ctx.fillStyle = '#87CEEB';
        ctx.font = '24px Arial';
        ctx.fillText(this.getObstacleLabel(obstacleId), 540, 380);
        
        // Cadre du message
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(80, 420, 920, 500);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(80, 420, 920, 500);
        
        // Message
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        
        // Découper le texte en lignes
        const words = message.text.split(' ');
        let line = '';
        let y = 480;
        const maxWidth = 860;
        const lineHeight = 36;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, 120, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 120, y);
        
        // XP
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${trophy.xp} XP`, 540, 980);
        
        // Bas de page
        ctx.fillStyle = '#87CEEB';
        ctx.font = '20px Arial';
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
            nuclear: '☢️ Nucléaire',
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
            grace: '✝️ La Grâce - Jésus'
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
