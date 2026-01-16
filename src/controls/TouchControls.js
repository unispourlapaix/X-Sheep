// TouchControls.js - Contrôles tactiles mobiles
export class TouchControls {
    constructor(game) {
        this.game = game;
        this.touchDown = false;
        
        this.currentTouchPos = null;
        
        this.onTouchStart = this.handleTouchStart.bind(this);
        this.onTouchMove = this.handleTouchMove.bind(this);
        this.onTouchEnd = this.handleTouchEnd.bind(this);
        
        const canvas = game.canvas;
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        if (!this.game.running || this.game.paused) return;
        
        this.touchDown = true;
        
        const rect = this.game.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = (touch.clientX - rect.left) * this.game.canvas.width / rect.width;
        const touchY = (touch.clientY - rect.top) * this.game.canvas.height / rect.height;
        
        this.currentTouchPos = { x: touchX, y: touchY };
        
        // Tirer immédiatement au toucher en mode infini
        if (this.game.mode === 'endless' && this.game.laserSystem) {
            this.game.laserSystem.fire();
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.game.running || this.game.paused) return;
        
        const rect = this.game.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = (touch.clientX - rect.left) * this.game.canvas.width / rect.width;
        const touchY = (touch.clientY - rect.top) * this.game.canvas.height / rect.height;
        
        this.currentTouchPos = { x: touchX, y: touchY };
        
        // Si touch maintenu
        if (this.touchDown) {
            if (this.game.mode === 'endless') {
                // Mode infini: déplacement par inertie
                const player = this.game.player;
                const dx = touchX - player.x - player.width / 2;
                const dy = touchY - player.y - player.height / 2;
                
                // Appliquer une force d'inertie vers la position du toucher
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
                this.game.player.flyTowards(touchX, touchY);
            }
        }
    }
    
    handleTouchEnd(e) {
        this.touchDown = false;
        // Ne pas arrêter le vol en mode infini (le mouton reste toujours en vol)
        if (this.game.mode !== 'endless') {
            this.game.player.stopFlying();
        }
    }
    
    isFiring() {
        return this.touchDown;
    }
    
    destroy() {
        const canvas = this.game.canvas;
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
    }
}
