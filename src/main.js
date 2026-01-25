// main.js - Point d'entrée de l'application
import './config/ConsoleConfig.js'; // Désactiver logs en production
import { MenuSystem } from './ui/MenuSystem.js';
import { Game } from './core/Game.js';
import { MolecularBackground } from './ui/MolecularBackground.js';
import { TrophySystem } from './narrative/TrophySystem.js';
import { AudioManager } from './audio/AudioManager.js';
import { i18n } from './i18n/I18nManager.js';
import { LanguageSelector } from './i18n/LanguageSelector.js';

class App {
    constructor() {
        this.menu = null;
        this.game = null;
        this.molecularBg = null;
        this.trophySystem = null;
        this.audioManager = null;
        this.languageSelector = null;
        this.i18n = i18n;
        
        this.init();
    }
    
    async init() {
        console.log('🐑 Mouton Courage - Initialisation...');
        
        // Initialiser le système i18n
        await i18n.init();
        console.log(`🌍 Langue active: ${i18n.currentLang}`);
        
        // Créer le sélecteur de langue
        this.languageSelector = new LanguageSelector();
        
        // Appliquer les traductions au HTML
        this.applyTranslations();
        
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
    
    applyTranslations() {
        // Mettre à jour les textes du menu avec les traductions
        const t = (key) => i18n.t(key);
        
        // Titre et sous-titre
        const subtitle = document.querySelector('.logo-subtitle');
        if (subtitle) subtitle.textContent = t('menu.subtitle');
        
        // Header
        const menuHeader = document.querySelector('.menu-header');
        if (menuHeader) {
            const authorLink = menuHeader.querySelector('.author-signature');
            if (authorLink) {
                menuHeader.innerHTML = `${t('menu.createdBy')} <a href="https://www.emmanuelpayet.art/" target="_blank" rel="noopener noreferrer" class="author-signature">${t('menu.author')}</a>`;
            }
        }
        
        // Mode Aventure
        const adventureTitle = document.querySelector('[data-mode="adventure"] .mode-title');
        if (adventureTitle) adventureTitle.textContent = t('menu.modes.adventure.title');
        
        const adventureDesc = document.querySelector('[data-mode="adventure"] .mode-description');
        if (adventureDesc) {
            const desc = t('menu.modes.adventure.description');
            adventureDesc.innerHTML = desc.join('<br>');
        }
        
        const adventureStats = document.querySelectorAll('[data-mode="adventure"] .stat-label');
        if (adventureStats.length >= 3) {
            adventureStats[0].textContent = t('menu.modes.adventure.stats.chapters');
            adventureStats[1].textContent = t('menu.modes.adventure.stats.minutes');
            adventureStats[2].textContent = t('menu.modes.adventure.stats.hope');
        }
        
        // Mode Infini
        const endlessTitle = document.querySelector('[data-mode="endless"] .mode-title');
        if (endlessTitle) endlessTitle.textContent = t('menu.modes.endless.title');
        
        const endlessDesc = document.querySelector('[data-mode="endless"] .mode-description');
        if (endlessDesc) {
            const desc = t('menu.modes.endless.description');
            endlessDesc.innerHTML = desc.join('<br>');
        }
        
        const endlessStats = document.querySelectorAll('[data-mode="endless"] .stat-label');
        if (endlessStats.length >= 3) {
            endlessStats[0].textContent = t('menu.modes.endless.stats.waves');
            endlessStats[1].textContent = t('menu.modes.endless.stats.duration');
            endlessStats[2].textContent = t('menu.modes.endless.stats.record');
        }
        
        console.log('📝 Traductions appliquées au menu');
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

