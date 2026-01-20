// EndlessMode.js - Mode infini avec scoring
import { GameConfig } from '../config/GameConfig.js';
import { VisualBoss } from '../graphics/VisualBoss.js';
import SerpentBoss from '../bosses/SerpentBoss.js';
import DragonBoss from '../bosses/DragonBoss.js';
import WhaleBoss from '../bosses/WhaleBoss.js';
import RobotBoss from '../bosses/RobotBoss.js';
import UfoBoss from '../bosses/UfoBoss.js';
import KrakenBoss from '../bosses/KrakenBoss.js';
import SharkBoss from '../bosses/SharkBoss.js';
import { getRandomComment, getOnomatopoeia } from '../narrative/BossComments.js';

export class EndlessMode {
    constructor(game) {
        this.game = game;
        this.active = true;
        this.distance = 0;
        this.previousDistance = 0; // Pour calculer les points de distance incrémentaux
        this.highScore = this.loadHighScore();
        this.multiplier = 1.0;
        this.waveLevel = 1;
        this.comboCount = 0;
        
        console.log('♾️ Mode Infini: Score par addition progressive de tous les bonus');
        
        // Rendu visuel des boss
        this.visualBoss = new VisualBoss();
        
        // Modules boss spécialisés
        this.serpentBoss = new SerpentBoss();
        this.dragonBoss = new DragonBoss();
        this.whaleBoss = new WhaleBoss();
        this.robotBoss = new RobotBoss();
        this.ufoBoss = new UfoBoss();
        this.krakenBoss = new KrakenBoss();
        this.sharkBoss = new SharkBoss();
        
        // 7 Boss avec leurs thèmes (+ 1 boss de fin de palier)
        this.bossDefinitions = [
            { 
                id: 'whale', 
                emoji: '🐋', 
                text: 'FUKUSHIMA', 
                color: '#000000', 
                size: 40,
                obstacleEmoji: '💧',
                fuelEmoji: '🐟'
            },
            { 
                id: 'pacman', 
                emoji: '👾', 
                text: 'KRAKEN', 
                color: '#9933FF', 
                size: 120,
                obstacleEmoji: '👻',
                fuelEmoji: '🍒'
            },
            { 
                id: 'dragon', 
                emoji: '🐉', 
                text: 'DRAGON DE FEU', 
                color: '#8B0000', 
                size: 45,
                obstacleEmoji: '🔥',
                fuelEmoji: '💎'
            },
            { 
                id: 'serpent', 
                emoji: '🐍', 
                text: 'SERPENT VENIMEUX', 
                color: '#1a4d1a', 
                size: 40,
                obstacleEmoji: '☠️',
                fuelEmoji: '🍃'
            },
            { 
                id: 'ufo', 
                emoji: '🛸', 
                text: 'OVNI', 
                color: '#00FF00', 
                size: 95,
                obstacleEmoji: '👽',
                fuelEmoji: '🌟'
            },
            { 
                id: 'shark', 
                emoji: '🦈', 
                text: 'REQUIN', 
                color: '#4682B4', 
                size: 85,
                obstacleEmoji: '🦑',
                fuelEmoji: '🐠'
            },
            { 
                id: 'robot', 
                emoji: '🤖', 
                text: 'ROBOT', 
                color: '#C0C0C0', 
                size: 100,
                obstacleEmoji: '⚙️',
                fuelEmoji: '🔋'
            }
        ];
        
        // Boss de fin de palier (tous les 10 boss)
        this.stageBosses = [
            {
                id: 'serpent',
                emoji: '🐍',
                text: 'SERPENT DE PALIER',
                color: '#1a4d1a',
                size: 90,
                obstacleEmoji: '☠️',
                fuelEmoji: '🍃',
                health: 200,
                maxHealth: 200
            },
            {
                id: 'dragon',
                emoji: '🐉',
                text: 'DRAGON DE PALIER',
                color: '#8B0000',
                size: 90,
                obstacleEmoji: '🔥',
                fuelEmoji: '✨',
                health: 200,
                maxHealth: 200
            }
        ];
        this.stageBossIndex = 0;  // Pour alterner
        
        this.currentBossIndex = 0;
        this.currentBoss = null;
        this.bossCount = 0;
        this.isStageBoss = false;
        this.stageBossTimer = 0;  // Timer pour explosion après 10s
        this.stageBossInitialY = 0;  // Position Y initiale pour mouvement ondulé
        this.stageBossPhase = 'arriving';  // 'arriving', 'stationed', 'uncoiling', 'charging'
        this.resetBoss();
        
        this.obstacles = []; // Obstacles générés par le boss
        this.fuels = []; // Fuel au milieu
        this.spawnTimer = 0;
        this.fuelTimer = 0;
        this.currentPattern = 'top'; // 'top' ou 'bottom'
        
        // Animation Game Over
        this.gameOverAnimation = false;
        this.rocketY = 0;
        this.explosionPhase = 0;
        
        // Commentaires de boss
        this.bossComment = null;
        this.bossCommentTimer = 0;
        this.bossCommentDuration = 180;  // 3 secondes
        this.onomatopoeia = null;
        this.onomatopoeiaTimer = 0;
    }
    
