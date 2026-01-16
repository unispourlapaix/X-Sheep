// KeyboardControls.js - Contrôles clavier
export class KeyboardControls {
    constructor(game) {
        this.game = game;
        
        this.onKeyDown = this.handleKeyDown.bind(this);
        this.onKeyUp = this.handleKeyUp.bind(this);
        
        this.lastSpaceTime = 0;
        this.doubleClickThreshold = 300;
        
        this.spaceDownTime = 0;
        this.spaceIsDown = false;
        this.xKeyDown = false;
        
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }
    
    handleKeyDown(e) {
        // Skip intro avec Espace (prioritaire)
        if (this.game.introSequence && this.game.introSequence.isActive()) {
            this.game.introSequence.handleInput(e.key);
            return;
        }
        
        if (!this.game.running || this.game.paused) return;
        
        // CHEAT: Touche "/" pour tester la victoire et passer au niveau 2
        if (e.key === '/') {
            console.log('🎮 CHEAT: Passage au niveau 2');
            this.game.victory();
            return;
        }
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                
                if (!this.spaceIsDown) {
                    this.spaceDownTime = Date.now();
                    this.spaceIsDown = true;
                    
                    // Détecter double-appui
                    const currentTime = Date.now();
                    const isDoubleClick = (currentTime - this.lastSpaceTime) < this.doubleClickThreshold;
                    this.lastSpaceTime = currentTime;
                    
                    if (isDoubleClick) {
                        // Double saut immédiat
                        this.game.player.jump(true, 0);
                        this.game.renderer.addParticle(
                            this.game.player.x,
                            this.game.player.y,
                            '🚀🚀',
                            '#FFD700'
                        );
                    } else {
                        // Démarrer le chargement
                        this.game.player.startChargingJump();
                    }
                }
                break;
                
            case 'KeyW':
                const canFly = this.game.player.startFlying();
                if (canFly) {
                    this.game.renderer.addParticle(
                        this.game.player.x, 
                        this.game.player.y, 
                        '🕊️', 
                        '#FFD700'
                    );
                } else if (!this.game.powerUpManager?.hasPower('liberte')) {
                    this.game.renderer.addParticle(
                        this.game.player.x, 
                        this.game.player.y, 
                        '🚫', 
                        '#FF0000'
                    );
                }
                break;
                
            case 'ArrowLeft':
                this.game.player.moveLeft();
                break;
                
            case 'ArrowRight':
                this.game.player.moveRight();
                break;
                
            case 'KeyX':
                // Marquer la touche X comme enfoncée et tirer immédiatement
                if (this.game.mode === 'endless') {
                    if (!this.xKeyDown && this.game.laserSystem) {
                        this.game.laserSystem.fire();
                    }
                    this.xKeyDown = true;
                }
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.code) {
            case 'KeyX':
                this.xKeyDown = false;
                break;
                
            case 'Space':
                if (this.spaceIsDown) {
                    const currentTime = Date.now();
                    const holdDuration = currentTime - this.spaceDownTime;
                    const isDoubleClick = (currentTime - this.lastSpaceTime) < this.doubleClickThreshold;
                    this.lastSpaceTime = currentTime;
                    
                    this.game.player.jump(isDoubleClick, holdDuration);
                    
                    const emoji = holdDuration > 300 ? '⬆️⬆️' : (isDoubleClick ? '🚀💨' : '🚀');
                    this.game.renderer.addParticle(
                        this.game.player.x, 
                        this.game.player.y, 
                        emoji, 
                        '#87CEEB'
                    );
                    
                    this.spaceIsDown = false;
                }
                break;
                
            case 'KeyW':
                if (!this.game.powerUpManager?.hasPower('liberte')) {
                    this.game.player.stopFlying();
                }
                break;
        }
    }
    
    isFiring() {
        return this.xKeyDown;
    }
    
    destroy() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }
}
