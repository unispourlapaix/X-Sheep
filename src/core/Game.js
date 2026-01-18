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
import { Lighthouse } from '../graphics/Lighthouse.js';
import { SeaObstacles, Leviathan } from '../obstacles/SeaObstacles.js';

export class Game {
    constructor(mode, trophySystem = null) {
        this.mode = mode; // 'adventure' ou 'endless'
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.paused = false;
        
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
        this.gameOverAnimation = false; // Animation vers le paradis
        this.gameOverTimer = 0;
        this.gameOverPhase = 'flying'; // 'flying', 'entering', 'rejected', 'done'
        this.rejectionBubble = null;
        this.victoryAnimation = false; // Animation de victoire
        this.victoryTimer = 0;
        this.victoryPhase = 'celebration'; // 'celebration', 'entering', 'heaven'
        
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
        this.level3SpawnRate = 120; // Nouveau proverbe toutes les 2 secondes (plus rapide)
        this.level3ObstacleSpawnRate = 300; // Obstacles toutes les 5 secondes (plus lent)
        this.level3ObstacleTimer = 0;
        this.level3Obstacles = []; // Obstacles marins
        this.level3Projectiles = []; // Projectiles du Léviathan
        this.boatMode = false; // Le mouton est dans un bateau
        this.level3Entering = false; // Animation d'entrée au paradis
        this.level3EnterTimer = 0;
        this.lighthouse = null; // Phare
        this.leviathan = null; // Boss du niveau 3
        this.leviathanDefeated = false;
        
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
        
        // Cacher le background moléculaire
        const molCanvas = document.getElementById('molecular-canvas');
        if (molCanvas) molCanvas.style.display = 'none';
    }
    