    resetBoss() {
        this.bossCount++;
        
        // Tous les 10 boss : boss de fin de palier
        if (this.bossCount % 10 === 0) {
            this.isStageBoss = true;
            this.stageBossTimer = 0;
            this.stageBossPhase = 'arriving';
            const centerY = GameConfig.CANVAS_HEIGHT / 2;
            this.stageBossInitialY = centerY;
            
            // Alterner entre serpent et dragon
            const stageBossDef = this.stageBosses[this.stageBossIndex];
            this.stageBossIndex = (this.stageBossIndex + 1) % this.stageBosses.length;
            
            this.currentBoss = {
                ...stageBossDef,
                x: GameConfig.CANVAS_WIDTH + 200,
                y: centerY,
                speed: 3,
                visible: true,
                health: 200,
                maxHealth: 200,
                shield: 100,  // Bouclier initial
                maxShield: 100,
                hasShield: true,  // Indique si le bouclier est actif
                size: 30,
                initialSize: 30,
                targetSize: 90
            };
            
            // Commentaire ironique du mouton
            const bossId = stageBossDef.id === 'serpent' ? 'stageSerpent' : 'stageDragon';
            this.showBossComment(bossId, 'appearance');
        } else {
            this.isStageBoss = false;
            const bossDef = this.bossDefinitions[this.currentBossIndex];
            const yPositions = [150, 250, 350];
            const randomY = yPositions[Math.floor(Math.random() * yPositions.length)];
            
            this.currentBoss = {
                ...bossDef,
                x: GameConfig.CANVAS_WIDTH + 100,
                y: randomY,
                speed: 0.5 + this.waveLevel * 0.05,
                visible: true,
                health: 4,
                maxHealth: 4
            };
            
            // Commentaire ironique du mouton
            this.showBossComment(this.currentBoss.id, 'appearance');
        }
    }
    
