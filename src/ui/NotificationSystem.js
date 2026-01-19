// NotificationSystem.js - Système unifié de notifications BD
export class NotificationSystem {
    constructor(game) {
        this.game = game;
        this.activeBubbles = [];
        this.narrativeQueue = [];
        this.isShowingNarrative = false;
        this.maxSplashBubbles = 3; // Limiter le nombre de bulles splash simultanées
        
        // Anti-spam pour les bulles narratives
        this.lastNarrativeTime = 0;
        this.narrativeCooldown = 5000; // 5 secondes entre chaque bulle narrative
    }
    
    /**
     * Affiche une bulle BD style splash
     * @param {Object} options - Configuration de la bulle
     * @param {number} options.x - Position X (coordonnées canvas)
     * @param {number} options.y - Position Y (coordonnées canvas)
     * @param {string} options.icon - Emoji/icône
     * @param {string} options.text - Texte court
     * @param {string} options.color - Couleur de bordure
     * @param {number} options.duration - Durée en ms (défaut: 2000)
     * @param {Function} options.onClose - Callback à la fermeture
     */
    showSplash({ x, y, icon, text, color = '#FFD700', duration = 2000, onClose = null }) {
        // Limiter le nombre de bulles splash
        const splashBubbles = this.activeBubbles.filter(b => b.classList.contains('splash-bubble'));
        if (splashBubbles.length >= this.maxSplashBubbles) {
            // Supprimer la plus ancienne
            splashBubbles[0].remove();
            const index = this.activeBubbles.indexOf(splashBubbles[0]);
            if (index > -1) this.activeBubbles.splice(index, 1);
        }
        
        // Position au centre-haut du canvas pour les proverbes
        const canvas = this.game.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        const centerX = canvasRect.left + canvasRect.width / 2;
        const topY = canvasRect.top + 100; // 100px du haut du canvas
        
        const bubble = document.createElement('div');
        bubble.className = 'splash-bubble';
        bubble.style.cssText = `
            position: fixed;
            top: ${topY}px;
            left: ${centerX}px;
            transform: translate(-50%, 0) rotate(-2deg);
            background: white;
            padding: 12px 20px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 0 0 4px ${color}, 0 0 0 8px white, 0 8px 20px rgba(0, 0, 0, 0.4);
            border: 3px solid black;
            z-index: 2000;
            font-family: 'Comic Sans MS', 'Arial Black', sans-serif;
            pointer-events: none;
            max-width: 500px;
            word-wrap: break-word;
        `;
        
        bubble.innerHTML = `
            <div style="font-size:28px;margin-bottom:3px;text-shadow: 2px 2px 0 ${color}">${icon}</div>
            <div style="font-size:14px;font-weight:900;color:black;letter-spacing:1px;text-transform:uppercase">${text}!</div>
        `;
        
        document.body.appendChild(bubble);
        this.activeBubbles.push(bubble);
        
        // Nettoyage automatique
        setTimeout(() => {
            bubble.remove();
            const index = this.activeBubbles.indexOf(bubble);
            if (index > -1) this.activeBubbles.splice(index, 1);
            if (onClose) onClose();
        }, duration);
    }
    
    /**
     * Affiche une petite bulle narrative avec file d'attente
     * @param {Object} options - Configuration
     */
    showNarrative({ text, duration = 5000, onClose = null }) {
        // Anti-spam: vérifier le cooldown
        const now = Date.now();
        if (now - this.lastNarrativeTime < this.narrativeCooldown) {
            console.log('🚫 Bulle narrative bloquée (anti-spam)');
            // Appeler quand même onClose pour ne pas bloquer le jeu
            if (onClose) onClose();
            return;
        }
        
        this.lastNarrativeTime = now;
        
        // Ajouter à la file d'attente
        this.narrativeQueue.push({ text, duration, onClose });
        
        // Traiter la file si rien n'est en cours
        if (!this.isShowingNarrative) {
            this.processNarrativeQueue();
        }
    }
    
    processNarrativeQueue() {
        if (this.narrativeQueue.length === 0) {
            this.isShowingNarrative = false;
            return;
        }
        
        this.isShowingNarrative = true;
        const { text, duration, onClose } = this.narrativeQueue.shift();
        
        const bubble = document.createElement('div');
        bubble.className = 'narrative-bubble';
        
        bubble.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 25px;
            max-width: min(300px, calc(100vw - 40px));
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
            border: 4px solid #333;
            z-index: 1000;
            font-family: 'Comic Sans MS', Arial, sans-serif;
        `;
        
        bubble.innerHTML = `
            <div style="position:relative">
                <p style="color:#333;font-size:14px;font-weight:bold;line-height:1.4;margin:0">
                    💭 ${text}
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
        
        document.body.appendChild(bubble);
        this.activeBubbles.push(bubble);
        
        // Animation fade-in
        bubble.style.opacity = '0';
        setTimeout(() => {
            bubble.style.transition = 'opacity 0.3s';
            bubble.style.opacity = '1';
        }, 10);
        
        // Nettoyage automatique avec explosion
        setTimeout(() => {
            bubble.style.transition = 'all 0.2s';
            bubble.style.transform = 'translateX(-50%) scale(1.5)';
            bubble.style.opacity = '0';
            
            setTimeout(() => {
                bubble.remove();
                const index = this.activeBubbles.indexOf(bubble);
                if (index > -1) this.activeBubbles.splice(index, 1);
                if (onClose) onClose();
                
                // Traiter la prochaine bulle dans la file
                this.processNarrativeQueue();
            }, 200);
        }, duration);
    }
    
    /**
     * Nettoie toutes les bulles actives
     */
    clearAll() {
        this.activeBubbles.forEach(bubble => bubble.remove());
        this.activeBubbles = [];
    }
}
