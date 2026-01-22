// MenuSystem.js - Système de menu principal
import { SheepAnimator } from '../graphics/SheepAnimator.js';

export class MenuSystem {
    constructor(options) {
        this.onModeSelected = options.onModeSelected;
        this.onShow = options.onShow; // Callback quand le menu est affiché
        this.audioManager = options.audioManager; // Ajout du gestionnaire audio
        this.container = document.getElementById('main-menu');
        this.sheepAnimator = new SheepAnimator();
        
        this.setupSheepAnimations();
        this.setupEventListeners();
        this.startBubbleAmbience(); // Démarrer l'ambiance de bulles
    }
    
    startBubbleAmbience() {
        // Jouer des pops de bulles aléatoirement pour l'ambiance
        const playRandomBubble = () => {
            if (this.audioManager && this.audioManager.initialized && 
                this.container.style.opacity === '1') {
                this.audioManager.playBubblePopSound();
            }
            // Prochaine bulle entre 2 et 8 secondes
            const nextDelay = 2000 + Math.random() * 6000;
            setTimeout(playRandomBubble, nextDelay);
        };
        
        // Première bulle après 1-3 secondes
        setTimeout(playRandomBubble, 1000 + Math.random() * 2000);
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
            // Son toke de sélection
            if (this.audioManager && this.audioManager.initialized) {
                this.audioManager.playTokeSound();
            }
            this.selectMode(mode);
        };
        
        // Ajouter les sons de hover sur les boutons
        const adventureBtn = document.getElementById('btn-adventure');
        const endlessBtn = document.getElementById('btn-endless');
        
        if (adventureBtn) {
            adventureBtn.addEventListener('mouseenter', () => {
                if (this.audioManager && this.audioManager.initialized) {
                    this.audioManager.playChiouaSound();
                }
            });
        }
        
        if (endlessBtn) {
            endlessBtn.addEventListener('mouseenter', () => {
                if (this.audioManager && this.audioManager.initialized) {
                    this.audioManager.playChiouaSound();
                }
            });
        }
    }
    
    selectMode(mode) {
        console.log(`Mode sélectionné: ${mode}`);
        
        // Cacher immédiatement pour éviter les clignotements
        this.container.style.transition = 'none';
        this.hide();
        
        // Lancer le jeu directement
        if (this.onModeSelected) {
            this.onModeSelected(mode);
        }
    }
    
    show() {
        this.container.style.transition = 'opacity 0.3s';
        this.container.style.display = 'flex';
        // Force reflow pour que la transition fonctionne
        this.container.offsetHeight;
        this.container.style.opacity = '1';
        
        // Rafraîchir les scores quand le menu est affiché
        if (this.onShow) {
            this.onShow();
        }
    }
    
    hide() {
        this.container.style.opacity = '0';
        this.container.style.display = 'none';
    }
}
