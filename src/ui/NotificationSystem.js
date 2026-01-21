// NotificationSystem.js - Système unifié de notifications BD (100% canvas)
export class NotificationSystem {
    constructor(game) {
        this.game = game;
        this.canvasBubbles = []; // Toutes les bulles sur canvas
        this.narrativeQueue = [];
        this.isShowingNarrative = false;
        this.maxSplashBubbles = 3; // Limiter le nombre de bulles splash simultanées
        
        // Anti-spam pour les bulles narratives
        this.lastNarrativeTime = 0;
        this.narrativeCooldown = 5000; // 5 secondes entre chaque bulle narrative
    }
    
    /**
     * Met à jour les bulles canvas (fade in/out)
     */
    updateCanvasBubbles() {
        for (let i = this.canvasBubbles.length - 1; i >= 0; i--) {
            const bubble = this.canvasBubbles[i];
            bubble.age += 16; // ~60fps
            
            // Fade in pendant les 300 premières ms
            if (bubble.age < 300) {
                bubble.opacity = bubble.age / 300;
            }
            // Fade out pendant les 300 dernières ms
            else if (bubble.age > bubble.duration - 300) {
                bubble.opacity = (bubble.duration - bubble.age) / 300;
            } else {
                bubble.opacity = 1;
            }
            
            // Supprimer si expiré
            if (bubble.age >= bubble.duration) {
                if (bubble.onClose) bubble.onClose();
                this.canvasBubbles.splice(i, 1);
            }
        }
    }
    
    /**
     * Dessine toutes les bulles canvas
     */
    drawCanvasBubbles(ctx, renderer) {
        const isVoxel = renderer?.renderMode === 'voxel';
        const voxelRenderer = renderer?.voxelRenderer;
        
        this.canvasBubbles.forEach(bubble => {
            ctx.save();
            ctx.globalAlpha = bubble.opacity;
            
            if (bubble.type === 'splash') {
                if (isVoxel && voxelRenderer) {
                    // Mode voxel: style Minecraft
                    voxelRenderer.drawVoxelSpeechBubble(
                        bubble.x - bubble.width / 2,
                        bubble.y,
                        bubble.width,
                        bubble.height,
                        bubble.icon,
                        bubble.text,
                        bubble.borderColor || '#000000'
                    );
                } else {
                    // Mode normal: style BD classique
                    this.drawComicBubble(ctx, bubble);
                }
            } else if (bubble.type === 'narrative') {
                if (isVoxel && voxelRenderer) {
                    voxelRenderer.drawVoxelNarrativeBubble(
                        bubble.x,
                        bubble.y,
                        bubble.text,
                        bubble.maxWidth
                    );
                } else {
                    this.drawComicNarrative(ctx, bubble);
                }
            }
            
            ctx.restore();
        });
    }
    
    /**
     * Dessine une bulle BD classique style Comic
     */
    drawComicBubble(ctx, bubble) {
        const x = bubble.x;
        const y = bubble.y;
        const w = bubble.width;
        const h = bubble.height;
        const radius = 20;
        
        // Ombre portée
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.drawRoundRect(ctx, x - w/2 + 5, y + 5, w, h, radius);
        ctx.fill();
        
        // Fond blanc brillant
        ctx.fillStyle = '#FFFFFF';
        this.drawRoundRect(ctx, x - w/2, y, w, h, radius);
        ctx.fill();
        
        // Bordure noire épaisse style BD
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        this.drawRoundRect(ctx, x - w/2, y, w, h, radius);
        ctx.stroke();
        
        // Bordure intérieure colorée (accent)
        ctx.strokeStyle = bubble.borderColor || '#FFD700';
        ctx.lineWidth = 2;
        this.drawRoundRect(ctx, x - w/2 + 4, y + 4, w - 8, h - 8, radius - 4);
        ctx.stroke();
        
        // Étoiles décoratives style BD (coins)
        ctx.fillStyle = '#FFD700';
        const starPositions = [
            [x - w/2 + 15, y + 10],
            [x + w/2 - 15, y + 10],
            [x - w/2 + 15, y + h - 10],
            [x + w/2 - 15, y + h - 10]
        ];
        starPositions.forEach(([sx, sy]) => {
            this.drawStar(ctx, sx, sy, 4, 5, 2);
        });
        
        // Icône géante au centre-haut
        if (bubble.icon) {
            ctx.font = 'bold 42px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';
            ctx.fillText(bubble.icon, x, y + 15);
        }
        
        // Texte en gras style BD
        if (bubble.text) {
            ctx.font = 'bold 16px "Arial Black", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';
            
            // Effet de contour pour le texte
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.strokeText(bubble.text.toUpperCase(), x, y + (bubble.icon ? 65 : 15));
            ctx.fillText(bubble.text.toUpperCase(), x, y + (bubble.icon ? 65 : 15));
        }
    }
    
