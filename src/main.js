// main.js - Point d'entrée de l'application
import './config/ConsoleConfig.js'; // Désactiver logs en production
import { MenuSystem } from './ui/MenuSystem.js';
import { Game } from './core/Game.js';
import { MolecularBackground } from './ui/MolecularBackground.js';
import { TrophySystem } from './narrative/TrophySystem.js';
import { AudioManager } from './audio/AudioManager.js';

class App {
    constructor() {
        this.menu = null;
        this.game = null;
        this.molecularBg = null;
        this.trophySystem = null;
        this.audioManager = null;
        
        this.init();
    }
    
    init() {
        console.log('🐑 Mouton Courage - Initialisation...');
        
        // Background moléculaire
        this.molecularBg = new MolecularBackground();
        
        // Système de trophées global
        this.trophySystem = new TrophySystem();
        
        // Gestionnaire audio - initialiser dès le départ pour le menu
        this.audioManager = new AudioManager();
        // Initialiser au clic pour respecter les règles du navigateur
        document.addEventListener('click', () => {
            if (!this.audioManager.initialized) {
                this.audioManager.init();
            }
        }, { once: true });
        
        // Menu principal avec callback de rafraîchissement
        this.menu = new MenuSystem({
            onModeSelected: (mode) => this.startGame(mode),
            onShow: () => this.refreshScores(),
            audioManager: this.audioManager
        });
        
        // Rendre le système de trophées accessible globalement
        window.openTrophyMenu = () => {
            // Son "toke" à l'ouverture de l'overlay
            if (this.audioManager && this.audioManager.initialized) {
                this.audioManager.playTokeSound();
            }
            this.trophySystem.show();
        };
        
        // Son "TOOKS" sur la signature Emmanuel Payet
        setTimeout(() => {
            const authorLink = document.querySelector('.author-signature');
            if (authorLink) {
                authorLink.addEventListener('mouseenter', () => {
                    if (this.audioManager && this.audioManager.initialized) {
                        this.audioManager.playTooksSound();
                    }
                });
            }
        }, 100);
        
        // Afficher le score max au chargement (immédiat + après 100ms pour s'assurer du rafraîchissement)
        this.displayMaxScore();
        setTimeout(() => {
            this.displayMaxScore();
            console.log('🔄 Rafraîchissement additionnel des scores');
        }, 100);
        
        // Rafraîchir aussi quand la page devient visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👁️ Page visible, rafraîchissement des scores');
                this.displayMaxScore();
            }
        });
        
        console.log('✅ Application prête !');
    }
    
    displayMaxScore() {
        const maxScore = localStorage.getItem('xsheep_maxScore') || '0';
        const displayElement = document.getElementById('display-max-score');
        if (displayElement) {
            displayElement.textContent = parseInt(maxScore).toLocaleString('fr-FR');
            console.log('📊 Score Infini affiché:', maxScore);
        }
        
        // Afficher le score aventure
        const adventureScore = localStorage.getItem('xsheep_adventureScore') || '0';
        const adventureElement = document.getElementById('adventure-total-score');
        if (adventureElement) {
            adventureElement.textContent = parseInt(adventureScore).toLocaleString('fr-FR');
            console.log('📊 Score Aventure affiché:', adventureScore);
        }
    }
    
    startGame(mode) {
        console.log(`🎮 Démarrage mode: ${mode}`);
        
        // Cacher le menu
        this.menu.hide();
        
        // Initialiser le jeu avec le système de trophées partagé ET l'audioManager existant
        this.game = new Game(mode, this.trophySystem, this.audioManager);
        
        // S'assurer que l'audio est initialisé
        if (this.audioManager && !this.audioManager.initialized) {
            this.audioManager.init();
        }
        
        this.game.start();
    }
    
    refreshScores() {
        // Rafraîchir l'affichage des scores
        this.displayMaxScore();
        console.log('🔄 Scores rafraîchis');
    }
}

// Démarrer l'app quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