    start() {
        console.log('🚀 Démarrage du jeu...');
        
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
    
    gameLoop() {
        if (!this.running && !this.gameOverAnimation && !this.victoryAnimation) return;
        if (this.paused) return;
        
        // Update
        this.update();
        
        // Render
        this.renderer.render();
        
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
            if (this.level3Timer >= this.level3SpawnRate) {
                const proverb = ProverbCollectibles.getRandom();
                this.level3Proverbs.push(proverb);
                this.level3Timer = 0;
            }
            
            // Spawner des obstacles marins
            if (this.level3ObstacleTimer >= this.level3ObstacleSpawnRate && !this.leviathan) {
                const obstacle = SeaObstacles.getRandom(this.canvas.width, this.canvas.height);
                this.level3Obstacles.push(obstacle);
                this.level3ObstacleTimer = 0;
                
                // Augmenter très légèrement la difficulté
                this.level3ObstacleSpawnRate = Math.max(180, this.level3ObstacleSpawnRate - 1);
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
            
            // Limiter les mouvements du bateau
            if (this.boatMode) {
                this.player.x = Math.max(10, Math.min(this.canvas.width - 90, this.player.x));
                this.player.y = Math.max(80, Math.min(480, this.player.y));
            }
            
            // Animer les obstacles marins
            this.level3Obstacles.forEach((obstacle, index) => {
                obstacle.x -= obstacle.speed;
                
                // Comportements spécifiques
                if (obstacle.type === 'wave') {
                    obstacle.phase += 0.1;
                    obstacle.y += Math.sin(obstacle.phase) * obstacle.amplitude * 0.1;
                } else if (obstacle.type === 'jellyfish') {
                    obstacle.bobPhase += 0.05;
                    obstacle.y += Math.sin(obstacle.bobPhase) * 2;
                } else if (obstacle.type === 'whirlpool') {
                    obstacle.rotation += 0.1;
                    
                    // Force d'aspiration
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < obstacle.width) {
                        const pullX = (dx / distance) * obstacle.pullForce;
                        const pullY = (dy / distance) * obstacle.pullForce;
                        this.player.x += pullX;
                        this.player.y += pullY;
                    }
                } else if (obstacle.type === 'siren') {
                    obstacle.bobPhase = (obstacle.bobPhase || 0) + 0.05;
                    obstacle.y += Math.sin(obstacle.bobPhase) * 1.5;
                    
                    // Charme du joueur (le ralentit)
                    const dx = obstacle.x - this.player.x;
                    const dy = obstacle.y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < obstacle.charmRadius) {
                        this.player.velX *= 0.95;
                        obstacle.singing = true;
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
                
                // Vérifier collision avec le joueur
                const dx = proverb.x - this.player.x;
                const dy = proverb.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 50 && !proverb.collected) {
                    proverb.collected = true;
                    
                    if (this.audioManager && this.audioManager.initialized) {
                        this.audioManager.playPocSound();
                    }
                    
                    this.player.lives = Math.min(this.player.maxLives, this.player.lives + 1);
                    
                    this.renderer.addParticle(proverb.x, proverb.y, '💦', '#4A90A4');
                    this.renderer.addParticle(proverb.x - 10, proverb.y - 10, '💧', '#87CEEB');
                    this.renderer.addParticle(proverb.x + 10, proverb.y - 10, '💧', '#87CEEB');
                    this.renderer.addParticle(proverb.x, proverb.y + 10, '✨', '#FFD700');
                    
                    if (this.notificationSystem) {
                        this.notificationSystem.showSplash(
                            `${proverb.icon} ${proverb.text}`,
                            this.canvas.width / 2,
                            80,
                            '#4A90A4',
                            3000
                        );
                    }
                    
                    console.log(`📖 Proverbe collecté! Vies: ${this.player.lives}/${this.player.maxLives}`);
                    
                    // Si Léviathan vaincu et max vies atteint
                    if (this.player.lives >= this.player.maxLives && this.leviathanDefeated) {
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
            this.startLevel3();
        }, 3000);
    }
    
    startLevel3() {
        console.log('🚤 NIVEAU 3: Navigation et Sagesse commence!');
        this.level3Active = true;
        this.level2Active = false;
        this.level3Timer = 0;
        this.level3ObstacleTimer = 0;
        this.level3Wisdom = 0;
        this.level3Proverbs = [];
        this.level3Obstacles = [];
        this.level3Projectiles = [];
        this.boatMode = true;
        this.leviathanDefeated = false;
        
        // Créer le phare au fond à gauche
        this.lighthouse = new Lighthouse(50, 280);
        
        // Réinitialiser le joueur
        this.player.lives = 3;
        this.player.x = 100;
        this.player.y = 380; // Sur l'eau
        this.player.velX = 0;
        this.player.velY = 0;
        
        // Nettoyer les obstacles
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
        console.log('🎊 Sagesse complète ! Porte du paradis apparaît!');
        
        // Faire apparaître la porte du paradis
        if (this.heavenGate) {
            this.heavenGate.visible = true;
            this.heavenGate.x = this.canvas.width / 2 - this.heavenGate.width / 2;
            this.heavenGate.y = 100;
        }
        
        // Message
        if (this.notificationSystem) {
            this.notificationSystem.showNarrative({
                text: '🚪 La Porte du Paradis s\'ouvre ! Tu as vaincu le Léviathan et atteint la sagesse !',
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
                    <div style="color: #FFD700; font-size: 12px;">SCORE FINAL</div>
                    <div style="color: white; font-size: 24px; margin-top: 10px;">${this.score}</div>
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
            location.reload();
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
            this.startLevel2();
        }, 3000);
    }
    
    startLevel2() {
        console.log('🔥 NIVEAU 2: Les 7 Péchés Capitaux commence!');
        this.level2Active = true;
        this.level2Timer = 0;
        this.level2Survived = 0;
        
        // Nettoyer les obstacles du niveau 1
        this.obstacleManager.obstacles = [];
        this.obstacleManager.weapons = [];
        this.obstacleManager.bossLine = [];
        this.obstacleManager.projectiles = [];
        
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
            <p style="font-size: 24px; margin: 10px;">🔄 VA VIE! et renai ! RETOURNE VIVRE !</p>
            <p style="font-size: 20px; margin: 10px;">Score: ${this.score}</p>
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
            window.location.reload();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            window.location.href = 'index.html';
        });
    }
    
    showVictoryScreen() {
        // Écran de victoire
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            color: white;
            font-family: Arial, sans-serif;
            animation: fadeIn 1s;
        `;
        
        overlay.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .victory-title {
                    animation: bounce 1s infinite;
                }
            </style>
            <div class="victory-title">
                <h1 style="font-size: 72px; margin: 20px; color: #FFD700; text-shadow: 3px 3px 6px rgba(0,0,0,0.5);">
                    🎉 VICTOIRE! 🎉
                </h1>
            </div>
            <p style="font-size: 32px; margin: 10px;">✨ Tous les boss éliminés! ✨</p>
            <p style="font-size: 28px; margin: 10px;">🚪 Bienvenue au Paradis! 🚪</p>
            <p style="font-size: 24px; margin: 20px;">Score Final: ${this.score}</p>
            <p style="font-size: 20px; margin: 10px;">Obstacles évités: ${this.obstaclesCleared}</p>
            <button id="continue-btn" style="
                margin-top: 40px;
                padding: 20px 50px;
                font-size: 28px;
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: #333;
                border: none;
                border-radius: 15px;
                cursor: pointer;
                font-weight: bold;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                transition: all 0.3s;
            ">Continuer 🌟</button>
            <button id="menu-btn-victory" style="
                margin-top: 20px;
                padding: 15px 35px;
                font-size: 22px;
                background: rgba(255,255,255,0.2);
                color: white;
                border: 2px solid white;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
            ">Menu Principal</button>
        `;
        
        document.body.appendChild(overlay);
        
        document.getElementById('continue-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            window.location.reload();
        });
        
        document.getElementById('menu-btn-victory').addEventListener('click', () => {
            document.body.removeChild(overlay);
            window.location.href = 'index.html';
        });
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
