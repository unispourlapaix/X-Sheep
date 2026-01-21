// Game.js - Moteur principal du jeu
import { GameConfig } from '../config/GameConfig.js';
import { Player } from './Player.js';
import { ObstacleManager } from '../obstacles/ObstacleManager.js';
import { PowerUpManager } from '../powers/PowerUpManager.js';
import { NarrativeEngine } from '../narrative/NarrativeEngine.js';
import { NarrativeData } from '../narrative/narrativeData.js';
import { TrophySystem } from '../narrative/TrophySystem.js';
import { Renderer } from '../graphics/Renderer.js';
import { InputManager } from '../controls/InputManager.js';
import { EndlessMode } from '../endless/EndlessMode.js';
import { HeavenGate } from '../finale/HeavenGate.js';
import { WaterTankSystem } from '../mechanics/WaterTankSystem.js';
import { LaserSystem } from '../mechanics/LaserSystem.js';
import { NotificationSystem } from '../ui/NotificationSystem.js';
import { SevenSins } from '../obstacles/SevenSins.js';
import { ProverbCollectibles } from '../narrative/ProverbCollectibles.js';
import { IntroSequence } from '../narrative/IntroSequence.js';
import { getRandomComment, getOnomatopoeia } from '../narrative/BossComments.js';
import { audioManager } from '../audio/AudioManager.js';
import { ScoreManager } from '../endless/ScoreManager.js';
import { Lighthouse } from '../graphics/Lighthouse.js';
import { SeaObstacles, Leviathan } from '../obstacles/SeaObstacles.js';

export class Game {
    constructor(mode, trophySystem = null) {
        this.mode = mode; // 'adventure' ou 'endless'
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.paused = false;
        
        // Sauvegarder/restaurer le niveau actuel
        this.currentLevel = parseInt(localStorage.getItem('xsheep_currentLevel') || '1');
        
        // Systèmes
        this.audioManager = audioManager;
        this.player = null;
        this.obstacleManager = null;
        this.powerUpManager = null;
        this.narrativeEngine = null;
        this.trophySystem = trophySystem || new TrophySystem();
        this.notificationSystem = null;
        this.renderer = null;
        this.inputManager = null;
        this.endlessMode = null;
        this.heavenGate = null;
        this.waterTankSystem = null;
        this.laserSystem = null;
        this.introSequence = null;
        
        // Commentaires de boss
        this.bossCommentTimer = 0;
        this.currentBossComment = null;
        this.bossCommentDuration = 0;
        
        // État du jeu
        this.score = 0;
        this.obstaclesCleared = 0;
        this.gameSpeed = GameConfig.GAME_SPEED_INITIAL;
        
        // Sauvegarde automatique toutes les 2 minutes
        this.autoSaveInterval = null;
        this.lastAutoSave = Date.now();
        this.AUTO_SAVE_DELAY = 120000; // 2 minutes en ms
        
        this.gameOverAnimation = false; // Animation vers le paradis
        this.gameOverTimer = 0;
        this.gameOverPhase = 'flying'; // 'flying', 'entering', 'rejected', 'done'
        this.rejectionBubble = null;
        this.victoryAnimation = false; // Animation de victoire
        this.victoryTimer = 0;
        this.victoryPhase = 'celebration'; // 'celebration', 'entering', 'heaven'

        // Écran de victoire (rendu canvas)
        this.victoryScreenActive = false;
        this.victoryScreenData = null;
        this.victoryButtons = null;
        this.victoryClickHandler = null;
        
        // Niveau 2 - Les 7 Péchés Capitaux
        this.level2Active = false;
        this.level2Timer = 0;
        this.level2SpawnRate = 120; // Spawn toutes les 2 secondes
        this.level2Survived = 0; // Temps de survie
        
        // Niveau 3 - Navigation et Sagesse
        this.level3Active = false;
        this.level3Timer = 0;
        this.level3Proverbs = []; // Proverbes flottants
        this.level3Wisdom = 0; // Sagesse accumulée
        this.level3SpawnRate = 480; // Nouveau proverbe toutes les 8 secondes
        this.level3ObstacleSpawnRate = 480; // Obstacles toutes les 8 secondes (très lent)
        this.level3ObstacleTimer = 0;
        this.level3Obstacles = []; // Obstacles marins
        this.level3Projectiles = []; // Projectiles du Léviathan
        this.boatMode = false; // Le mouton est dans un bateau
        this.level3Entering = false; // Animation d'entrée au paradis
        this.level3EnterTimer = 0;
        this.lighthouse = null; // Phare
        this.leviathan = null; // Boss du niveau 3
        this.leviathanDefeated = false;
        this.sharkBossPause = 0; // Pause dramatique pour animation boss requin
        this.screenShake = 0; // Timer pour tremblement d'écran
        this.screenShakeIntensity = 0; // Intensité du tremblement
        this.icebergSinking = false; // Animation de naufrage iceberg
        this.sinkingTimer = 0; // Timer pour l'animation
        this.sinkingIceberg = null; // Position de l'iceberg
        
        this.init();
    }
    
    init() {
        console.log(`🎮 Initialisation du jeu - Mode: ${this.mode}`);
        
        // Initialiser l'audio (nécessite interaction utilisateur)
        this.audioManager.init();
        
        // Créer et configurer le canvas
        this.setupCanvas();
        
        // Initialiser les systèmes
        this.player = new Player(this);
        this.obstacleManager = new ObstacleManager(this);
        this.powerUpManager = new PowerUpManager(this);
        this.narrativeEngine = new NarrativeEngine(this);
        this.notificationSystem = new NotificationSystem(this);
        // trophySystem déjà initialisé dans le constructeur
        this.renderer = new Renderer(this);
        this.inputManager = new InputManager(this);
        this.waterTankSystem = new WaterTankSystem(this);
        this.laserSystem = new LaserSystem(this);
        
        // Compteur de frames pour le laser
        this.frameCount = 0;
        
        // Mode spécifique
        if (this.mode === 'endless') {
            this.endlessMode = new EndlessMode(this);
            this.introSequence = new IntroSequence(this);
            // Positionner le mouton au milieu de l'écran et le mettre en vol
            this.player.y = GameConfig.CANVAS_HEIGHT / 2;
            this.player.flying = true;
            this.player.fuel = this.player.maxFuel;
            // Démarrer le son de fusée pour le mode infini
            if (this.audioManager) {
                setTimeout(() => {
                    this.audioManager.startRocketSound();
                    this.player.rocketSoundActive = true;
                }, 100); // Court délai pour s'assurer que l'audio est initialisé
            }
        } else {
            this.heavenGate = new HeavenGate(this);
            // Porte invisible au début - apparaît seulement au Game Over
            this.heavenGate.visible = false;
        }
        
        console.log('✅ Jeu initialisé !');
    }
    
    setupCanvas() {
        // Récupérer ou créer le canvas
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'game-canvas';
            document.body.appendChild(this.canvas);
        }
        
        this.canvas.width = GameConfig.CANVAS_WIDTH;
        this.canvas.height = GameConfig.CANVAS_HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        
        // Centrer le canvas au milieu de l'écran
        this.canvas.style.display = 'block';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '50%';
        this.canvas.style.left = '50%';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        
        // Activer le plein écran sur mobile
        this.setupMobileFullscreen();
        