    update() {
        // Animation Game Over
        if (this.gameOverAnimation) {
            this.updateGameOverAnimation();
            return;
        }
        
        if (!this.active) return;
        
        // Mettre à jour le commentaire de boss
        if (this.bossCommentTimer > 0) {
            this.bossCommentTimer--;
            if (this.bossCommentTimer === 0) {
                this.bossComment = null;
            }
        }
        
        // Mettre à jour l'onomatopée
        if (this.onomatopoeiaTimer > 0) {
            this.onomatopoeiaTimer--;
            if (this.onomatopoeiaTimer === 0) {
                this.onomatopoeia = null;
            }
        }
        
        // Mettre à jour l'animation des boss
        this.visualBoss.update();
        
        // Mettre à jour les modules boss spécialisés
        if (this.currentBoss.id === 'dragon') {
            this.dragonBoss.update(this.game.gameTime, this.currentBoss);
        } else if (this.currentBoss.id === 'serpent') {
            this.serpentBoss.update(this.game.gameTime, this.currentBoss);
        } else if (this.currentBoss.id === 'whale') {
            this.whaleBoss.update(this.game.gameTime, this.currentBoss);
        } else if (this.currentBoss.id === 'robot') {
            this.robotBoss.update(this.game.gameTime, this.currentBoss);
        } else if (this.currentBoss.id === 'ufo') {
            this.ufoBoss.update(this.game.gameTime, this.currentBoss);
        } else if (this.currentBoss.id === 'pacman') {
            this.krakenBoss.update(this.game.gameTime, this.currentBoss);
        } else if (this.currentBoss.id === 'shark') {
            this.sharkBoss.update(this.game.gameTime, this.currentBoss);
        }
        
        // Distance augmente
        const oldDistance = this.distance;
        this.distance += this.game.gameSpeed * 0.1;
        
        // Additionner les points de distance progressivement
        const distanceTraveled = this.distance - this.previousDistance;
        if (distanceTraveled >= 1) {
            const distancePoints = Math.floor(distanceTraveled * GameConfig.ENDLESS.POINTS_PER_METER);
            this.game.score += distancePoints;
            this.previousDistance = Math.floor(this.distance);
        }
        
        // Note: Les points d'obstacles sont ajoutés directement dans les méthodes de collision
        
        // Déplacer le boss
        if (this.isStageBoss) {
            this.stageBossTimer++;
            const previousPhase = this.stageBossPhase;
            
            // Gestion des phases du boss de palier
            switch (this.stageBossPhase) {
                case 'arriving':
                    // Phase 1 : Arrive petit et rapide au bord droit
                    this.currentBoss.x -= this.currentBoss.speed;
                    if (this.currentBoss.x <= GameConfig.CANVAS_WIDTH - 150) {
                        this.currentBoss.x = GameConfig.CANVAS_WIDTH - 150;
                        this.stageBossPhase = 'coiling';
                        this.stageBossTimer = 0;
                        // Forcer réinitialisation pour changement de mode
                        this.serpentBoss.segments = [];
                    }
                    break;
                    
                case 'coiling':
                    // Phase 2 : S'enroule et grossit progressivement (3 secondes)
                    const coilingProgress = Math.min(this.stageBossTimer / 180, 1);  // 3 secondes
                    
                    // Interpolation de la taille (30px -> 90px)
                    this.currentBoss.size = this.currentBoss.initialSize + 
                        (this.currentBoss.targetSize - this.currentBoss.initialSize) * coilingProgress;
                    
                    if (this.stageBossTimer >= 180) {  // 3 secondes
                        this.currentBoss.size = this.currentBoss.targetSize;
                        this.stageBossPhase = 'advancing';
                        this.stageBossTimer = 0;
                        this.currentBoss.speed = 1;  // Mouvement lent
                        // Forcer réinitialisation pour changement de mode
                        this.serpentBoss.segments = [];
                    }
                    break;
                    
                case 'advancing':
                    // Phase 3 : Avance lentement avec mouvement serpentin
                    this.currentBoss.x -= this.currentBoss.speed;
                    
                    // Mouvement serpentin (ondulatoire vertical)
                    const serpentineAmplitude = 40;
                    const serpentineFrequency = 0.03;
                    this.currentBoss.y = this.stageBossInitialY + 
                        Math.sin(this.stageBossTimer * serpentineFrequency) * serpentineAmplitude;
                    break;
            }
        } else {
            // Boss normaux : déplacement simple
            this.currentBoss.x -= this.currentBoss.speed;
        }
        
        // Collision boss avec le joueur (distance carrée pour perf)
        const bossRadius = this.currentBoss.size / 2;
        const dx = this.currentBoss.x - (this.game.player.x + this.game.player.width / 2);
        const dy = this.currentBoss.y - (this.game.player.y + this.game.player.height / 2);
        const distSquared = dx * dx + dy * dy;
        const collisionDist = bossRadius + 20; // Rayon du boss + moitié du mouton
        
        if (distSquared < collisionDist * collisionDist) {
            // Son de collision avec boss "tang"
            if (this.game.audioManager && this.game.audioManager.initialized) {
                this.game.audioManager.playBossHitSound();
            }
            
            // Retour haptique (vibration)
            if (navigator.vibrate) {
                if (this.isStageBoss) {
                    // Boss de palier = vibration intense
                    navigator.vibrate([100, 50, 100, 50, 100]);
                } else {
                    // Boss normal = vibration courte
                    navigator.vibrate(100);
                }
            }
            
            // Collision avec le boss
            let stillAlive = true;
            if (this.isStageBoss) {
                // Boss de palier = 3 vies
                for (let i = 0; i < 3; i++) {
                    stillAlive = this.game.player.loseLife();
                    if (!stillAlive) break;
                }
            } else {
                // Boss normal = 1 vie
                stillAlive = this.game.player.loseLife();
            }
            
            // Game Over si plus de vies
            if (!stillAlive) {
                this.game.gameOver();
            }
            
            // Repousser le joueur
            this.game.player.velX = -5;
            this.game.player.velY = -3;
        }
        
        // Réinitialiser le boss quand il sort de l'écran ou meurt
        const shouldReset = this.isStageBoss 
            ? (this.currentBoss.health <= 0 || this.currentBoss.x < -this.currentBoss.size)
            : this.currentBoss.x < -this.currentBoss.size;
            
        if (shouldReset) {
            // Explosion uniquement si le boss de palier est tué
            if (this.isStageBoss && this.currentBoss.health <= 0) {
                // Son "pame" ultra grave pour boss de palier
                if (this.game.audioManager && this.game.audioManager.initialized) {
                    this.game.audioManager.playPameSound();
                }
                
                // GROS retour haptique pour dragon/serpent
                if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200, 100, 200, 100, 300]);
                }
                
