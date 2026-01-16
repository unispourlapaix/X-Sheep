// MessageSystem.js - Système d'affichage des messages
export class MessageSystem {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.createUI();
    }
    
    createUI() {
        this.container = document.createElement('div');
        this.container.id = 'narrative-box';
        this.container.style.cssText = `
            position: fixed;
            bottom: 150px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 15px 20px;
            border-radius: 25px;
            max-width: 300px;
            text-align: center;
            display: none;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
            border: 4px solid #333;
            z-index: 1000;
            position: relative;
        `;
        document.body.appendChild(this.container);
    }
    
    show(message, onContinue) {
        // Utiliser le système unifié de notifications si disponible
        if (this.game?.notificationSystem) {
            this.game.notificationSystem.showNarrative({
                text: message.hope,
                duration: 5000,
                onClose: () => {
                    // Notifier qu'un message a été popé
                    if (this.game?.obstacleManager) {
                        this.game.obstacleManager.onMessagePopped();
                    }
                    if (onContinue) onContinue();
                }
            });
        } else {
            // Fallback sur l'ancienne méthode
            this.showLegacy(message, onContinue);
        }
    }
    
    showLegacy(message, onContinue) {
        // Style bulle BD avec queue triangulaire
        this.container.innerHTML = `
            <div style="position:relative">
                <p style="color:#333;font-size:14px;font-weight:bold;line-height:1.4;margin:0">
                    💭 ${message.hope}
                </p>
                <div style="
                    position:absolute;
                    bottom:-20px;
                    left:50%;
                    transform:translateX(-50%);
                    width:0;
                    height:0;
                    border-left:15px solid transparent;
                    border-right:15px solid transparent;
                    border-top:20px solid white;
                "></div>
                <div style="
                    position:absolute;
                    bottom:-24px;
                    left:50%;
                    transform:translateX(-50%);
                    width:0;
                    height:0;
                    border-left:18px solid transparent;
                    border-right:18px solid transparent;
                    border-top:24px solid #333;
                "></div>
            </div>
        `;
        
        this.container.style.display = 'block';
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateX(-50%) scale(0.5)';
        
        // Animation d'apparition
        setTimeout(() => {
            this.container.style.transition = 'all 0.3s ease-out';
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateX(-50%) scale(1)';
        }, 10);
        
        // Explosion automatique après 5 secondes
        setTimeout(() => {
            // Animation d'explosion
            this.container.style.transition = 'all 0.2s ease-in';
            this.container.style.transform = 'translateX(-50%) scale(1.5)';
            this.container.style.opacity = '0';
            
            setTimeout(() => {
                this.container.style.display = 'none';
                // Notifier qu'un message a été popé
                if (this.game?.obstacleManager) {
                    this.game.obstacleManager.onMessagePopped();
                }
                if (onContinue) onContinue();
            }, 200);
        }, 5000);
        
        // Particules d'espoir
        this.createHopeParticles();
    }
    
    showDialogue(dialogue) {
        this.container.innerHTML = `
            <h3 style="color:#DAA520;font-size:28px;margin-bottom:20px">
                🐑 Dialogue Final 🐑
            </h3>
            <div style="text-align:left;margin:20px 0">
                <p style="margin-bottom:15px">
                    <strong>🐜 La Fourmi :</strong><br>
                    "${dialogue.ant}"
                </p>
                <p style="margin-bottom:15px">
                    <strong>🐐 Jojo la Chèvre :</strong><br>
                    "${dialogue.jojo}"
                </p>
                <p style="margin-bottom:15px">
                    <strong>🐝 L'Abeille :</strong><br>
                    "${dialogue.bee}"
                </p>
                <p style="margin-bottom:15px">
                    <strong>🐑 Le Mouton Courage :</strong><br>
                    "${dialogue.sheep}"
                </p>
                <p style="margin-top:20px;padding:15px;background:linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,165,0,0.2));border-radius:10px;border-left:4px solid #FFD700">
                    <strong style="color:#DAA520">✝️ Jésus :</strong><br>
                    <span style="font-size:18px;font-weight:bold;color:#333">"${dialogue.jesus}"</span>
                </p>
            </div>
            <p style="font-style:italic;color:#888;margin-top:20px">
                - Emmanuel Payet
            </p>
            <div style="text-align:center;margin-top:30px">
                <button onclick="window.openTrophyMenu()" style="
                    background:linear-gradient(135deg,#FFD700,#FFA500);
                    border:none;
                    padding:15px 30px;
                    border-radius:25px;
                    font-size:16px;
                    font-weight:bold;
                    color:#333;
                    cursor:pointer;
                    box-shadow:0 5px 15px rgba(0,0,0,0.3);
                ">🏆 Voir tous les messages (Trophées)</button>
            </div>
        `;
        
        this.container.style.display = 'block';
    }
    
    createHopeParticles() {
        // Animation particules (simplifié pour le système)
        console.log('✨ Particules d\'espoir créées');
    }
    
    hide() {
        this.container.style.display = 'none';
    }
}
