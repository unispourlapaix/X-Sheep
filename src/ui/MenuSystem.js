// MenuSystem.js - Système de menu principal
import { SheepAnimator } from '../graphics/SheepAnimator.js';

export class MenuSystem {
    constructor(options) {
        this.onModeSelected = options.onModeSelected;
        this.onShow = options.onShow; // Callback quand le menu est affiché
        this.container = document.getElementById('main-menu');
        this.sheepAnimator = new SheepAnimator();
        
        this.setupSheepAnimations();
        this.setupEventListeners();
    }
    
    setupSheepAnimations() {
        // Canvas pour le mode aventure
        const adventureCanvas = document.getElementById('sheep-adventure');
        if (!adventureCanvas) return;
        const adventureCtx = adventureCanvas.getContext('2d');
        
        // Canvas pour le mode infini
        const endlessCanvas = document.getElementById('sheep-endless');
        if (!endlessCanvas) return;
        const endlessCtx = endlessCanvas.getContext('2d');
        
        // Fonction d'animation
        let frame = 0;
        const animate = () => {
            frame++;
            
            // Mouton aventure (normal, centré)
            adventureCtx.clearRect(0, 0, 80, 80);
            adventureCtx.save();
            
            // Fond dégradé ciel
            const skyGradient = adventureCtx.createLinearGradient(0, 0, 0, 80);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(1, '#E0F6FF');
            adventureCtx.fillStyle = skyGradient;
            adventureCtx.fillRect(0, 0, 80, 80);
            
            const bounce1 = Math.sin(frame * 0.05) * 2;
            this.sheepAnimator.draw(adventureCtx, 20, 35 + bounce1, 0.8, 0, 'normal');
            adventureCtx.restore();
            
            // Mouton infini (avec ailes, cheveux et plus grand)
            endlessCtx.clearRect(0, 0, 80, 80);
            endlessCtx.save();
            
            // Fond dégradé doré
            const goldGradient = endlessCtx.createLinearGradient(0, 0, 0, 80);
            goldGradient.addColorStop(0, '#FFE5B4');
            goldGradient.addColorStop(1, '#FFD700');
            endlessCtx.fillStyle = goldGradient;
            endlessCtx.fillRect(0, 0, 80, 80);
            
            const bounce2 = Math.sin(frame * 0.08) * 4;
            this.sheepAnimator.draw(endlessCtx, 15, 35 + bounce2, 1.0, 0, 'flying');
            endlessCtx.restore();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    setupEventListeners() {
        // Les événements sont gérés par les attributs onclick dans le HTML
        window.selectMode = (mode) => {
            this.selectMode(mode);
        };
    }
    
    selectMode(mode) {
        console.log(`Mode sélectionné: ${mode}`);
        
        // Animation de transition
        this.container.style.transition = 'opacity 0.5s';
        this.container.style.opacity = '0';
        
        setTimeout(() => {
            this.hide();
            if (this.onModeSelected) {
                this.onModeSelected(mode);
            }
        }, 500);
    }
    
    show() {
        this.container.style.display = 'flex';
        this.container.style.opacity = '1';
        
        // Rafraîchir les scores quand le menu est affiché
        if (this.onShow) {
            this.onShow();
        }
    }
    
    hide() {
        this.container.style.display = 'none';
    }
}
