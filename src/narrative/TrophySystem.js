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
                        <p style="color:#666;font-size:11px;margin:10px 0 0 0;text-align:right">
                            Débloqué le ${new Date(trophy.unlockedAt).toLocaleDateString('fr-FR')}
                        </p>
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
            surexploitation: '🏭 Surexploitation'
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
