// main.js - Point d'entrée de l'application
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
        
        // Menu principal
        this.menu = new MenuSystem({
            onModeSelected: (mode) => this.startGame(mode)
        });
        
        // Rendre le système de trophées accessible globalement
        window.openTrophyMenu = () => {
            this.trophySystem.show();
        };
        
        console.log('✅ Application prête !');
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
}

// Démarrer l'app quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