                // Créer l'explosion
                for (let i = 0; i < 20; i++) {
                    const angle = (Math.PI * 2 * i) / 20;
                    this.obstacles.push({
                        x: this.currentBoss.x,
                        y: this.currentBoss.y,
                        velX: Math.cos(angle) * 5,
                        velY: Math.sin(angle) * 5,
                        emoji: this.currentBoss.obstacleEmoji
                    });
                }
            }
            
            // Passer au boss suivant (sauf pour boss de palier)
            if (!this.isStageBoss) {
                this.currentBossIndex = (this.currentBossIndex + 1) % this.bossDefinitions.length;
            }
            
            // Forcer la réinitialisation des modules
            this.dragonBoss.segments = [];
            this.serpentBoss.segments = [];
            
            this.resetBoss();
            
            // Alterner le pattern
            this.currentPattern = this.currentPattern === 'top' ? 'bottom' : 'top';
            this.waveLevel++;
            
            // Pas de notification (anti-spam)
        }
        
        // Spawn obstacles depuis le boss (avec emoji thématique) - très lent au début
        this.spawnTimer++;
        if (this.spawnTimer > 300 && this.obstacles.length < 10) { // 300 frames = 5 secondes entre chaque
            this.spawnTimer = 0;
            const obstacle = {
                x: this.currentBoss.x,
                y: this.currentPattern === 'top' ? 100 : 400,
                width: 60,
                height: 80,
                speed: 0.5, // 3x plus lent (0.5 au lieu de 1.5)
                emoji: this.currentBoss.obstacleEmoji,
                pattern: this.currentPattern
            };
            this.obstacles.push(obstacle);
        }
        
        // Spawn fuel au milieu (avec emoji thématique) - moins fréquent
        this.fuelTimer++;
        if (this.fuelTimer > 360 && this.fuels.length < 3) { // 360 frames = 6 secondes
            this.fuelTimer = 0;
            const fuel = {
                x: GameConfig.CANVAS_WIDTH + 50,
                y: 250, // Milieu de l'écran
                size: 40,
                speed: 0.8, // Plus lent (0.8 au lieu de 2)
                emoji: this.currentBoss.fuelEmoji
            };
            this.fuels.push(fuel);
        }
        
        // Mettre à jour les obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= obs.speed;
            
            // Collision avec le joueur (distance carrée pour perf)
            const dx = obs.x - this.game.player.x;
            const dy = obs.y - this.game.player.y;
            const distSquared = dx * dx + dy * dy;
            
            if (distSquared < 1600) { // 40^2 = 1600
                const stillAlive = this.game.player.loseLife();
                this.obstacles.splice(i, 1);
                
                // Game Over si plus de vies
                if (!stillAlive) {
                    this.game.gameOver();
                }
            } else if (obs.x < -obs.width) {
                // Obstacle évité - ajouter les points
                this.obstacles.splice(i, 1);
                this.game.obstaclesCleared++;
                
                // Ajouter les points avec multiplicateur
                const points = Math.floor(GameConfig.ENDLESS.POINTS_PER_OBSTACLE * this.multiplier);
                this.game.score += points;
            }
        }
        
        // Mettre à jour le fuel
        for (let i = this.fuels.length - 1; i >= 0; i--) {
            const fuel = this.fuels[i];
            fuel.x -= fuel.speed;
            
            // Collision avec le joueur (distance carrée pour perf)
            const dx = fuel.x - this.game.player.x;
            const dy = fuel.y - this.game.player.y;
            const distSquared = dx * dx + dy * dy;
            
            if (distSquared < 1600) { // 40^2 = 1600
                // Son de réservoir "ping"
                if (this.game.audioManager && this.game.audioManager.initialized) {
                    this.game.audioManager.playPingSound();
                    console.log('🔊 Son ping joué !');
                } else {
                    console.log('❌ AudioManager non disponible:', this.game.audioManager ? 'non initialisé' : 'absent');
                }
                
                this.game.player.fuel = Math.min(this.game.player.maxFuel, this.game.player.fuel + 30);
                
                // Changer d'arme en fonction du fuel attrapé
                const weaponMap = {
                    '🐟': 0, // Poisson -> Laser
                    '🍒': 1, // Cerise -> Triple
                    '💎': 2, // Diamant -> Mega (puissant!)
                    '🌟': 3, // Étoile -> Bombe (puissant!)
                    '🐠': 4, // Poisson tropical -> Multiple
                    '🔋': 5  // Batterie -> Wave
                };
                
                const weaponIndex = weaponMap[fuel.emoji];
                if (weaponIndex !== undefined && this.game.laserSystem) {
                    this.game.laserSystem.currentWeaponIndex = weaponIndex;
                    const weaponName = this.game.laserSystem.getCurrentWeapon().name;
                    
                    // Afficher l'arme obtenue
                    this.game.renderer.addParticle(
                        GameConfig.CANVAS_WIDTH / 2,
                        100,
                        `⚔️ ${weaponName} ⚔️`,
                        '#FFD700'
                    );
                    
                    console.log(`⚔️ Arme changée: ${weaponName} (${fuel.emoji})`);
                }
                
                // Bonus pour collecte de fuel
                const fuelBonus = 50;
                this.game.score += fuelBonus;
                
                this.fuels.splice(i, 1);
                // Pas de particule (anti-spam)
            } else if (fuel.x < -fuel.size) {
                this.fuels.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        // Animation de fusée Game Over
        if (this.gameOverAnimation && this.explosionPhase === 0) {
            ctx.save();
            
            // Dessiner la MEGA FUSÉE
            ctx.font = '120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Flammes sous la fusée
            ctx.shadowColor = '#FF6600';
            ctx.shadowBlur = 40;
            ctx.fillText('🔥', GameConfig.CANVAS_WIDTH / 2, this.rocketY + 60);
            
            // La fusée
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 50;
            ctx.fillText('🚀', GameConfig.CANVAS_WIDTH / 2, this.rocketY);
            
            ctx.restore();
            return;
        }
        
        // Phase explosion - écran blanc qui pulse
        if (this.gameOverAnimation && this.explosionPhase === 1) {
            const alpha = Math.max(0, 1 - this.explosionTimer / 80);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
            return;
        }
        // Dessiner le boss avec sa couleur thématique
        ctx.save();
        
        // Barre de vie du boss au-dessus
        if (this.currentBoss.health > 0) {
            // Obtenir la position réelle de la tête pour les dragons/serpents
            let bossX = this.currentBoss.x;
            let bossY = this.currentBoss.y;
            
            if (this.currentBoss.id === 'dragon') {
                const headPos = this.dragonBoss.getHeadPosition();
                if (headPos) {
                    bossX = headPos.x;
                    bossY = headPos.y;
                }
            } else if (this.currentBoss.id === 'serpent') {
                const headPos = this.serpentBoss.getHeadPosition();
                if (headPos) {
                    bossX = headPos.x;
                    bossY = headPos.y;
                }
            }
            
            const barWidth = 80;
            const barHeight = 10;
            const barX = bossX - barWidth / 2;
            const barY = bossY - this.currentBoss.size / 2 - 20;
            
            // Fond de la barre (rouge)
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Vie restante (vert)
            const healthPercent = this.currentBoss.health / this.currentBoss.maxHealth;
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            // Contour
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Texte HP
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.currentBoss.health}/${this.currentBoss.maxHealth}`, bossX, barY + barHeight / 2);
        }
        
        // Dessiner le boss avec géométrie animée
        if (this.currentBoss.id === 'dragon') {
            // Dragon de feu rouge avec ailes et flammes
            // Mode 'boss' (enroulé) pendant la phase coiling si c'est un stage boss
            let mode = 'traverse';
            if (this.isStageBoss && this.stageBossPhase === 'coiling') {
                mode = 'boss';
            }
            this.dragonBoss.render(ctx, this.currentBoss, mode);
        } else if (this.currentBoss.id === 'serpent') {
            // Serpent venimeux avec écailles
            // Mode 'boss' (enroulé) pendant la phase coiling, 'traverse' pendant arriving et advancing
            let mode = 'traverse';
            if (this.isStageBoss && this.stageBossPhase === 'coiling') {
                mode = 'boss';
            }
            this.serpentBoss.render(ctx, this.currentBoss, mode);
        } else if (this.currentBoss.id === 'whale') {
            // Baleine radioactive Fukushima (WhaleBoss)
            this.whaleBoss.render(ctx, this.currentBoss);
        } else if (this.currentBoss.id === 'robot') {
            // Robot électrique bipède (RobotBoss)
            this.robotBoss.render(ctx, this.currentBoss);
        } else if (this.currentBoss.id === 'ufo') {
            // OVNI avec lasers (UfoBoss)
            this.ufoBoss.render(ctx, this.currentBoss);
        } else if (this.currentBoss.id === 'pacman') {
            // Kraken avec fusée (KrakenBoss)
            this.krakenBoss.render(ctx, this.currentBoss);
        } else if (this.currentBoss.id === 'shark') {
            // Requin cybernétique (SharkBoss)
            this.sharkBoss.render(ctx, this.currentBoss);
        } else {
            // Utiliser VisualBoss pour les autres boss
            this.visualBoss.render(ctx, this.currentBoss);
        }
        
        // Nom du boss en dessous
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.currentBoss.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentBoss.text, this.currentBoss.x, this.currentBoss.y + this.currentBoss.size / 2 + 15);
        
        // Afficher le bouclier pour les boss de palier
        if (this.isStageBoss && this.currentBoss.hasShield && this.currentBoss.shield > 0) {
            const shieldRadius = this.currentBoss.size / 2 + 15;
            const shieldOpacity = 0.3 + (this.currentBoss.shield / this.currentBoss.maxShield) * 0.4;
            const pulseEffect = Math.sin(Date.now() / 200) * 5;
            
            // Cercle de bouclier bleu brillant
            ctx.save();
            ctx.globalAlpha = shieldOpacity;
            
            // Gradient radial pour le bouclier
            const gradient = ctx.createRadialGradient(
                this.currentBoss.x, this.currentBoss.y, shieldRadius - 10,
                this.currentBoss.x, this.currentBoss.y, shieldRadius + pulseEffect
            );
            gradient.addColorStop(0, 'rgba(0, 191, 255, 0)');
            gradient.addColorStop(0.7, 'rgba(0, 191, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(135, 206, 250, 0.9)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.currentBoss.x, this.currentBoss.y, shieldRadius + pulseEffect, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordure du bouclier
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00BFFF';
            ctx.shadowBlur = 15;
            ctx.stroke();
            
            // Hexagones énergétiques autour du bouclier
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + Date.now() / 1000;
                const hexX = this.currentBoss.x + Math.cos(angle) * shieldRadius;
                const hexY = this.currentBoss.y + Math.sin(angle) * shieldRadius;
                
                ctx.fillStyle = 'rgba(0, 191, 255, 0.8)';
                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                    const hexAngle = (Math.PI * 2 / 6) * j;
                    const hx = hexX + Math.cos(hexAngle) * 8;
                    const hy = hexY + Math.sin(hexAngle) * 8;
                    if (j === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
            
            // Barre de bouclier au-dessus du boss
            const barWidth = 80;
            const barHeight = 8;
            const barX = this.currentBoss.x - barWidth / 2;
            const barY = this.currentBoss.y - this.currentBoss.size / 2 - 30;
            const shieldPercent = this.currentBoss.shield / this.currentBoss.maxShield;
            
            // Fond de la barre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Barre de bouclier bleue
            ctx.fillStyle = '#00BFFF';
            ctx.fillRect(barX, barY, barWidth * shieldPercent, barHeight);
            
            // Bordure
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
            
            // Icône bouclier
            ctx.font = '16px Arial';
            ctx.fillText('🛡️', barX - 15, barY + 4);
        }
        
        ctx.restore();
        
        // Dessiner les obstacles thématiques
        for (const obs of this.obstacles) {
            ctx.save();
            ctx.font = '60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Effet glow avec la couleur du boss
            ctx.shadowColor = this.currentBoss.color;
            ctx.shadowBlur = 15;
            
            ctx.fillText(obs.emoji, obs.x, obs.y);
            ctx.restore();
        }
        
        // Dessiner le fuel thématique
        for (const fuel of this.fuels) {
            ctx.save();
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Effet brillant
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 20;
            
            ctx.fillText(fuel.emoji, fuel.x, fuel.y);
            ctx.restore();
        }
    }
    
    showGameOver() {
        // Sauvegarder le record
        const isNewRecord = this.game.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.game.score;
            this.saveHighScore(this.game.score);
            console.log('💾 Nouveau record Infini sauvegardé:', this.game.score);
        } else {
            console.log('📊 Score Infini:', this.game.score, '| Record:', this.highScore);
        }
        
        // Activer l'animation de fusée
        this.gameOverAnimation = true;
        this.rocketY = GameConfig.CANVAS_HEIGHT;
        this.explosionPhase = 0;
        
        // Arrêter le jeu
        this.active = false;
    }
    
    updateGameOverAnimation() {
        if (!this.gameOverAnimation) return false;
        
        // Phase 1: Fusée monte
        if (this.explosionPhase === 0) {
            this.rocketY -= 15; // Monte vite
            
            // Particules de fumée
            if (Math.random() > 0.5) {
                this.game.renderer.addParticle(
                    GameConfig.CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 30,
                    this.rocketY + 40,
                    '💨',
                    '#AAAAAA'
                );
            }
            
            // Quand la fusée atteint le haut
            if (this.rocketY < -50) {
                this.explosionPhase = 1;
                this.explosionTimer = 0;
            }
        }
        
        // Phase 2: Mega explosion
        else if (this.explosionPhase === 1) {
            this.explosionTimer++;
            
            // Créer des explosions partout
            if (this.explosionTimer < 60) {
                for (let i = 0; i < 3; i++) {
                    this.game.renderer.addParticle(
                        Math.random() * GameConfig.CANVAS_WIDTH,
                        Math.random() * GameConfig.CANVAS_HEIGHT,
                        ['💥', '🔥', '💣', '⚡'][Math.floor(Math.random() * 4)],
                        ['#FF0000', '#FF6600', '#FFAA00', '#FF00FF'][Math.floor(Math.random() * 4)]
                    );
                }
            }
            
            // Passer à la phase finale
            if (this.explosionTimer > 80) {
                this.explosionPhase = 2;
                this.showSimpleGameOver();
            }
        }
        
        return true;
    }
    
    showSimpleGameOver() {
        const isNewRecord = this.game.score > this.highScore;
        
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position:fixed;top:0;left:0;width:100%;height:100%;
                        background:rgba(0,0,0,0.95);display:flex;align-items:center;
                        justify-content:center;z-index:9999">
                <div style="text-align:center">
                    <h1 style="color:#FF0000;font-size:80px;margin:0;
                               text-shadow:0 0 30px #FF0000, 0 0 60px #FF0000;
                               animation:pulse 2s ease-in-out infinite">
                        GAME OVER
                    </h1>
                    <div style="font-size:50px;margin:25px 0">💀</div>
                    <p style="color:#FFD700;font-size:32px;margin:15px 0">
                        SCORE: ${this.game.score.toLocaleString()}
                    </p>
                    ${isNewRecord ? 
                        '<p style="color:#FFD700;font-size:26px;margin:10px 0">🏆 NOUVEAU RECORD ! 🏆</p>' :
                        `<p style="color:#999;font-size:22px;margin:10px 0">Record: ${this.highScore.toLocaleString()}</p>`
                    }
                    <br>
                    <button onclick="location.reload()" 
                            style="background:#FF0000;color:white;border:none;
                                   padding:15px 40px;border-radius:10px;font-size:20px;
                                   font-weight:bold;cursor:pointer;
                                   box-shadow:0 5px 20px rgba(255,0,0,0.5);
                                   transition:transform 0.2s"
                            onmouseover="this.style.transform='scale(1.1)'"
                            onmouseout="this.style.transform='scale(1)'">
                        🔄 REJOUER
                    </button>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            </style>
        `;
        document.body.appendChild(modal);
    }
    
    loadHighScore() {
        const saved = localStorage.getItem('xsheep_maxScore');
        return saved ? parseInt(saved) : 0;
    }
    
    saveHighScore(score) {
        localStorage.setItem('xsheep_maxScore', score.toString());
    }
    
    // Afficher un commentaire ironique du mouton
    showBossComment(bossId, type = 'appearance') {
        this.bossComment = getRandomComment(bossId, type);
        this.bossCommentTimer = this.bossCommentDuration;
        
        // Ajouter une onomatopée parfois
        if (type === 'appearance' && Math.random() > 0.5) {
            this.onomatopoeia = getOnomatopoeia(bossId);
            this.onomatopoeiaTimer = 60;  // 1 seconde
        }
    }
    
    // Dessiner le commentaire du mouton
    renderBossComment(ctx) {
        if (!this.bossComment) return;
        
        const sheepX = this.game.player.x;
        const sheepY = this.game.player.y;
        
        // Bulle de dialogue
        const padding = 15;
        ctx.font = 'bold 18px Arial';
        const metrics = ctx.measureText(this.bossComment);
        const width = metrics.width + padding * 2;
        const height = 30 + padding;
        
        const bubbleX = sheepX - width / 2;
        const bubbleY = sheepY - 80;
        
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(bubbleX + 3, bubbleY + 3, width, height, 10);
        ctx.fill();
        
        // Bulle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, width, height, 10);
        ctx.fill();
        ctx.stroke();
        
        // Pointe de la bulle
        ctx.beginPath();
        ctx.moveTo(sheepX - 10, sheepY - 80 + height);
        ctx.lineTo(sheepX + 10, sheepY - 80 + height);
        ctx.lineTo(sheepX, sheepY - 60 + height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Texte
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.bossComment, sheepX, bubbleY + height / 2);
    }
    
    // Dessiner l'onomatopée
    renderOnomatopoeia(ctx) {
        if (!this.onomatopoeia) return;
        
        const progress = 1 - (this.onomatopoeiaTimer / 60);
        const alpha = 1 - progress;
        const scale = 1 + progress * 2;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${40 * scale}px Arial`;
        ctx.fillStyle = '#ff4400';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = this.game.canvas.width / 2;
        const y = 100 + progress * 50;
        
        ctx.strokeText(this.onomatopoeia, x, y);
        ctx.fillText(this.onomatopoeia, x, y);
        
        ctx.restore();
    }
}