    /**
     * Dessine une bulle narrative compacte style BD
     */
    drawComicNarrative(ctx, bubble) {
        const x = bubble.x;
        const y = bubble.y;
        const maxWidth = bubble.maxWidth || 280;
        const padding = 15;
        
        // Découper le texte en lignes
        ctx.font = 'bold 14px Arial';
        const words = bubble.text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth - 2*padding && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        
        // Calculer dimensions
        let textWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            textWidth = Math.max(textWidth, metrics.width);
        });
        
        const w = textWidth + 2*padding + 30; // +30 pour icône 💭
        const h = lines.length * 20 + 2*padding;
        const radius = 15;
        
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        this.drawRoundRect(ctx, x + 4, y + 4, w, h, radius);
        ctx.fill();
        
        // Fond blanc
        ctx.fillStyle = '#FFFEF5'; // Blanc cassé
        this.drawRoundRect(ctx, x, y, w, h, radius);
        ctx.fill();
        
        // Bordure noire
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        this.drawRoundRect(ctx, x, y, w, h, radius);
        ctx.stroke();
        
        // Pointe de bulle (triangle vers le bas)
        const tipX = x + w / 2;
        const tipY = y + h;
        ctx.fillStyle = '#FFFEF5';
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - 10, tipY + 15);
        ctx.lineTo(tipX + 10, tipY + 15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Icône 💭
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#666';
        ctx.fillText('💭', x + 10, y + padding - 2);
        
        // Texte
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        lines.forEach((line, i) => {
            ctx.fillText(line, x + 40, y + padding + i * 20);
        });
    }
    
    /**
     * Dessine un rectangle arrondi
     */
    drawRoundRect(ctx, x, y, w, h, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    /**
     * Dessine une étoile (effet BD)
     */
    drawStar(ctx, x, y, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
            rot += step;
        }
        
        ctx.lineTo(x, y - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * Affiche une bulle BD style splash (100% canvas)
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
        // Limiter le nombre de bulles
        const splashBubbles = this.canvasBubbles.filter(b => b.type === 'splash');
        if (splashBubbles.length >= this.maxSplashBubbles) {
            const oldest = splashBubbles[0];
            if (oldest.onClose) oldest.onClose();
            const index = this.canvasBubbles.indexOf(oldest);
            if (index > -1) this.canvasBubbles.splice(index, 1);
        }
        
        // Créer bulle canvas (toujours canvas, quel que soit le mode)
        this.canvasBubbles.push({
            type: 'splash',
            x: this.game.canvas.width / 2, // Centre horizontal
            y: 80, // Haut du canvas
            width: 350,
            height: 120,
            icon: icon,
            text: text,
            borderColor: color,
            age: 0,
            duration: duration,
            opacity: 0,
            onClose: onClose
        });
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
        
        // Toujours utiliser le canvas (quel que soit le mode)
        this.canvasBubbles.push({
            type: 'narrative',
            x: this.game.canvas.width - 320, // Coin droit avec marge
            y: 20,
            text: text,
            maxWidth: 280,
            age: 0,
            duration: duration,
            opacity: 0,
            onClose: () => {
                if (onClose) onClose();
                this.processNarrativeQueue();
            }
        });
    }
    
    /**
     * Nettoie toutes les bulles actives
     */
    clearAll() {
        this.canvasBubbles = [];
    }
}