        // Cacher le background moléculaire
        const molCanvas = document.getElementById('molecular-canvas');
        if (molCanvas) molCanvas.style.display = 'none';
    }
    
    setupMobileFullscreen() {
        // Détecter si mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Fonction pour entrer en plein écran avec support multi-navigateurs
            const enterFullscreen = () => {
                const elem = document.documentElement;
                
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(err => {
                        console.log('Fullscreen standard échoué:', err);
                    });
                } else if (elem.webkitRequestFullscreen) { // iOS Safari
                    elem.webkitRequestFullscreen();
                } else if (elem.mozRequestFullScreen) { // Firefox
                    elem.mozRequestFullScreen();
                } else if (elem.msRequestFullscreen) { // IE11
                    elem.msRequestFullscreen();
                }
                
                // Forcer l'orientation paysage si possible
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(err => {
                        console.log('Orientation lock non supporté:', err);
                    });
                }
            };
            
            // Tenter d'entrer en plein écran au premier clic/touch
            const firstInteraction = () => {
                enterFullscreen();
                // Retirer les listeners après la première interaction
                document.removeEventListener('touchstart', firstInteraction);
                document.removeEventListener('click', firstInteraction);
            };
            
            document.addEventListener('touchstart', firstInteraction, { once: true });
            document.addEventListener('click', firstInteraction, { once: true });
            
            console.log('📱 Mode mobile: Plein écran activé au prochain tap');
        }
    }
    
    start() {
        console.log('🚀 Démarrage du jeu...');

        // Démarrer la sauvegarde automatique
        this.startAutoSave();

        // Activer les touches de debug
        this.setupDebugKeys();

        // Si mode endless et intro existe, lancer l'intro d'abord
        if (this.mode === 'endless' && this.introSequence) {
            this.introSequence.start();
            this.running = true;
            this.gameLoop();
        } else {
            this.running = true;
            this.gameLoop();
        }
    }

    setupDebugKeys() {
        // Touches de test pour les écrans de victoire
        document.addEventListener('keydown', (event) => {
            // Touche "(" = Victoire impatiente (HeavenGate)
            if (event.key === '(') {
                console.log('🧪 TEST: Affichage victoire impatiente');
                if (this.heavenGate) {
                    this.heavenGate.victoryScreenActive = true;
                    this.paused = true;

                    // Définir le bouton si pas déjà fait
                    if (!this.heavenGate.continueButton) {
                        this.heavenGate.continueButton = {
                            x: this.canvas.width / 2 - 100,
                            y: this.canvas.height / 2 + 180,
                            width: 200,
                            height: 40,
                            text: '⏰ Victoire rapide !'
                        };
                    }

                    // Ajouter le listener de clic si pas déjà fait
                    this.canvas.removeEventListener('click', this.heavenGate.handleClick);
                    this.canvas.addEventListener('click', this.heavenGate.handleClick);
                }
            }

            // Touche ")" = Victoire complète (Game)
            if (event.key === ')') {
                console.log('🧪 TEST: Affichage victoire complète');
                this.victoryScreenActive = true;
                this.victoryScreenData = {
                    score: this.score || 12345,
                    obstaclesCleared: this.obstaclesCleared || 42
                };
                this.paused = true;

                // Définir les boutons
                this.victoryButtons = {
                    continue: {
                        x: this.canvas.width / 2 - 100,
                        y: this.canvas.height - 120,
                        width: 200,
                        height: 40,
                        text: 'Continuer 🌟'
                    },
                    menu: {
                        x: this.canvas.width / 2 - 100,
                        y: this.canvas.height - 70,
                        width: 200,
                        height: 40,
                        text: 'Menu'
                    }
                };

                // Ajouter le listener de clic
                this.victoryClickHandler = this.handleVictoryClick.bind(this);
                this.canvas.addEventListener('click', this.victoryClickHandler);
            }
        });
    }
    
    // Méthode appelée par IntroSequence quand l'intro est finie
    startGame() {
        console.log('🎬 Intro terminée, jeu commence !');
        this.running = true;
    }
    
    pause() {
        this.paused = true;
    }
    
    resume() {
        this.paused = false;
        this.gameLoop();
    }
    
    startAutoSave() {
        // Sauvegarder automatiquement toutes les 2 minutes
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveScore();
        }, this.AUTO_SAVE_DELAY);
        console.log('💾 Sauvegarde automatique activée (toutes les 2min)');
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏹️ Sauvegarde automatique arrêtée');
        }
    }
    
    autoSaveScore() {
        const now = Date.now();
        if (now - this.lastAutoSave >= this.AUTO_SAVE_DELAY) {
            this.saveCurrentScore();
            this.lastAutoSave = now;
            console.log('💾 Sauvegarde automatique effectuée');
        }
    }
    
    saveCurrentScore() {
        // Sauvegarder selon le mode
        const scoreManager = new ScoreManager();
        
        if (this.mode === 'adventure') {
            // En aventure, on sauvegarde score + XP dans lastAdventureScore
            const xp = this.obstacleManager ? this.obstacleManager.totalXP : 0;
            const finalScore = this.score + xp;
            localStorage.setItem('xsheep_lastAdventureScore', finalScore.toString());
            console.log('💾 Score aventure sauvegardé:', this.score, '+ XP:', xp, '= Total:', finalScore);
        } else if (this.mode === 'endless') {
            // En infini, on sauvegarde si c'est un nouveau record (score uniquement)
            const currentMax = scoreManager.loadMaxScore();
            if (this.score > currentMax) {
                scoreManager.saveMaxScore(this.score);
                console.log('💾 Nouveau record infini sauvegardé:', this.score);
            }
        }
    }
    
    gameLoop() {
        const heavenVictoryActive = this.heavenGate && this.heavenGate.victoryScreenActive;
        if (!this.running && !this.gameOverAnimation && !this.victoryAnimation && !this.victoryScreenActive && !heavenVictoryActive) return;

        // Permettre le rendu des écrans de victoire même en pause
        if (this.paused && !this.victoryScreenActive && !heavenVictoryActive) return;

        // Update
        if (!this.victoryScreenActive && !heavenVictoryActive) {
            this.update();
        }

        // Render
        this.renderer.render();

        // Render écrans de victoire par-dessus si actifs (au premier plan)
        if (this.victoryScreenActive) {
            this.renderVictoryScreen(this.ctx);
        }
        if (heavenVictoryActive) {
            this.heavenGate.renderVictoryScreen(this.ctx);
        }

        // Boucle suivante
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Intro sequence en cours (mode endless)
        if (this.introSequence && this.introSequence.isActive()) {
            this.introSequence.update();
            return;
        }
        
        // Animation de VICTOIRE vers le paradis
        if (this.victoryAnimation) {
            this.victoryTimer++;
            
            if (this.victoryPhase === 'celebration') {
                // Phase 1: Célébration (2 secondes)
                // Particules de victoire
                if (this.victoryTimer % 10 === 0) {
                    this.renderer.addParticle(
                        this.player.x + Math.random() * 50 - 25,
                        this.player.y + Math.random() * 50 - 25,
                        ['✨', '🎉', '🎆', '🌟', '💎'][Math.floor(Math.random() * 5)],
                        '#FFD700'
                    );
                }
                
                // Petit saut de joie
                this.player.y += Math.sin(this.victoryTimer * 0.2) * 2;
                
                if (this.victoryTimer > 120) {
                    this.victoryPhase = 'entering';
                    this.victoryTimer = 0;
                }
            }
            else if (this.victoryPhase === 'entering') {
                // Phase 2: Vol vers la porte avec joie
                if (this.heavenGate) {
                    const targetX = this.heavenGate.x + this.heavenGate.width / 2;
                    const targetY = this.heavenGate.y + this.heavenGate.height / 2;
                    const dx = targetX - this.player.x;
                    const dy = targetY - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 20) {
                        this.player.velX = (dx / distance) * 6;
                        this.player.velY = (dy / distance) * 6;
                    } else {
                        this.player.velX *= 0.95;
                        this.player.velY *= 0.95;
                    }
                }
                
                this.player.x += this.player.velX;
                this.player.y += this.player.velY;
                
                // Garder le joueur dans le canvas
                this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
                this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
                
                // Rétrécissement progressif
                this.player.size = Math.max(0.1, this.player.size - 0.015);
                
                // Particules continues
                if (this.victoryTimer % 5 === 0) {
                    this.renderer.addParticle(
                        this.player.x,
                        this.player.y,
                        ['✨', '💎', '�'][Math.floor(Math.random() * 3)],
                        '#FFD700'
                    );
                }
                
                if (this.victoryTimer > 80 || this.player.size < 0.15) {
                    this.victoryPhase = 'heaven';
                    this.victoryTimer = 0;
                }
            }
            else if (this.victoryPhase === 'heaven') {
                // Phase 3: Entré au Paradis!
                if (this.victoryTimer > 60) {
                    this.running = false;
                    this.victoryAnimation = false;
                    this.showVictoryScreen();
                }
            }
            return;
        }
        
        // Animation Game Over vers le paradis
        if (this.gameOverAnimation) {
            this.gameOverTimer++;
            
            if (this.gameOverPhase === 'flying') {
                // Phase 1: Vol vers la porte avec trajectoire fluide
                if (this.heavenGate) {
                    // Calculer direction vers la porte
                    const targetX = this.heavenGate.x + this.heavenGate.width / 2;
                    const targetY = this.heavenGate.y + this.heavenGate.height / 2;
                    const dx = targetX - this.player.x;
                    const dy = targetY - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 50) {
                        // Se diriger vers la porte
                        this.player.velX = (dx / distance) * 5;
                        this.player.velY = (dy / distance) * 5;
                    } else {
                        // Ralentir près de la porte
                        this.player.velX *= 0.9;
                        this.player.velY *= 0.9;
                    }
                }
                
                this.player.x += this.player.velX;
                this.player.y += this.player.velY;
                
                // Garder le joueur visible dans le canvas
                this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
                this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
                
                // Rotation douce pendant le vol
                this.player.rotation = (this.player.rotation || 0) + 0.05;
                
                // Passer à l'entrée après 120 frames (2 secondes)
                if (this.gameOverTimer > 120) {
                    this.gameOverPhase = 'entering';
                    this.gameOverTimer = 0;
                    this.player.rotation = 0;
                }
            }
            else if (this.gameOverPhase === 'entering') {
                // Phase 2: Entrée dans la porte (rétrécissement)
                this.player.size = Math.max(0.2, this.player.size - 0.03);
                
                // Avancer lentement vers le centre de la porte
                if (this.heavenGate) {
                    const centerX = this.heavenGate.x + this.heavenGate.width / 2;
                    this.player.x += (centerX - this.player.x) * 0.05;
                }
                
                // Effet lumineux
                if (this.gameOverTimer % 5 === 0) {
                    this.renderer.addParticle(
                        this.player.x,
                        this.player.y,
                        ['✨', '⭐', '💫'][Math.floor(Math.random() * 3)],
                        '#FFD700'
                    );
                }
                
                if (this.gameOverTimer > 40) {
                    this.gameOverPhase = 'rejected';
                    this.gameOverTimer = 0;
                    this.rejectionBubble = {
                        x: this.player.x,
                        y: this.player.y - 60,
                        text: 'VA VIE! et renai ! RETOURNE VIVRE !',
                        opacity: 1
                    };
                    console.log('🚫 Rejeté du Paradis !');
                }
            }
            else if (this.gameOverPhase === 'rejected') {
                // Phase 3: Éjection puis retour au sol
                if (this.gameOverTimer === 0) {
                    // Impulsion initiale
                    this.player.velX = -20;
                    this.player.velY = -8;
                }
                
                // Gravité après éjection
                this.player.velY += 0.5;
                this.player.x += this.player.velX;
                this.player.y += this.player.velY;
                
                // Friction horizontale
                this.player.velX *= 0.98;
                
                // Rotation de chute
                this.player.rotation = (this.player.rotation || 0) + 0.2;
                
                // Retour à la taille normale
                this.player.size = Math.min(1.0, this.player.size + 0.04);
                
                // Collision avec le sol
                if (this.player.y >= this.player.groundY) {
                    this.player.y = this.player.groundY;
                    this.player.velY = 0;
                    this.player.velX = 0;
                    this.player.rotation = 0;
                    this.gameOverPhase = 'reading';
                    this.gameOverTimer = 0;
                }
                
                // Garder le joueur visible
                this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
                if (this.player.y < 0) this.player.y = 0;
                
                // Bulle suit le mouton
                if (this.rejectionBubble) {
                    this.rejectionBubble.x = this.player.x;
                    this.rejectionBubble.y = this.player.y - 60;
                }
                
                // Effets de choc
                if (this.gameOverTimer < 20 && this.gameOverTimer % 3 === 0) {
                    this.renderer.addParticle(
                        this.player.x,
                        this.player.y,
                        '💥',
                        '#FF0000'
                    );
                }
            }
            else if (this.gameOverPhase === 'reading') {
                // Phase 4: Lecture du message pendant 3 secondes
                // Bulle reste visible
                if (this.rejectionBubble) {
                    this.rejectionBubble.x = this.player.x;
                    this.rejectionBubble.y = this.player.y - 60;
                    this.rejectionBubble.opacity = 1;
                }
                
                // Après 3 secondes (180 frames à 60 FPS)
                if (this.gameOverTimer > 180) {
                    // Mode endless : le mouton refuse et recommence !
                    if (this.mode === 'endless') {
                        this.gameOverPhase = 'refusing';
                        this.gameOverTimer = 0;
                        this.rejectionBubble = {
                            x: this.player.x,
                            y: this.player.y - 60,
                            text: "non! c pas fini ?",
                            opacity: 1
                        };
                    } else {
                        this.gameOverPhase = 'exiting';
                        this.gameOverTimer = 0;
                    }
                }
            }
            else if (this.gameOverPhase === 'refusing') {
                // Phase 4b (endless only): Le mouton refuse d'abandonner!
                if (this.rejectionBubble) {
                    this.rejectionBubble.x = this.player.x;
                    this.rejectionBubble.y = this.player.y - 60;
                    this.rejectionBubble.opacity = 1;
                }
                
                // Après 2 secondes (120 frames)
                if (this.gameOverTimer > 120) {
                    this.gameOverPhase = 'restarting';
                    this.gameOverTimer = 0;
                }
            }
            else if (this.gameOverPhase === 'restarting') {
                // Phase 5 (endless only): Redémarrage automatique
                
                // Fade out de la bulle
                if (this.rejectionBubble) {
                    this.rejectionBubble.opacity = Math.max(0, this.rejectionBubble.opacity - 0.05);
                }
                
                // Flash blanc
                if (this.gameOverTimer === 0) {
                    // Créer un flash blanc
                    for (let i = 0; i < 30; i++) {
                        this.renderer.addParticle(
                            Math.random() * this.canvas.width,
                            Math.random() * this.canvas.height,
                            ['✨', '💫', '⭐'][Math.floor(Math.random() * 3)],
                            '#FFFFFF'
                        );
                    }
                }
                
                // Après 1 seconde, redémarrer
                if (this.gameOverTimer > 60) {
                    this.restartEndlessMode();
                }
            }
            else if (this.gameOverPhase === 'exiting') {
                // Phase 5: Sort au niveau de la porte
                if (this.heavenGate) {
                    const targetY = this.heavenGate.y + this.heavenGate.height / 2;
                    
                    // Monte vers la porte
                    this.player.velY = (targetY - this.player.y) * 0.05;
                    this.player.y += this.player.velY;
                    
                    // Sort par la droite
                    this.player.velX = 3;
                    this.player.x += this.player.velX;
                }
                
                // Fade out de la bulle
                if (this.rejectionBubble) {
                    this.rejectionBubble.opacity = Math.max(0, this.rejectionBubble.opacity - 0.02);
                }
                
                // Fin quand sort de l'écran
                if (this.player.x > this.canvas.width) {
                    this.gameOverPhase = 'done';
                    this.running = false;
                    this.gameOverAnimation = false;
                    this.player.rotation = 0;
                    
                    // Afficher l'écran Game Over
                    setTimeout(() => {
                        if (this.mode === 'endless') {
                            this.endlessMode.showGameOver();
                        } else {
                            this.showAdventureGameOver();
                        }
                    }, 500);
                }
            }
            return;
        }
        
        // NIVEAU 3: Animation d'entrée au paradis
        if (this.level3Entering) {
            this.level3EnterTimer++;
            
            if (this.heavenGate) {
                const targetX = this.heavenGate.x + this.heavenGate.width / 2 - 40;
                const targetY = this.heavenGate.y + this.heavenGate.height / 2;
                
                // Voler vers la porte
                const dx = targetX - this.player.x;
                const dy = targetY - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 10) {
                    this.player.velX = (dx / distance) * 4;
                    this.player.velY = (dy / distance) * 4;
                    this.player.x += this.player.velX;
                    this.player.y += this.player.velY;
                } else {
                    // Arrivé à la porte, rétrécir
                    this.player.size = Math.max(0.1, this.player.size - 0.02);
                }
                
                // Particules divines
                if (this.level3EnterTimer % 5 === 0) {
                    this.renderer.addParticle(
                        this.player.x,
                        this.player.y,
                        ['✨', '⭐', '💫'][Math.floor(Math.random() * 3)],
                        '#FFD700'
                    );
                }
                
                // Fin de l'animation
                if (this.player.size < 0.2 || this.level3EnterTimer > 180) {
                    this.showLevel3Victory();
                }
            }
            
            return;
        }
        
        // NIVEAU 3: Navigation et Sagesse
        if (this.level3Active) {
            this.level3Timer++;
            this.level3ObstacleTimer++;
            
            // Mettre à jour le phare
            if (this.lighthouse) {
                this.lighthouse.update();
            }
            
            // Spawner des proverbes
            if (!this.level3FirstProverbSpawned) {
                // Premier proverbe: Liberté
                const firstProverb = ProverbCollectibles.getFirst();
                this.level3Proverbs.push(firstProverb);
                this.level3FirstProverbSpawned = true;
            } else if (this.level3Timer >= this.level3SpawnRate) {
                const proverb = ProverbCollectibles.getRandom();
                this.level3Proverbs.push(proverb);
                this.level3Timer = 0;
            }
            
            // Spawner des obstacles marins
            if (this.level3ObstacleTimer >= this.level3ObstacleSpawnRate && !this.leviathan) {
                const obstacle = SeaObstacles.getRandom(this.canvas.width, this.canvas.height);
                this.level3Obstacles.push(obstacle);
                this.level3ObstacleTimer = 0;
                
                // Difficulté fixe - pas d'augmentation
                // this.level3ObstacleSpawnRate reste constant
            }
            
            // Faire apparaître le Léviathan après 60 secondes (si pas déjà vaincu)
            if (this.level3Timer > 3600 && !this.leviathan && !this.leviathanDefeated) {
                this.leviathan = new Leviathan(this.canvas.width, this.canvas.height);
                this.leviathan.isActive = true;
                
                if (this.notificationSystem) {
                    this.notificationSystem.showNarrative({
                        text: '🐉 LE LÉVIATHAN APPARAÎT ! Esquive ses attaques !',
                        duration: 4000
                    });
                }
                
                // Ralentir le spawn des obstacles normaux
                this.level3ObstacleSpawnRate = 200;
            }
            
            // Mettre à jour le Léviathan
            if (this.leviathan && this.leviathan.isActive) {
                const projectile = this.leviathan.update(this.player);
                if (projectile) {
                    this.level3Projectiles.push(projectile);
                }
                
                // Collision avec le Léviathan
                if (this.leviathan.checkCollision(this.player) && !this.player.invincible) {
                    this.player.lives -= 1;
                    this.player.invincible = true;
                    this.player.invincibleTimer = 180;
                    
                    if (this.audioManager && this.audioManager.initialized) {
                        this.audioManager.playCollisionSound();
                    }
                    
                    if (this.player.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            }
            
            // Mettre à jour les projectiles du Léviathan
            this.level3Projectiles.forEach((proj, index) => {
                proj.x += proj.velX;
                proj.y += proj.velY;
                
                // Collision avec le joueur
                const dx = proj.x - this.player.x;
                const dy = proj.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 40 && !this.player.invincible) {
                    this.player.lives -= proj.damage;
                    this.player.invincible = true;
                    this.player.invincibleTimer = 60;
                    proj.hit = true;
                    
                    if (this.audioManager && this.audioManager.initialized) {
                        this.audioManager.playCollisionSound();
                    }
                    
                    if (this.player.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            });
            
            // Nettoyer les projectiles
            this.level3Projectiles = this.level3Projectiles.filter(p => !p.hit && p.x > -50 && p.x < this.canvas.width + 50);
            
            // Mettre à jour le joueur
            this.player.update();
            
            // Décrémenter le tremblement d'écran
            if (this.screenShake > 0) {
                this.screenShake--;
            }
            
            // Gérer la pause dramatique du boss requin
            if (this.sharkBossPause > 0) {
                this.sharkBossPause--;
                // Pendant la pause, continuer seulement l'animation du boss
                this.level3Obstacles.forEach(obs => {
                    if (obs.sharkBoss && obs.sharkBoss.active) {
                        obs.sharkBoss.frame++;
                        obs.sharkBoss.y += obs.sharkBoss.velY;
                    }
                });
                return; // Skip le reste de l'update pendant la pause
            }
            
            // Gérer l'animation de naufrage iceberg
            if (this.icebergSinking) {
                this.sinkingTimer++;
                
                // Animation de coulage (4 secondes = 240 frames)
                if (this.sinkingTimer < 240) {
                    // Bateau descend progressivement
                    this.player.y += 1.5;
                    // Rotation progressive (penche sur le côté)
                    this.player.rotation = (this.sinkingTimer / 240) * (Math.PI / 6); // Penche jusqu'à 30°
                    // Bulles qui montent
                    if (this.sinkingTimer % 10 === 0) {
                        this.renderer.addParticle(
                            this.player.x + Math.random() * 80,
                            this.player.y + Math.random() * 30,
                            '💧',
                            '#87CEEB'
                        );
                    }
                } else {
                    // Fin de l'animation - reprendre le jeu
                    this.icebergSinking = false;
                    this.player.rotation = 0;
                    
                    // Vérifier game over
                    if (this.player.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                    
                    // Projeter le bateau vers le haut (réapparaît)
                    this.player.y = 100;
                    this.player.velY = -10;
                    this.player.parachuting = true;
                    this.player.parachuteTimer = 480;
                }
                return; // Skip le reste de l'update pendant le naufrage
            }
            
            // Limiter les mouvements du bateau - peut naviguer sur l'eau et voler dans le ciel
            if (this.boatMode) {
                this.player.x = Math.max(10, Math.min(this.canvas.width - 90, this.player.x));
                this.player.y = Math.max(50, Math.min(480, this.player.y)); // Navigue sur l'eau (256) et vole dans le ciel
            }
            
            // Animer les obstacles marins
            this.level3Obstacles.forEach((obstacle, index) => {
                obstacle.x -= obstacle.speed;
                
                // Comportements spécifiques
                if (obstacle.type === 'whirlpool') {
                    obstacle.rotation += 0.1;
                    
                    // Force d'aspiration vers le centre
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < obstacle.width * 2) {
                        const pullX = (dx / distance) * obstacle.pullForce;
                        const pullY = (dy / distance) * obstacle.pullForce;
                        this.player.x += pullX;
                        this.player.y += pullY;
                        
                        // Initialiser le timer et l'échelle si pas déjà fait
                        if (!obstacle.trapTimer) {
                            obstacle.trapTimer = 0;
                            this.player.whirlpoolScale = 1.0; // Taille normale
                        }
                        
                        // Si proche du centre, commencer à réduire la taille
                        if (distance < 60) {
                            obstacle.trapTimer++;
                            
                            // Réduire progressivement la taille du bateau (aspiré vers le centre)
                            const shrinkProgress = obstacle.trapTimer / 120; // 0 à 1 sur 2 secondes
                            this.player.whirlpoolScale = Math.max(0.1, 1.0 - shrinkProgress * 0.9); // De 1.0 à 0.1
                            
                            // Rotation pendant l'aspiration
                            this.player.rotation += 0.05 * (1 - this.player.whirlpoolScale); // Tourne de plus en plus vite
                            
                            // Après 2 secondes (120 frames) - DISPARITION complète puis REJET
                            if (obstacle.trapTimer >= 120) {
                                // Syphoner le bateau : perdre 3 vies
                                this.player.lives -= 3;
                                obstacle.hit = true; // Désactiver le tourbillon
                                
                                // Effet visuel EXPLOSION du tourbillon
                                for (let i = 0; i < 30; i++) {
                                    this.renderer.addParticle(
                                        obstacle.x + (Math.random() - 0.5) * 80,
                                        obstacle.y + (Math.random() - 0.5) * 80,
                                        '💦',
                                        '#4A90A4'
                                    );
                                }
                                this.renderer.addParticle(obstacle.x, obstacle.y, '🌪️', '#87CEEB');
                                this.renderer.addParticle(obstacle.x, obstacle.y, '💥', '#FFFFFF');
                                
                                // REJET violent vers le haut avec rotation
                                this.player.x = obstacle.x;
                                this.player.y = obstacle.y - 50;
                                this.player.velY = -18; // Force explosive vers le haut
                                this.player.velX = (Math.random() - 0.5) * 6; // Direction aléatoire
                                this.player.rotationSpeed = 0.2; // Tourne en étant rejeté
                                this.player.flying = false;
                                this.player.parachuting = true;
                                this.player.parachuteTimer = 480;
                                
                                // Restaurer la taille normale
                                this.player.whirlpoolScale = 1.0;
                                
                                if (this.audioManager && this.audioManager.initialized) {
                                    this.audioManager.playCollisionSound();
                                }
                                
                                console.log('🌪️ Aspiré et rejeté par le tourbillon!');
                                
                                if (this.player.lives <= 0) {
                                    this.gameOver();
                                    return;
                                }
                                
                                obstacle.trapTimer = 0;
                            }
                        }
                    } else {
                        // Réinitialiser le timer et la taille si on sort de la zone
                        obstacle.trapTimer = 0;
                        if (this.player.whirlpoolScale !== undefined && this.player.whirlpoolScale < 1.0) {
                            // Restaurer progressivement la taille
                            this.player.whirlpoolScale = Math.min(1.0, this.player.whirlpoolScale + 0.05);
                        }
                    }
                }
                
                // Piège du requin - Animation boss requin qui surgit
                if (obstacle.type === 'shark') {
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Si le bateau est sur l'aileron (distance augmentée pour aileron 2x plus grand)
                    if (distance < 70) {
                        // Initialiser le timer si pas déjà fait
                        if (!obstacle.trapTimer) {
                            obstacle.trapTimer = 0;
                            console.log('🦈 Détection requin - Timer démarré');
                        }
                        obstacle.trapTimer++;
                        
                        // Après 1 seconde (60 frames), déclencher l'attaque du boss requin
                        if (obstacle.trapTimer >= 60 && !obstacle.bossTriggered) {
                            obstacle.bossTriggered = true;
                            
                            console.log('🦈 BOSS REQUIN DÉCLENCHÉ! Position:', this.player.x, this.player.y);
                            
                            // PAUSE DRAMATIQUE de 2 secondes
                            this.sharkBossPause = 120; // 2 secondes (60 frames/s)
                            this.screenShake = 60; // 1 seconde de tremblement
                            this.screenShakeIntensity = 8; // Intensité du tremblement
                            
                            // Retour haptique (vibration mobile)
                            if (navigator.vibrate) {
                                navigator.vibrate([200, 100, 200, 100, 300]); // 1s de vibrations
                            }
                            
                            // Créer l'animation du boss requin qui surgit d'en bas
                            obstacle.sharkBoss = {
                                x: this.player.x,
                                y: this.canvas.height + 200, // Part d'en bas de l'écran
                                width: 300, // BEAUCOUP plus grand
                                height: 400, // BEAUCOUP plus grand
                                velY: -4, // Encore plus lent pour être bien visible
                                active: true,
                                captured: false, // Pas encore capturé
                                frame: 0
                            };
                            
                            console.log('🦈 Boss requin déclenché!');
                        }
                    } else {
                        // Réinitialiser le timer si on s'éloigne
                        obstacle.trapTimer = 0;
                    }
                    
                    // Animation du boss requin
                    if (obstacle.sharkBoss && obstacle.sharkBoss.active) {
                        const boss = obstacle.sharkBoss;
                        console.log('🦈 UPDATE BOSS:', boss.y, 'velY:', boss.velY, 'captured:', boss.captured);
                        boss.frame++;
                        
                        // Si le bateau est capturé, il suit le requin EN PREMIER
                        if (boss.captured) {
                            this.player.x = boss.x;
                            this.player.y = boss.y - 80; // Juste devant la gueule
                            this.player.velX = 0;
                            this.player.velY = boss.velY; // Suit la vitesse du requin
                            this.player.rotation = Math.sin(boss.frame * 0.1) * 0.3; // Oscillation
                        }
                        
                        // Puis déplacer le requin
                        boss.y += boss.velY;
                        
                        // Vérifier si le requin attrape le bateau (une seule fois)
                        if (!boss.captured) {
                            const bossPlayerDist = Math.sqrt(
                                Math.pow(boss.x - this.player.x, 2) + 
                                Math.pow(boss.y - this.player.y, 2)
                            );
                            
                            if (bossPlayerDist < 150 && boss.y > 100 && boss.y < 500) {
                                // CAPTURE LE BATEAU!
                                boss.captured = true;
                                this.player.lives -= 3;
                                
                                // Effet visuel capture
                                for (let i = 0; i < 30; i++) {
                                    this.renderer.addParticle(
                                        boss.x + (Math.random() - 0.5) * 100,
                                        boss.y + (Math.random() - 0.5) * 120,
                                        '💧',
                                        '#4A90A4'
                                    );
                                }
                                this.renderer.addParticle(boss.x, boss.y, '🦈', '#2A5A7A');
                                
                                if (this.audioManager && this.audioManager.initialized) {
                                    this.audioManager.playCollisionSound();
                                }
                                
                                console.log('🦈 BATEAU CAPTURÉ! Le requin l\'emporte vers le haut...');
                            }
                        }
                        
                        // Quand le requin sort de l'écran par le haut, relâcher le bateau
                        if (boss.y < -200 && boss.captured) {
                            // TROMBE D'EAU FINALE - RELÂCHE LE BATEAU
                            for (let i = 0; i < 40; i++) {
                                this.renderer.addParticle(
                                    this.player.x + (Math.random() - 0.5) * 120,
                                    this.player.y + (Math.random() - 0.5) * 140,
                                    '💦',
                                    '#87CEEB'
                                );
                            }
                            this.renderer.addParticle(this.player.x, this.player.y, '🌊', '#1E90FF');
                            
                            // Projeter le bateau en rotation
                            this.player.velY = -15; // Monte un peu
                            this.player.velX = (Math.random() - 0.5) * 4; // Direction aléatoire
                            this.player.rotationSpeed = 0.15; // Tourne en tombant
                            this.player.flying = false;
                            this.player.parachuting = true;
                            this.player.parachuteTimer = 480;
                            
                            boss.active = false; // Désactiver l'animation
                            obstacle.hit = true;
                            
                            console.log('🦈 Bateau relâché et retombe en tournant!');
                            
                            if (this.player.lives <= 0) {
                                this.gameOver();
                                return;
                            }
                        }
                        
                        // Désactiver si sort de l'écran par le haut
                        if (boss.y < -400) { // Boss plus grand, attendre qu'il soit complètement sorti
                            boss.active = false;
                        }
                    }
                }
                else if (obstacle.type === 'jellyfish') {
                    // Collision avec la méduse/pieuvre - immobilise avec tentacules
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 50 && !obstacle.hit && !this.player.frozen) {
                        obstacle.hit = true;
                        
                        // Immobiliser le bateau pendant 3 secondes
                        this.player.frozen = true;
                        this.player.frozenTimer = 180; // 3 secondes (60 fps)
                        this.player.tentacleGrab = true; // Attrapé par les tentacules
                        
                        // Position de la pieuvre
                        this.player.jellyfishX = obstacle.x;
                        this.player.jellyfishY = obstacle.y;
                        
                        // Effet visuel
                        for (let i = 0; i < 20; i++) {
                            this.renderer.addParticle(
                                obstacle.x + (Math.random() - 0.5) * 80,
                                obstacle.y + (Math.random() - 0.5) * 80,
                                '💦',
                                '#FF69B4'
                            );
                        }
                        this.renderer.addParticle(obstacle.x, obstacle.y, '🐙', '#FF1493');
                        
                        if (this.audioManager && this.audioManager.initialized) {
                            this.audioManager.playCollisionSound();
                        }
                        
                        console.log('🐙 Bateau immobilisé par la pieuvre!');
                    }
                }
                else if (obstacle.type === 'rock') {
                    // Collision avec l'iceberg - COULE LE BATEAU
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 60 && !obstacle.hit && !this.player.invincible) {
                        obstacle.hit = true;
                        
                        // DÉGÂTS MASSIFS -13 vies (référence Titanic)
                        this.player.lives -= 13;
                        
                        // PAUSE DU JEU pour l'animation de naufrage
                        this.icebergSinking = true;
                        this.sinkingTimer = 0;
                        this.sinkingIceberg = {
                            x: obstacle.x,
                            y: obstacle.y
                        };
                        
                        // Son de collision
                        if (this.audioManager && this.audioManager.initialized) {
                            this.audioManager.playCollisionSound();
                        }
                        
                        console.log('🧊 ICEBERG! Le bateau coule...');
                    }
                }
                else if (obstacle.type === 'siren') {
                    // Charme du joueur (le ralentit)
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < obstacle.charmRadius) {
                        this.player.velX *= 0.95;
                        obstacle.singing = true;
                    }
                }
                else if (obstacle.type === 'wave') {
                    // Collision avec la vague - fait tanguer le bateau
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 60 && !obstacle.hit && !this.player.invincible) {
                        this.player.lives -= 1; // -1 vie
                        this.player.invincible = true;
                        this.player.invincibleTimer = 90;
                        obstacle.hit = true;
                        
                        // Effet de tangage (oscillation)
                        this.player.tangageTimer = 180; // 3 secondes de tangage
                        this.player.tangageIntensity = 0.4; // Intensité de l'oscillation
                        
                        // Effet visuel
                        for (let i = 0; i < 15; i++) {
                            this.renderer.addParticle(
                                obstacle.x + (Math.random() - 0.5) * 60,
                                obstacle.y + (Math.random() - 0.5) * 40,
                                '💦',
                                '#87CEEB'
                            );
                        }
                        this.renderer.addParticle(obstacle.x, obstacle.y, '🌊', '#4A90A4');
                        
                        if (this.audioManager && this.audioManager.initialized) {
                            this.audioManager.playCollisionSound();
                        }
                        
                        console.log('🌊 Bateau tangué par la vague!');
                        
                        if (this.player.lives <= 0) {
                            this.gameOver();
                            return;
                        }
                    }
                }
                
                // Collision avec le joueur
                const dx = obstacle.x - this.player.x;
                const dy = obstacle.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 50 && !obstacle.hit && !this.player.invincible && obstacle.damage > 0) {
                    this.player.lives -= obstacle.damage;
                    this.player.invincible = true;
                    this.player.invincibleTimer = 90;
                    obstacle.hit = true;
                    
                    if (this.audioManager && this.audioManager.initialized) {
                        this.audioManager.playCollisionSound();
                    }
                    
                    // Effet d'impact
                    this.renderer.addParticle(obstacle.x, obstacle.y, '💥', '#FF0000');
                    
                    if (this.player.lives <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            });
            
            // Nettoyer les obstacles sortis ou touchés
            this.level3Obstacles = this.level3Obstacles.filter(o => !o.hit && o.x > -150);
            
            // Animer les proverbes (viennent de droite)
            this.level3Proverbs.forEach((proverb, index) => {
                proverb.x -= proverb.speed;
                proverb.bobPhase += 0.05;
                proverb.y += Math.sin(proverb.bobPhase) * 0.5;
                
                // Vérifier collision avec le bateau et la voile
                // Zone du bateau: largeur 80, hauteur 30
                // Zone de la voile: largeur 35, hauteur 45
                const boatWidth = 80;
                const boatHeight = 30;
                const boatLeft = this.player.x - 10;
                const boatRight = this.player.x + boatWidth + 10;
                const boatTop = this.player.y + 20;
                const boatBottom = this.player.y + boatHeight + 20;
                
                // Zone de la voile (à droite du mât)
                const sailLeft = this.player.x + boatWidth / 2;
                const sailRight = this.player.x + boatWidth / 2 + 35;
                const sailTop = this.player.y - 30;
                const sailBottom = this.player.y + 18;
                
                // Collision avec le bateau
                const hitBoat = proverb.x + 20 > boatLeft && proverb.x - 20 < boatRight &&
                               proverb.y + 20 > boatTop && proverb.y - 20 < boatBottom;
                
                // Collision avec la voile
                const hitSail = proverb.x + 20 > sailLeft && proverb.x - 20 < sailRight &&
                               proverb.y + 20 > sailTop && proverb.y - 20 < sailBottom;
                
                if ((hitBoat || hitSail) && !proverb.collected) {
                    proverb.collected = true;
                    
                    // Accumuler la sagesse
                    this.level3Wisdom += proverb.wisdom || 0;
                    console.log(`📖 Sagesse accumulée: ${this.level3Wisdom}/777`);
                    
                    if (this.audioManager && this.audioManager.initialized) {
                        this.audioManager.playPocSound();
                    }
                    
                    this.player.lives = Math.min(this.player.maxLives, this.player.lives + 1);
                    
                    this.renderer.addParticle(proverb.x, proverb.y, '💦', '#4A90A4');
                    this.renderer.addParticle(proverb.x - 10, proverb.y - 10, '💧', '#87CEEB');
                    this.renderer.addParticle(proverb.x + 10, proverb.y - 10, '💧', '#87CEEB');
                    this.renderer.addParticle(proverb.x, proverb.y + 10, '✨', '#FFD700');
                    
                    if (this.notificationSystem) {
                        this.notificationSystem.showSplash({
                            x: this.canvas.width / 2,
                            y: 80,
                            icon: proverb.icon,
                            text: proverb.text,
                            color: '#4A90A4',
                            duration: 3000
                        });
                    }
                    
                    console.log(`📖 Proverbe collecté! Vies: ${this.player.lives}/${this.player.maxLives}`);
                    
                    // Vérifier si on a atteint 777 points de sagesse
                    if (this.level3Wisdom >= 777 && !this.heavenGate.visible) {
                        this.triggerLevel3Victory();
                    }
                }
            });
            
            // Nettoyer les proverbes collectés ou sortis
            this.level3Proverbs = this.level3Proverbs.filter(p => !p.collected && p.x > -100);
            
            return;
        }
        
        // NIVEAU 2: Les 7 Péchés Capitaux
        if (this.level2Active) {
            this.level2Timer++;
            this.level2Survived++;
            
            // Faire apparaître les péchés aléatoirement
            if (this.level2Timer >= this.level2SpawnRate) {
                const sin = SevenSins.getRandom();
                this.obstacleManager.obstacles.push(sin);
                this.level2Timer = 0;
                
                // Augmenter progressivement la difficulté
                this.level2SpawnRate = Math.max(60, this.level2SpawnRate - 1);
            }
            
            // Mettre à jour les systèmes (sans spawner autres obstacles)
            this.player.update();
            this.powerUpManager.update();
            this.waterTankSystem.update();
            
            // Mettre à jour seulement les obstacles existants
            for (let i = this.obstacleManager.obstacles.length - 1; i >= 0; i--) {
                const obs = this.obstacleManager.obstacles[i];
                obs.x -= this.gameSpeed;
                
                // Vérifier collision
                if (this.obstacleManager.checkCollision(obs)) {
                    // Tous les péchés font 3 dégâts
                    if (obs.type === 'sin') {
                        for (let d = 0; d < obs.damage; d++) {
                            const stillAlive = this.player.loseLife();
                            if (!stillAlive) {
                                this.gameOver();
                                return;
                            }
                        }
                        this.obstacleManager.createExplosion(obs.x + obs.width/2, obs.y + obs.height/2);
                        this.obstacleManager.obstacles.splice(i, 1);
                    }
                }
                
                // Retirer si hors écran
                if (obs.x < -100) {
                    this.obstacleManager.obstacles.splice(i, 1);
                }
            }
            
            return;
        }
        
        // Mettre à jour tous les systèmes
        this.player.update();
        this.obstacleManager.update();
        this.powerUpManager.update();
        this.waterTankSystem.update();
        this.laserSystem.update();
        
        // Tirer si un input est maintenu (mode infini uniquement)
        if (this.mode === 'endless' && this.laserSystem) {
            const isFiring = this.inputManager.keyboard?.isFiring() || 
                           this.inputManager.mouse?.isFiring() || 
                           this.inputManager.touch?.isFiring();
            if (isFiring) {
                this.laserSystem.fire();
            }
        }
        
        // Incrémenter le compteur de frames
        this.frameCount++;
        
        // Mode spécifique
        if (this.mode === 'endless') {
            this.endlessMode.update();
        } else {
            this.heavenGate?.update();
        }
        
        // Vitesse fixe - ne change plus avec les obstacles
        // (Code d'augmentation de vitesse désactivé)
    }
    
    onObstacleCleared(obstacle) {
        this.obstaclesCleared++;
        this.score += 100;
        
        // Ajouter de l'XP pour l'obstacle évité
        if (this.obstacleManager) {
            this.obstacleManager.addXP(10); // +10 XP par obstacle
        }
        
        console.log(`🎯 Obstacle surmonté: ${obstacle.id || 'sans ID'}`);
        
        // Afficher la bulle narrative BD pour cet obstacle
        if (this.notificationSystem && obstacle.id) {
            const messageData = NarrativeData[obstacle.id];
            console.log(`📖 Recherche message pour: ${obstacle.id}`, messageData ? '✅ Trouvé' : '❌ Pas trouvé');
            if (messageData && messageData.hope) {
                console.log(`💭 Affichage bulle: "${messageData.hope.substring(0, 30)}..."`);
                this.notificationSystem.showNarrative({
                    text: messageData.hope,
                    duration: 3000,
                    onClose: () => {
                        console.log(`✅ Bulle fermée, appel onMessagePopped()`);
                        if (this.obstacleManager) {
                            this.obstacleManager.onMessagePopped();
                        }
                    }
                });
            }
        }
        
        // Débloquer le trophée (XP au lieu du message)
        this.trophySystem.unlockTrophy(obstacle.id);
    }
    
    gameOver() {
        console.log('💀 Game Over');
        
        // Arrêter sauvegarde auto et sauvegarder une dernière fois
        this.stopAutoSave();
        this.saveCurrentScore();
        console.log('💾 Score sauvegardé au game over');
        
        // Si on est en niveau 2, afficher le choix de la grâce
        if (this.level2Active) {
            this.showGraceChoice();
            return;
        }
        
        // En mode endless, créer la porte si elle n'existe pas
        if (this.mode === 'endless' && !this.heavenGate) {
            this.heavenGate = new HeavenGate(this);
        }
        
        // Sinon, animation normale vers le paradis
        console.log('💀 Game Over - Montée au paradis...');
        this.gameOverAnimation = true;
        this.gameOverTimer = 0;
        this.gameOverPhase = 'flying';
        this.rejectionBubble = null;
        
        // Faire apparaître/positionner la porte du paradis
        if (this.heavenGate) {
            this.heavenGate.visible = true;
            // Positionner la porte dans le canvas
            this.heavenGate.x = Math.min(this.canvas.width - this.heavenGate.width - 50, this.player.x + 250);
            this.heavenGate.y = Math.max(50, Math.min(200, this.player.y - 150));
            console.log('🚪 La Porte du Paradis brille...');
        }
        
        // Arrêter le vol normal
        this.player.flying = false;
        this.player.parachuting = false;
        
        // Vitesse initiale modérée vers la porte
        this.player.velX = 3;
        this.player.velY = -3;
    }
    
    showGraceChoice() {
        console.log('✝️ Choix de la Grâce...');
        this.running = false;
        this.level2Active = false;
        
        // Créer un overlay pour le choix
        const overlay = document.createElement('div');
        overlay.id = 'grace-choice-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Press Start 2P', monospace;
        `;
        
        const title = document.createElement('div');
        title.textContent = '🚪 LA PORTE DU PARADIS';
        title.style.cssText = `
            color: #FFD700;
            font-size: 24px;
            margin-bottom: 30px;
            text-shadow: 0 0 10px #FFD700;
        `;
        
        const message = document.createElement('div');
        message.textContent = `Tu as survécu ${Math.floor(this.level2Survived / 60)} secondes`;
        message.style.cssText = `
            color: white;
            font-size: 14px;
            margin-bottom: 50px;
        `;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = `
            display: flex;
            gap: 30px;
        `;
        
        const continueBtn = document.createElement('button');
        continueBtn.textContent = 'CONTINUER';
        continueBtn.style.cssText = `
            font-family: 'Press Start 2P', monospace;
            font-size: 16px;
            padding: 20px 30px;
            background: #4CAF50;
            color: white;
            border: 3px solid #45a049;
            cursor: pointer;
            text-shadow: 2px 2px #000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        `;
        continueBtn.onmouseover = () => continueBtn.style.background = '#45a049';
        continueBtn.onmouseout = () => continueBtn.style.background = '#4CAF50';
        continueBtn.onclick = () => {
            document.body.removeChild(overlay);
            this.restartLevel2();
        };
        
        const graceBtn = document.createElement('button');
        graceBtn.textContent = 'CHOISIR LA GRÂCE';
        graceBtn.style.cssText = `
            font-family: 'Press Start 2P', monospace;
            font-size: 16px;
            padding: 20px 30px;
            background: #FFD700;
            color: #000;
            border: 3px solid #FFA500;
            cursor: pointer;
            text-shadow: 2px 2px rgba(255,255,255,0.5);
            box-shadow: 0 5px 15px rgba(255,215,0,0.5);
        `;
        graceBtn.onmouseover = () => graceBtn.style.background = '#FFA500';
        graceBtn.onmouseout = () => graceBtn.style.background = '#FFD700';
        graceBtn.onclick = () => {
            document.body.removeChild(overlay);
            this.acceptGrace();
        };
        
        buttonsDiv.appendChild(continueBtn);
        buttonsDiv.appendChild(graceBtn);
        
        overlay.appendChild(title);
        overlay.appendChild(message);
        overlay.appendChild(buttonsDiv);
        
        document.body.appendChild(overlay);
    }
    
    restartLevel2() {
        console.log('🔄 Redémarrage Niveau 2');
        this.player.lives = 3;
        this.player.x = 100;
        this.player.y = this.player.groundY;
        this.startLevel2();
        this.running = true;
        this.gameLoop();
    }
    
    acceptGrace() {
        console.log('✝️ Grâce acceptée - Transition vers la Sagesse');
        
        // Message de transition
        if (this.notificationSystem) {
            this.notificationSystem.showNarrative({
                text: 'NIVEAU 3: LA QUÊTE DE LA SAGESSE',
                duration: 3000
            });
        }
        
        // Lancer le niveau 3 après un court délai
        setTimeout(() => {
            // Débloquer le trophée La grâce
            if (this.trophySystem) {
                this.trophySystem.unlockTrophy('grace');
                console.log('✝️ Trophée La grâce débloqué!');
            }
            
            // Sauvegarder le score avant de passer au niveau 3
            this.saveCurrentScore();
            console.log('💾 Score sauvegardé à la fin du niveau 2');
            this.startLevel3();
        }, 3000);
    }
    
    startLevel3() {
        console.log('🚤 NIVEAU 3: Navigation et Sagesse commence!');
        this.currentLevel = 3;
        localStorage.setItem('xsheep_currentLevel', '3');
        this.level3Active = true;
        this.level2Active = false;
        this.level3Timer = 0; // Timer normal
        this.level3ObstacleTimer = 0;
        this.level3Wisdom = 0;
        this.level3FirstProverbSpawned = false; // Flag pour le premier proverbe
        this.level3Proverbs = [];
        this.level3Obstacles = [];
        this.level3Projectiles = [];
        this.boatMode = true;
        this.leviathanDefeated = false;
        
        // Nettoyer toutes les bulles actives
        if (this.notificationSystem) {
            this.notificationSystem.clearAll();
        }
        
        // Nettoyer les power-ups du niveau 2
        if (this.powerUpManager) {
            this.powerUpManager.powerUps = [];
        }
        
        // Nettoyer les réservoirs de carburant
        if (this.waterTankSystem) {
            this.waterTankSystem.tanks = [];
        }
        
        // Nettoyer les particules
        if (this.renderer) {
            this.renderer.particles = [];
        }
        
        // Créer le phare au fond à droite sur un rocher au sommet de l'eau
        this.lighthouse = new Lighthouse(880, 180);
        
        // Réinitialiser le joueur
        this.player.lives = 3;
        this.player.x = 100;
        this.player.y = 380; // Sur l'eau
        this.player.velX = 0;
        this.player.velY = 0;
        
        // Nettoyer les obstacles du niveau 2
        this.obstacleManager.obstacles = [];
        this.obstacleManager.weapons = [];
        this.obstacleManager.bossLine = [];
        this.obstacleManager.projectiles = [];
        
        // Message d'instruction
        if (this.notificationSystem) {
            this.notificationSystem.showNarrative({
                text: 'Navigue sur les eaux nocturnes, collecte la sagesse et évite les dangers marins !',
                duration: 5000
            });
        }
        
        this.running = true;
        this.gameLoop();
    }
    
    triggerLevel3Victory() {
        console.log('🎊 777 points de sagesse atteints ! Porte du paradis apparaît!');
        
        // Faire apparaître la porte du paradis
        if (this.heavenGate) {
            this.heavenGate.visible = true;
            this.heavenGate.x = this.canvas.width / 2 - this.heavenGate.width / 2;
            this.heavenGate.y = 100;
        }
        
        // Message
        if (this.notificationSystem) {
            this.notificationSystem.showNarrative({
                text: '🚪 La Porte du Paradis s\'ouvre ! Tu as atteint 777 points de sagesse !',
                duration: 4000
            });
        }
        
        // Lancer l'animation d'entrée après 2 secondes
        setTimeout(() => {
            this.startLevel3EnterHeaven();
        }, 2000);
    }
    
    startLevel3EnterHeaven() {
        console.log('✨ Le mouton entre au paradis...');
        this.level3Entering = true;
        this.level3EnterTimer = 0;
    }
    
    fireBulletAtLeviathan() {
        if (!this.leviathan || !this.leviathan.isActive || this.leviathan.defeated) return;
        
        // Créer un projectile du joueur vers le Léviathan
        const bullet = {
            x: this.player.x + 40,
            y: this.player.y,
            width: 20,
            height: 20,
            velX: 6,
            velY: 0,
            icon: '⚡',
            damage: 1
        };
        
        this.level3Projectiles.push(bullet);
        
        // Son de tir
        if (this.audioManager && this.audioManager.initialized) {
            this.audioManager.playPocSound();
        }
        
        // Vérifier collision avec le Léviathan
        setTimeout(() => {
            const dx = bullet.x - (this.leviathan.x + this.leviathan.width / 2);
            const dy = bullet.y - (this.leviathan.y + this.leviathan.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const defeated = this.leviathan.takeDamage(bullet.damage);
                bullet.hit = true;
                
                // Effet d'impact
                this.renderer.addParticle(this.leviathan.x + this.leviathan.width / 2, this.leviathan.y + this.leviathan.height / 2, '💥', '#FFD700');
                
                if (defeated) {
                    this.leviathanDefeated = true;
                    
                    if (this.notificationSystem) {
                        this.notificationSystem.showNarrative({
                            text: '🐉 LÉVIATHAN VAINCU ! Collecte la sagesse pour ouvrir le paradis !',
                            duration: 4000
                        });
                    }
                    
                    // Son de victoire
                    if (this.audioManager && this.audioManager.initialized) {
                        this.audioManager.playCollectSound();
                    }
                }
            }
        }, 100);
    }
    
    showLevel3Victory() {
        console.log('🎊 Niveau 3 Terminé! Sagesse complète!');
        this.running = false;
        this.level3Active = false;
        
        // Arrêter sauvegarde auto
        this.stopAutoSave();
        
        // Débloquer le trophée final "Mouton blanc : la grâce"
        if (this.trophySystem) {
            this.trophySystem.unlockTrophy('white_sheep');
            console.log('🐑✨ Trophée final débloqué : Mouton blanc - La Grâce');
        }
        
        // Sauvegarder le score aventure final (score + XP)
        if (this.mode === 'adventure') {
            this.saveCurrentScore();
            const scoreManager = new ScoreManager();
            const xp = this.obstacleManager ? this.obstacleManager.totalXP : 0;
            const finalScore = this.score + xp;
            const cumulativeScore = scoreManager.addAdventureScore(finalScore);
            console.log('💾 Cumul aventure:', finalScore, '| Nouveau total:', cumulativeScore);
        }
        
        // Calculer le score final pour l'affichage
        const xp = this.obstacleManager ? this.obstacleManager.totalXP : 0;
        const displayScore = this.score + xp;
        
        // Créer une popup de victoire en format horizontal
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(10,14,39,0.95), rgba(26,58,82,0.95));
            padding: 25px 40px;
            border-radius: 20px;
            border: 3px solid #FFD700;
            box-shadow: 0 0 50px rgba(255,215,0,0.6), 0 10px 40px rgba(0,0,0,0.8);
            z-index: 10000;
            font-family: 'Press Start 2P', monospace;
            text-align: center;
            max-width: 800px;
            max-height: 70vh;
            overflow-y: auto;
            animation: popupAppear 0.5s ease-out;
        `;
        
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popupAppear {
                from {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        const finalMessage = document.createElement('div');
        finalMessage.innerHTML = `
            <div style="color: #FFD700; font-size: 28px; margin-bottom: 20px; text-shadow: 0 0 30px #FFD700;">
                ✨ BRAVO ✨
            </div>
            <div style="display: flex; align-items: center; justify-content: space-around; gap: 30px;">
                <div style="flex: 1; color: white; font-size: 10px; line-height: 2; text-align: left;">
                    La grâce de Jésus est une sagesse certaine.<br><br>
                    <span style="color: #FFD700;">
                        Garde ta lumière allumée<br>
                        et ton cœur éveillé.
                    </span><br><br>
                    <span style="color: #4A90A4; font-size: 14px; text-shadow: 0 0 10px #4A90A4;">
                        Choisis la vie.
                    </span>
                </div>
                <div style="padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; min-width: 180px;">
                    <div style="color: #FFD700; font-size: 12px;">SCORE TOTAL</div>
                    <div style="color: #00FF00; font-size: 24px; margin-top: 10px;">${displayScore.toLocaleString('fr-FR')}</div>
                    <div style="color: #888; font-size: 8px; margin-top: 5px;">(${this.score} + ${xp} XP)</div>
                    <div style="color: white; font-size: 11px; margin-top: 10px;">
                        ❤️ ${this.player.lives}/${this.player.maxLives} vies
                    </div>
                    <div style="margin-top: 15px; font-size: 20px;">
                        🐑 ✨ 🌙
                    </div>
                </div>
            </div>
            <button id="return-menu" style="
                margin-top: 25px;
                font-family: 'Press Start 2P', monospace;
                font-size: 11px;
                padding: 10px 20px;
                background: #4A90A4;
                color: white;
                border: 2px solid #6AB0C4;
                cursor: pointer;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(74,144,164,0.5);
                transition: all 0.3s;
            " onmouseover="this.style.background='#6AB0C4'" onmouseout="this.style.background='#4A90A4'">
                RETOUR AU MENU
            </button>
        `;
        
        popup.appendChild(finalMessage);
        document.body.appendChild(popup);
        
        document.getElementById('return-menu').onclick = () => {
            // Score déjà sauvegardé dans showLevel3Victory()
            // Attendre un peu pour s'assurer que localStorage est synchronisé
            setTimeout(() => {
                location.reload();
            }, 50);
        };
    }
    
    victory() {
        console.log('✨ VICTOIRE! Tous les boss éliminés!');
        
        // Message de transition
        if (this.notificationSystem) {
            this.notificationSystem.showNarrative({
                text: 'NIVEAU 2: LES 7 PÉCHÉS CAPITAUX',
                duration: 3000
            });
        }
        
        // Lancer le niveau 2 après un court délai
        setTimeout(() => {
            // Débloquer le trophée Pièce d'or
            if (this.trophySystem) {
                this.trophySystem.unlockTrophy('gold_coin');
                console.log('💰 Trophée Pièce d\'or débloqué!');
            }
            
            // Sauvegarder le score avant de passer au niveau 2
            this.saveCurrentScore();
            console.log('💾 Score sauvegardé à la fin du niveau 1');
            this.startLevel2();
        }, 3000);
    }
    
    startLevel2() {
        console.log('🔥 NIVEAU 2: Les 7 Péchés Capitaux commence!');
        this.currentLevel = 2;
        this.level2Active = true;
        this.level2Timer = 0;
        this.level2Survived = 0;
        this.currentLevel = 2;
        localStorage.setItem('xsheep_currentLevel', '2');
        
        // Nettoyer TOUS les éléments du niveau 1
        this.obstacleManager.obstacles = [];
        this.obstacleManager.weapons = [];
        this.obstacleManager.bossLine = [];
        this.obstacleManager.projectiles = [];
        
        // Nettoyer les power-ups
        if (this.powerUpManager) {
            this.powerUpManager.powerUps = [];
        }
        
        // Nettoyer les réservoirs de carburant
        if (this.waterTankSystem) {
            this.waterTankSystem.tanks = [];
        }
        
        // Nettoyer les particules
        if (this.renderer) {
            this.renderer.particles = [];
        }
        
        // Nettoyer les bulles BD
        if (this.notificationSystem) {
            this.notificationSystem.clearAll();
        }
        
        // Message d'avertissement
        if (this.notificationSystem) {
            this.notificationSystem.showNarrative({
                text: 'Survie impossible... Résiste le plus longtemps possible!',
                duration: 3000
            });
        }
    }
    
    showAdventureGameOver() {
        // Écran Game Over mode aventure
        const xp = this.obstacleManager ? this.obstacleManager.totalXP : 0;
        const totalScore = this.score + xp;
        
        // Sauvegarder le score et mettre à jour le cumul
        this.saveCurrentScore();
        const scoreManager = new ScoreManager();
        const cumulativeScore = scoreManager.addAdventureScore(totalScore);
        console.log('💾 Cumul aventure:', totalScore, '| Nouveau total:', cumulativeScore);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <h1 style="font-size: 48px; margin: 20px; color: #ff6b6b;">GAME OVER</h1>
            <p style="font-size: 24px; margin: 10px;">🔄 Va vivre! et renais ! RETOURNE VIVRE !</p>
            <p style="font-size: 28px; margin: 15px; color: #00FF00; font-weight: bold;">
                Score Total: ${totalScore.toLocaleString('fr-FR')}
            </p>
            <p style="font-size: 16px; margin: 5px; color: #888;">
                (Score: ${this.score.toLocaleString('fr-FR')} + XP: ${xp.toLocaleString('fr-FR')})
            </p>
            <p style="font-size: 20px; margin: 10px;">Obstacles évités: ${this.obstaclesCleared}</p>
            <button id="retry-btn" style="
                margin-top: 30px;
                padding: 15px 40px;
                font-size: 24px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            ">Réessayer</button>
            <button id="menu-btn" style="
                margin-top: 15px;
                padding: 12px 30px;
                font-size: 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            ">Menu Principal</button>
        `;
        
        document.body.appendChild(overlay);
        
        document.getElementById('retry-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            // Toujours redémarrer au niveau 1 après un Game Over
            this.restart(1);
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            // Score déjà sauvegardé dans saveCurrentScore() au game over
            // Attendre un peu pour s'assurer que localStorage est synchronisé
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 50);
        });
    }
    
    restart() {
        const level = this.currentLevel;
        console.log(`🔄 Redémarrage au niveau ${level}`);
        
        // Arrêter sauvegarde auto
        this.stopAutoSave();
        
        // Réinitialiser les états
        this.running = false;
        this.level2Active = false;
        this.level3Active = false;
        this.gameOverAnimation = false;
        this.victoryAnimation = false;
        this.boatMode = false;
        
        // Réinitialiser le joueur
        this.player.x = 200;
        this.player.y = this.canvas.height / 2;
        this.player.velX = 0;
        this.player.velY = 0;
        this.player.lives = this.player.maxLives;
        this.player.fuel = 100;
        this.player.bonusFuel = 0;
        this.player.invincible = false;
        this.player.flying = false;
        this.player.parachuting = false;
        this.player.rotation = 0;
        this.player.rotationSpeed = 0;
        
        // Nettoyer obstacles
        if (this.obstacleManager) {
            this.obstacleManager.obstacles = [];
            this.obstacleManager.weapons = [];
            this.obstacleManager.bossLine = [];
            this.obstacleManager.projectiles = [];
        }
        
        this.level3Proverbs = [];
        this.level3Obstacles = [];
        this.level3Projectiles = [];
        this.leviathan = null;
        this.leviathanDefeated = false;
        
        // Redémarrer au bon niveau
        if (level === 1) {
            this.running = true;
            this.gameLoop();
        } else if (level === 2) {
            this.startLevel2();
        } else if (level === 3) {
            this.startLevel3();
        }
    }
    
    restart(level = 1) {
        console.log(`🔄 Redémarrage au niveau ${level}`);
        
        // Réinitialiser les propriétés du jeu
        this.running = false;
        this.level2Active = false;
        this.level3Active = false;
        this.gameOverAnimation = false;
        this.victoryAnimation = false;
        this.boatMode = false;
        
        // Réinitialiser le joueur
        this.player.x = 200;
        this.player.y = this.canvas.height / 2;
        this.player.velX = 0;
        this.player.velY = 0;
        this.player.lives = this.player.maxLives;
        this.player.fuel = 100;
        this.player.bonusFuel = 0;
        this.player.invincible = false;
        this.player.flying = false;
        this.player.parachuting = false;
        this.player.rotation = 0;
        this.player.rotationSpeed = 0;
        this.player.whirlpoolScale = 1.0;
        this.player.tangageTimer = 0;
        this.player.tentacleGrab = false;
        
        // Nettoyer les obstacles
        if (this.obstacleManager) {
            this.obstacleManager.obstacles = [];
            this.obstacleManager.weapons = [];
            this.obstacleManager.bossLine = [];
            this.obstacleManager.projectiles = [];
        }
        
        this.level3Proverbs = [];
        this.level3Obstacles = [];
        this.level3Projectiles = [];
        this.leviathan = null;
        this.leviathanDefeated = false;
        this.level3Wisdom = 0;
        this.level3FirstProverbSpawned = false;
        
        // Cacher la porte du paradis
        if (this.heavenGate) {
            this.heavenGate.visible = false;
        }
        
        // Redémarrer au bon niveau
        if (level === 1) {
            this.currentLevel = 1;
            localStorage.setItem('xsheep_currentLevel', '1');
            this.running = true;
            this.gameLoop();
        } else if (level === 2) {
            this.startLevel2();
        } else if (level === 3) {
            this.startLevel3();
        }
    }
    
    showVictoryScreen() {
        // Activer l'écran de victoire dans le canvas
        this.victoryScreenActive = true;
        this.victoryScreenData = {
            score: this.score,
            obstaclesCleared: this.obstaclesCleared
        };
        this.paused = true;

        // Définir les boutons (compacts)
        this.victoryButtons = {
            continue: {
                x: this.canvas.width / 2 - 100,
                y: this.canvas.height - 120,
                width: 200,
                height: 40,
                text: 'Continuer 🌟'
            },
            menu: {
                x: this.canvas.width / 2 - 100,
                y: this.canvas.height - 70,
                width: 200,
                height: 40,
                text: 'Menu'
            }
        };

        // Ajouter le listener de clic
        this.victoryClickHandler = this.handleVictoryClick.bind(this);
        this.canvas.addEventListener('click', this.victoryClickHandler);
    }

    handleVictoryClick(event) {
        if (!this.victoryScreenActive || !this.victoryButtons) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Vérifier clic sur "Continuer"
        const continueBtn = this.victoryButtons.continue;
        if (x >= continueBtn.x && x <= continueBtn.x + continueBtn.width &&
            y >= continueBtn.y && y <= continueBtn.y + continueBtn.height) {
            this.canvas.removeEventListener('click', this.victoryClickHandler);
            this.victoryScreenActive = false;

            // Message de félicitations
            if (this.notificationSystem) {
                this.notificationSystem.showNarrative({
                    text: "Bravo ! Tu as persévéré et vaincu tous les obstacles. La patience et la détermination sont les clés du succès. Prêt pour le niveau suivant ?",
                    duration: 5000
                });
            }

            // Continuer vers niveau 2
            setTimeout(() => {
                window.location.reload();
            }, 5000);
            return;
        }

        // Vérifier clic sur "Menu"
        const menuBtn = this.victoryButtons.menu;
        if (x >= menuBtn.x && x <= menuBtn.x + menuBtn.width &&
            y >= menuBtn.y && y <= menuBtn.y + menuBtn.height) {
            this.canvas.removeEventListener('click', this.victoryClickHandler);
            window.location.href = 'index.html';
        }
    }

    renderVictoryScreen(ctx) {
        if (!this.victoryScreenActive) return;

        // Fond avec gradient animé
        const time = Date.now() * 0.001;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#667eea');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Étoiles scintillantes en arrière-plan
        for (let i = 0; i < 20; i++) {
            const x = (i * 73 + time * 20) % this.canvas.width;
            const y = (i * 97) % this.canvas.height;
            const opacity = 0.3 + Math.sin(time * 2 + i) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.font = '20px Arial';
            ctx.fillText('⭐', x, y);
        }

        // Animation mouton poursuivi par 3 boss (haut de l'écran)
        const chaseY = 60;
        const chaseSpeed = time * 150;
        const sheepX = (chaseSpeed % (this.canvas.width + 500)) - 200;

        // Boss 3 (Mort) - le plus loin
        const boss3X = sheepX - 180;
        ctx.font = '30px Arial';
        ctx.fillText('💀', boss3X, chaseY);

        // Boss 2 (Folie) - au milieu
        const boss2X = sheepX - 120;
        ctx.font = '28px Arial';
        ctx.fillText('🌀', boss2X, chaseY - 5);

        // Boss 1 (Colère) - le plus proche
        const boss1X = sheepX - 70;
        ctx.font = '32px Arial';
        ctx.fillText('😡', boss1X, chaseY);

        // Le vrai mouton du jeu (via sheepAnimator)
        ctx.save();
        const sheepScale = 0.8;
        this.renderer.sheepAnimator.draw(
            ctx,
            sheepX - 18,  // Ajuster position X pour centrer
            chaseY - 20,  // Ajuster position Y pour centrer
            sheepScale,   // Taille réduite
            0,            // Pas de cheveux
            'normal',     // État normal
            false,        // Pas de roulement
            0             // Pas d'effet cheveux
        );

        // Effet de vitesse (💨)
        ctx.font = '24px Arial';
        ctx.fillText('💨', sheepX - 45, chaseY);

        ctx.restore();

        // Animation retour en bas par la gauche - mouton poursuivi par robot
        const chaseBottomY = this.canvas.height - 60;
        const chaseBackSpeed = time * 180;
        // Le mouton revient de droite vers gauche (sens inverse)
        const sheepBackX = this.canvas.width + 200 - (chaseBackSpeed % (this.canvas.width + 500));

        // Boss Robot poursuivant (derrière le mouton)
        const robotX = sheepBackX + 90;
        ctx.font = '38px Arial';
        ctx.fillText('🤖', robotX, chaseBottomY);

        // Le vrai mouton du jeu qui revient (via sheepAnimator)
        ctx.save();
        // Flip horizontal pour le mouton regardant à gauche
        ctx.translate(sheepBackX, 0);
        ctx.scale(-1, 1);
        ctx.translate(-sheepBackX, 0);

        this.renderer.sheepAnimator.draw(
            ctx,
            sheepBackX - 18,  // Ajuster position X pour centrer
            chaseBottomY - 20, // Ajuster position Y pour centrer
            0.8,               // Taille réduite
            0,                 // Pas de cheveux
            'normal',          // État normal
            false,             // Pas de roulement
            0                  // Pas d'effet cheveux
        );

        // Effet de vitesse inverse (💨 devant le mouton)
        ctx.scale(-1, 1); // Annuler le flip pour le emoji
        ctx.fillStyle = '#000';
        ctx.font = '24px Arial';
        ctx.fillText('💨', -sheepBackX - 50, chaseBottomY);

        ctx.restore();

        // Animation de titre (bounce)
        const bounceOffset = Math.sin(time * 3) * 8;

        // Titre futuriste avec effet néon réduit
        ctx.fillStyle = '#00FFFF';
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 3;
        ctx.font = 'bold 52px Impact, Arial Black, Arial';
        ctx.textAlign = 'center';

        // Effet d'ombre néon léger
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeText('VICTOIRE TOTALE', this.canvas.width / 2, 130 + bounceOffset);
        ctx.fillText('VICTOIRE TOTALE', this.canvas.width / 2, 130 + bounceOffset);

        ctx.shadowBlur = 0;

        // Sous-titres futuristes
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 2;
        ctx.font = 'bold 24px Impact, Arial Black, Arial';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 5;
        ctx.strokeText('⚔️ BOSS ANNIHILÉS ⚔️', this.canvas.width / 2, 175);
        ctx.fillText('⚔️ BOSS ANNIHILÉS ⚔️', this.canvas.width / 2, 175);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Impact, Arial Black, Arial';
        ctx.shadowBlur = 4;
        ctx.fillText('👑 LÉGENDE CONFIRMÉE 👑', this.canvas.width / 2, 205);

        // Message de persévérance futuriste
        ctx.shadowBlur = 3;
        ctx.font = 'bold 18px Impact, Arial Black, Arial';
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.fillText('COMBAT VICTORIEUX JUSQU\'AU BOUT', this.canvas.width / 2, 240);
        ctx.fillText('PERSÉVÉRANCE = VICTOIRE', this.canvas.width / 2, 265);

        // Score futuriste
        ctx.shadowBlur = 5;
        ctx.font = 'bold 22px Impact, Arial Black, Arial';
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#008800';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00FF00';
        const scoreText = `SCORE: ${this.victoryScreenData.score.toLocaleString('fr-FR')}`;
        ctx.strokeText(scoreText, this.canvas.width / 2, 310);
        ctx.fillText(scoreText, this.canvas.width / 2, 310);

        ctx.font = 'bold 18px Impact, Arial Black, Arial';
        ctx.fillStyle = '#FFF';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#FFF';
        ctx.fillText(`OBSTACLES DÉTRUITS: ${this.victoryScreenData.obstaclesCleared}`, this.canvas.width / 2, 340);

        // Bouton "Continuer" futuriste avec effet néon réduit
        const continueBtn = this.victoryButtons.continue;
        const pulseBtn = 1 + Math.sin(time * 4) * 0.1;

        // Effet glow léger autour du bouton
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 8 * pulseBtn;

        const gradientBtn = ctx.createLinearGradient(continueBtn.x, continueBtn.y, continueBtn.x + continueBtn.width, continueBtn.y);
        gradientBtn.addColorStop(0, '#00FFFF');
        gradientBtn.addColorStop(0.5, '#0088FF');
        gradientBtn.addColorStop(1, '#00FFFF');
        ctx.fillStyle = gradientBtn;
        ctx.fillRect(continueBtn.x, continueBtn.y, continueBtn.width, continueBtn.height);

        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(continueBtn.x, continueBtn.y, continueBtn.width, continueBtn.height);

        ctx.fillStyle = '#000';
        ctx.shadowBlur = 0;
        ctx.font = 'bold 22px Impact, Arial Black, Arial';
        ctx.fillText('CONTINUER', continueBtn.x + continueBtn.width / 2, continueBtn.y + continueBtn.height / 2 + 8);

        // Bouton "Menu" futuriste
        const menuBtn = this.victoryButtons.menu;
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 5;

        ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
        ctx.fillRect(menuBtn.x, menuBtn.y, menuBtn.width, menuBtn.height);

        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(menuBtn.x, menuBtn.y, menuBtn.width, menuBtn.height);

        ctx.fillStyle = '#FFF';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#FFF';
        ctx.font = 'bold 18px Impact, Arial Black, Arial';
        ctx.fillText('MENU', menuBtn.x + menuBtn.width / 2, menuBtn.y + menuBtn.height / 2 + 7);

        // Réinitialiser les effets
        ctx.shadowBlur = 0;
    }
    
    restartEndlessMode() {
        console.log('🔄 Redémarrage automatique du mode infini...');
        
        // Réinitialiser l'animation
        this.gameOverAnimation = false;
        this.gameOverTimer = 0;
        this.gameOverPhase = 'flying';
        this.rejectionBubble = null;
        
        // Cacher la porte
        if (this.heavenGate) {
            this.heavenGate.visible = false;
        }
        
        // Réinitialiser le joueur
        this.player.lives = this.player.maxLives;
        this.player.x = GameConfig.PLAYER.START_X;
        this.player.y = GameConfig.CANVAS_HEIGHT / 2;
        this.player.velX = 0;
        this.player.velY = 0;
        this.player.flying = true;
        this.player.fuel = this.player.maxFuel;
        this.player.size = 1.0;
        this.player.rotation = 0;
        this.player.invincible = true;
        this.player.invincibleTimer = 120; // 2 secondes d'invincibilité
        
        // Activer le point d'exclamation de détermination
        this.player.exclamationMark = true;
        this.player.exclamationTimer = 120; // 2 secondes
        
        // Réinitialiser le mode endless (nouveau cycle de boss)
        if (this.endlessMode) {
            this.endlessMode.active = true;
            this.endlessMode.distance = 0;
            this.endlessMode.obstacles = [];
            this.endlessMode.fuels = [];
            this.endlessMode.spawnTimer = 0;
            this.endlessMode.fuelTimer = 0;
            this.endlessMode.waveLevel = 1;
            // NE PAS réinitialiser le score ni le boss count (continuer la progression)
            this.endlessMode.resetBoss();
        }
        
        // Relancer le jeu
        this.running = true;
        
        // Message de motivation
        this.renderer.addParticle(
            GameConfig.CANVAS_WIDTH / 2,
            GameConfig.CANVAS_HEIGHT / 2,
            '🐑 JAMAIS ABANDONNER ! 🐑',
            '#FFD700'
        );
        
        console.log('✨ Mode infini redémarré avec succès!');
    }
}
