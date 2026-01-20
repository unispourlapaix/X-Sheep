// main.js - Point d'entrée de l'application
import './config/ConsoleConfig.js'; // Désactiver logs en production
import { MenuSystem } from './ui/MenuSystem.js';
import { Game } from './core/Game.js';
import { MolecularBackground } from './ui/MolecularBackground.js';
import { TrophySystem } from './narrative/TrophySystem.js';

class App {
    constructor() {
        this.menu = null;
        this.game = null;
        this.molecularBg = null;
        this.trophySystem = null;
        
        this.init();
    }
    
    init() {
        console.log('🐑 Mouton Courage - Initialisation...');
        
        // Background moléculaire
        this.molecularBg = new MolecularBackground();
        
        // Système de trophées global
        this.trophySystem = new TrophySystem();
        
        // Menu principal avec callback de rafraîchissement
        this.menu = new MenuSystem({
            onModeSelected: (mode) => this.startGame(mode),
            onShow: () => this.refreshScores()
        });
        
        // Rendre le système de trophées accessible globalement
        window.openTrophyMenu = () => {
            this.trophySystem.show();
        };
        
        // Afficher le score max au chargement
        this.displayMaxScore();
        
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
        
        // Initialiser le jeu avec le système de trophées partagé
        this.game = new Game(mode, this.trophySystem);
        
        // Réactiver l'audio au cas où (interaction utilisateur)
        if (this.game.audioManager) {
            this.game.audioManager.init();
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
