// MouseControls.js - Contrôle souris libre
export class MouseControls {
    constructor(game) {
        this.game = game;
        this.mouseDown = false;
        
        this.mouseDownTime = 0;
        this.clickStartPos = null;
        this.currentMousePos = null;
        
        // Double-clic pour bombe spéciale
        this.lastClickTime = 0;
        this.doubleClickDelay = 300; // 300ms pour détecter le double-clic
        
        this.onMouseDown = this.handleMouseDown.bind(this);
        this.onMouseMove = this.handleMouseMove.bind(this);
        this.onMouseUp = this.handleMouseUp.bind(this);
        
        const canvas = game.canvas;
        canvas.addEventListener('mousedown', this.onMouseDown);
        canvas.addEventListener('mousemove', this.onMouseMove);
        canvas.addEventListener('mouseup', this.onMouseUp);
    }
    
    handleMouseDown(e) {
        // Skip intro avec clic
        if (this.game.introSequence && this.game.introSequence.isActive()) {
            this.game.introSequence.handleInput(' ');
            return;
        }
        
        if (!this.game.running || this.game.paused) return;
        
        this.mouseDown = true;
        
        const rect = this.game.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * this.game.canvas.width / rect.width;
        const mouseY = (e.clientY - rect.top) * this.game.canvas.height / rect.height;
        
        this.currentMousePos = { x: mouseX, y: mouseY };
        
        // Détecter le double-clic
        const currentTime = Date.now();
        const timeSinceLastClick = currentTime - this.lastClickTime;
        
        if (timeSinceLastClick < this.doubleClickDelay) {
            // DOUBLE-CLIC détecté! Lancer la bombe spéciale
            if (this.game.mode === 'endless' && this.game.laserSystem) {
                this.game.laserSystem.fireSpecialBomb();
            }
            this.lastClickTime = 0; // Réinitialiser pour éviter les triple-clics
        } else {
            // Simple clic
            this.lastClickTime = currentTime;
            
            // Tirer immédiatement au clic en mode infini
            if (this.game.mode === 'endless' && this.game.laserSystem) {
                this.game.laserSystem.fire();
            }
        }
    }
    
    handleMouseMove(e) {
        if (!this.game.running || this.game.paused) return;
        
        const rect = this.game.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * this.game.canvas.width / rect.width;
        const mouseY = (e.clientY - rect.top) * this.game.canvas.height / rect.height;
        
        this.currentMousePos = { x: mouseX, y: mouseY };
        
        // Si clic maintenu
        if (this.mouseDown) {
            if (this.game.mode === 'endless') {
                // Mode infini: déplacement par inertie
                const player = this.game.player;
                const dx = mouseX - player.x - player.width / 2;
                const dy = mouseY - player.y - player.height / 2;
                
                // Appliquer une force d'inertie vers la position de la souris
                const inertiaStrength = 0.3;
                player.velX += dx * inertiaStrength * 0.01;
                player.velY += dy * inertiaStrength * 0.01;
                
                // Limiter la vitesse maximale
                const maxSpeed = 8;
                const speed = Math.sqrt(player.velX ** 2 + player.velY ** 2);
                if (speed > maxSpeed) {
                    player.velX = (player.velX / speed) * maxSpeed;
                    player.velY = (player.velY / speed) * maxSpeed;
                }
            } else {
                // Mode aventure: comportement normal
                if (!this.game.player.flying) {
                    this.game.player.startFlying();
                }
                this.game.player.flyTowards(mouseX, mouseY);
            }
        }
    }
    
    handleMouseUp(e) {
        this.mouseDown = false;
        // Ne pas arrêter le vol en mode infini (le mouton reste toujours en vol)
        if (this.game.mode !== 'endless') {
            this.game.player.stopFlying();
        }
    }
    
    isFiring() {
        return this.mouseDown;
    }
    
    destroy() {
        const canvas = this.game.canvas;
        canvas.removeEventListener('mousedown', this.onMouseDown);
        canvas.removeEventListener('mousemove', this.onMouseMove);
        canvas.removeEventListener('mouseup', this.onMouseUp);
    }
}
