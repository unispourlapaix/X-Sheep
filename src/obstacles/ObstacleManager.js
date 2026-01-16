// ObstacleManager.js - Gestion de tous les obstacles
import { GameConfig } from '../config/GameConfig.js';
import { Physics } from '../core/Physics.js';
import { GroundObstacles } from './GroundObstacles.js';
import { SkyObstacles } from './SkyObstacles.js';
import { MiddleObstacles } from './MiddleObstacles.js';
import { RichnessObstacles } from './RichnessObstacles.js';
import { FunObstacles } from './FunObstacles.js';
import { WeaponObstacles } from './WeaponObstacles.js';

export class ObstacleManager {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.weapons = []; // Armes anti-boss séparées
        this.fallingObjects = [];
        this.explosions = [];
        this.bossLine = []; // Boss alignés en haut (max 6)
        this.projectiles = []; // Projectiles tirés par les boss
        this.nextShooterIndex = 0; // Prochain boss qui va tirer
        this.bossSpawnCount = {}; // Combien de fois chaque boss a été spawné
        this.maxSpawnsPerBoss = 2; // Chaque boss peut apparaître 2 fois
        this.bossesKilled = {}; // Combien de fois chaque boss a été tué
        this.narrativeBubblesPopped = 0; // Compteur pour spawn d'armes (tous les 7)
        this.totalXP = 0; // XP total pour affichage LED
        this.messagesPopped = 0; // DEPRECATED - garder pour compatibilité
        this.timer = 0;
        this.dropTimer = 0;
        this.funTimer = 0; // Timer pour obstacles fun
        this.weaponTimer = 0; // Timer pour armes
        this.bossTimer = 0; // Timer pour spawn de boss
        this.bossFireTimer = 0; // Timer pour tir des boss
        this.bigBoss = null; // Le BIG BOSS unique
        this.bigBossTimer = 0; // Timer pour spawn du BIG BOSS
        this.bigBossShootCount = 0; // Nombre de tirs du BIG BOSS
        this.bigBossShootTimer = 0; // Timer entre les tirs du BIG BOSS
        this.bigBossSpawned = false; // Le BIG BOSS a déjà spawné
        this.spawnRate = GameConfig.OBSTACLE_SPAWN_RATE;
        this.dropInterval = 60 * 60; // 60 secondes * 60 fps = 1 minute
        this.funInterval = 120 * 60; // 2 minutes
        this.weaponInterval = 45 * 60; // 45 secondes
        this.bossInterval = 120; // 2 secondes entre chaque boss - PLUS RAPIDE!
        this.bossFireInterval = 120 * 60; // 2 minutes entre chaque tir de boss
    }
    
    update() {
        // Ne pas gérer les obstacles en mode infini (géré par EndlessMode)
        if (this.game.mode === 'endless') {
            return;
        }
        
        this.timer++;
        this.dropTimer++;
        this.funTimer++;
        this.weaponTimer++;
        this.bossTimer++;
        this.bossFireTimer++;
        this.bigBossTimer++;
        
        if (this.bigBoss) {
            this.bigBossShootTimer++;
        }
        
        // Lâcher des objets toutes les 1 minute
        if (this.dropTimer >= this.dropInterval) {
            this.dropRandomObjects();
            this.dropTimer = 0;
        }
        
        // Obstacles FUN toutes les 2 minutes!
        if (this.funTimer >= this.funInterval) {
            this.spawnFunObstacle();
            this.funTimer = 0;
        }
        
        // Boss alignés en haut - 6 boss différents, chacun peut spawner 2 fois
        if (this.bossTimer >= this.bossInterval && this.bossLine.length < 6) {
            // Vérifier s'il reste des boss à spawner
            if (this.canSpawnMoreBosses()) {
                this.spawnBossInLine();
                this.bossTimer = 0;
            }
        }
        
        // Boss tirent toutes les 2 minutes
        if (this.bossFireTimer >= this.bossFireInterval && this.bossLine.length > 0) {
            // Tous les boss tirent en même temps!
            for (let i = 0; i < this.bossLine.length; i++) {
                this.bossFire(i);
            }
            this.bossFireTimer = 0;
        }
        
        // BIG BOSS spawn une seule fois après 3 minutes
        if (!this.bigBossSpawned && this.bigBossTimer >= 180 * 60) {
            this.spawnBigBoss();
            this.bigBossSpawned = true;
        }
        
        // BIG BOSS tire 3 fois toutes les 2 secondes
        if (this.bigBoss && this.bigBossShootCount < 3 && this.bigBossShootTimer >= 120) {
            this.bigBossFire();
            this.bigBossShootCount++;
            this.bigBossShootTimer = 0;
            
            // Après 3 tirs, le BIG BOSS disparaît
            if (this.bigBossShootCount >= 3) {
                setTimeout(() => {
                    if (this.bigBoss) {
                        const index = this.obstacles.indexOf(this.bigBoss);
                        if (index > -1) this.obstacles.splice(index, 1);
                        this.bigBoss = null;
                        console.log('💀 BIG BOSS disparaît après 3 tirs!');
                    }
                }, 2000);
            }
        }
        
        // Mettre à jour les objets qui tombent
        this.updateFallingObjects();
        
        // Mettre à jour les explosions
        this.updateExplosions();
        
        // Mettre à jour les boss en ligne
        this.updateBossLine();
        
        // Mettre à jour les projectiles
        this.updateProjectiles();
        
        // Mettre à jour les armes (séparées des obstacles)
        this.updateWeapons();
        
        // Spawner des obstacles - augmenté à 8 maximum pour plus de danger!
        const maxObstacles = 8;
        if (this.timer > this.spawnRate / this.game.gameSpeed && this.obstacles.length < maxObstacles) {
            this.spawnObstacle();
            this.timer = 0;
        }
        
        // Mettre à jour et vérifier collisions
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            
            // Mouvement selon type
            this.moveObstacle(obs);
            
            // Collision avec joueur
            if (this.checkCollision(obs)) {
                // Obstacles fun ont un comportement spécial!
                if (obs.type === 'fun') {
                    this.handleFunCollision(obs);
                    this.obstacles.splice(i, 1);
                    this.game.score += 100;
                    continue;
                }
                
                // Phantom glace le mouton!
                if (obs.id === 'phantom' && obs.effect === 'freeze') {
                    // Si le mouton a un filet, capturer le Phantom!
                    if (this.game.player.canKill('phantom')) {
                        console.log('🥅 Phantom capturé!');
                        this.game.score += 500;
                        this.obstacles.splice(i, 1);
                        continue;
                    }
                    
                    this.game.player.freeze();
                    this.createIceBreakEffect(this.game.player.x, this.game.player.y);
                    
                    // Perte de 2 vies
                    this.game.player.loseLife();
                    const stillAlive = this.game.player.loseLife();
                    
                    // Game Over si plus de vies
                    if (!stillAlive) {
                        this.game.gameOver();
                    }
                    
                    this.obstacles.splice(i, 1);
                    continue;
                }
                
                // Obstacles dangereux (retirent plusieurs vies)
                if (obs.dangerous && obs.damage) {
                    // Les boss sont indestructibles sans la bonne arme!
                    if (obs.type === 'boss') {
                        // Vérifier si le joueur a l'arme pour ce boss
                        if (this.game.player.canKill(obs.id)) {
                        // Son "pouf" grave pour destruction du boss
                        if (this.game.audioManager && this.game.audioManager.initialized) {
                            this.game.audioManager.playPoufSound();
                        }
                        
                            this.createExplosion(obs.x + obs.width/2, obs.y + obs.height/2);
                            this.obstacles.splice(i, 1);
                            
                            // Rendre le joueur invulnérable pendant 1 seconde
                            this.game.player.invincible = true;
                            this.game.player.invincibleTimer = 60; // 1 seconde
                            console.log('🛡️ Invulnérabilité de 1 seconde après avoir tué le boss!');
                            
                            // Retirer de la ligne de boss
                            const bossIndex = this.bossLine.indexOf(obs);
                            if (bossIndex > -1) {
                                this.bossLine.splice(bossIndex, 1);
                                // Réajuster nextShooterIndex si nécessaire
                                if (this.nextShooterIndex >= this.bossLine.length && this.bossLine.length > 0) {
                                    this.nextShooterIndex = 0;
                                }
                            }
                            
                            // Compter le boss tué
                            this.bossesKilled[obs.id] = (this.bossesKilled[obs.id] || 0) + 1;
                            console.log(`💀 ${obs.text} tué ${this.bossesKilled[obs.id]}/2`);
                            
                            // Donner 10000 XP pour le boss
                            this.addXP(10000);
                            
                            // VÉRIFIER LA VICTOIRE!
                            if (this.checkVictoryCondition()) {
                                console.log('✨✨✨ TOUS LES BOSS ÉLIMINÉS! VICTOIRE! ✨✨✨');
                                this.game.victory();
                            }
                            
                            continue;
                        } else {
                            // Boss indestructible - cause des dégâts mais reste en place
                            // Vérifier si le joueur est invincible OU si le boss a une protection au spawn
                            if (!this.game.player.invincible && (!obs.spawnProtection || obs.spawnProtection <= 0)) {
                                console.log(`🛡️ ${obs.text} est indestructible! -${obs.damage} vies! Besoin de l'arme appropriée!`);
                                
                                // Retirer le nombre de vies indiqué
                                let stillAlive = true;
                                for (let j = 0; j < obs.damage; j++) {
                                    stillAlive = this.game.player.loseLife();
                                    if (!stillAlive) break;
                                }
                                
                                // Perte de carburant
                                this.game.player.fuel = Math.max(0, this.game.player.fuel - 30);
                                
                                // Game Over si plus de vies
                                if (!stillAlive) {
                                    this.game.gameOver();
                                }
                            }
                            
                            // Repousser le mouton vers le bas
                            this.game.player.velY = 10; // Vers le bas
                            this.game.player.velX = -5; // Vers la gauche
                            
                            // Boss ne disparaît pas
                            continue;
                        }
                    }
                    
                    // Autres obstacles dangereux (non-boss)
                    // Le mouton peut-il tuer cet obstacle avec son arme?
                    if (this.game.player.canKill(obs.id)) {
                        console.log(`⚔️ ${obs.text} éliminé avec ${this.game.player.equippedWeapon.icon}!`);
                        this.game.score += 1000;
                        this.createExplosion(obs.x + obs.width/2, obs.y + obs.height/2);
                        this.obstacles.splice(i, 1);
                        continue;
                    }
                    
                    console.log(`💥 ${obs.text} ! -${obs.damage} vies!`);
                    
                    // Retirer le nombre de vies indiqué
                    let stillAlive = true;
                    for (let j = 0; j < obs.damage; j++) {
                        stillAlive = this.game.player.loseLife();
                        if (!stillAlive) break;
                    }
                    
                    // Perte de carburant
                    this.game.player.fuel = Math.max(0, this.game.player.fuel - 30);
                    
                    // Game Over si plus de vies
                    if (!stillAlive) {
                        this.game.gameOver();
                    }
                    
                    this.obstacles.splice(i, 1);
                    this.game.onObstacleCleared(obs);
                    continue;
                }
                
                // Protection par power-up ?
                if (this.game.powerUpManager?.hasPower('resilience')) {
                    this.game.powerUpManager.usePower('resilience', 50);
                    this.obstacles.splice(i, 1);
                    this.game.score += 150;
                    continue;
                }
                
                // Perte de carburant à chaque collision
                if (this.game.player.fuel > 0) {
                    this.game.player.fuel = Math.max(0, this.game.player.fuel - 20);
                    console.log(`💥 Collision ! Carburant: ${Math.round(this.game.player.fuel)}/${this.game.player.maxFuel}`);
                }
                
                // Appliquer effets spéciaux selon l'obstacle
                if (obs.id === 'wheelchair') {
                    // Handicap : rouler pendant 3 secondes (180 frames)
                    this.game.player.applySpecialEffect('rolling', 180);
                } else if (obs.type === 'richness') {
                    // Richesse : grosse mèche de cheveux pendant 3 secondes
                    this.game.player.applySpecialEffect('hair', 180);
                }
                
                // Perte de vie
                const stillAlive = this.game.player.loseLife();
                
                // Game Over seulement si plus de vies
                if (!stillAlive) {
                    this.game.gameOver();
                }
                
                // Obstacle surmonté !
                this.obstacles.splice(i, 1);
                this.game.onObstacleCleared(obs);
                continue;
            }
            
            // Supprimer si hors écran
            if (this.isOffScreen(obs)) {
                this.obstacles.splice(i, 1);
                this.game.score += 50;
                // Obstacle surmonté = déclencher bulle narrative (sauf armes/boss/fun)
                if (!obs.isWeapon && obs.type !== 'boss' && obs.type !== 'fun') {
                    this.game.onObstacleCleared(obs);
                }
            }
        }
    }
    
    spawnObstacle() {
        const rand = Math.random();
        let obstacle;
        
        // Moins d'obstacles au sol (20% au lieu de 40%)
        if (rand < 0.2) {
            obstacle = GroundObstacles.getRandom();
        } else if (rand < 0.45) {
            obstacle = SkyObstacles.getRandom();
        } else if (rand < 0.7) {
            obstacle = MiddleObstacles.getRandom();
        } else {
            obstacle = RichnessObstacles.getRandom();
        }
        
        this.obstacles.push(obstacle);
    }
    
    moveObstacle(obs) {
        // Les boss restent fixes - ne pas les déplacer
        if (obs.type === 'boss' && obs.isFixed) {
            return;
        }
        
        switch(obs.type) {
            case 'sky':
                if (!obs.fixed) {
                    obs.x -= this.game.gameSpeed * 0.5;
                    obs.y += obs.fallSpeed || 2;
                }
                break;
                
            case 'middle':
                obs.x -= this.game.gameSpeed;
                obs.y += Math.sin(Date.now() * 0.005 + obs.x * 0.01) * (obs.floatSpeed || 1);
                break;
                
            default:
                obs.x -= this.game.gameSpeed;
        }
    }
    
    checkCollision(obs) {
        const playerHitbox = this.game.player.getHitbox();
        return Physics.checkCollision(playerHitbox, {
            x: obs.x,
            y: obs.y,
            width: obs.width,
            height: obs.height
        });
    }
    
    isOffScreen(obs) {
        if (obs.type === 'sky' && obs.fixed) return false;
        
        return obs.x + obs.width < 0 || 
               obs.y > this.game.canvas.height;
    }
    
    updateWeapons() {
        // Mettre à jour et vérifier collisions des armes (séparées des obstacles)
        for (let i = this.weapons.length - 1; i >= 0; i--) {
            const weapon = this.weapons[i];
            
            // Mouvement de droite à gauche
            weapon.x -= this.game.gameSpeed * 2;
            
            // Collision avec joueur
            if (this.checkCollision(weapon)) {
                this.game.player.equipWeapon(weapon);
                this.weapons.splice(i, 1);
                this.game.score += 50;
                
                // Effet visuel
                this.game.renderer.addParticle(
                    this.game.player.x,
                    this.game.player.y,
                    weapon.icon + '✨',
                    weapon.color
                );
                continue;
            }
            
            // Supprimer si hors écran
            if (weapon.x + weapon.width < 0) {
                this.weapons.splice(i, 1);
            }
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 40,
            opacity: 1,
            particles: Array(15).fill(0).map(() => ({
                angle: Math.random() * Math.PI * 2,
                speed: 2 + Math.random() * 3,
                distance: 0,
                size: 2 + Math.random() * 3
            }))
        });
    }
    
    dropRandomObjects() {
        // Lâcher des objets aléatoirement au milieu de l'écran (pas au bord)
        const dropCount = 6;
        const centerZoneStart = this.game.canvas.width * 0.25; // 25% du bord gauche
        const centerZoneEnd = this.game.canvas.width * 0.75;   // 75% du bord gauche
        
        // Liste d'icônes variées pour les objets qui tombent
        const icons = ['💀', '🎗️', '☢️', '☄️', '⏰', '😡', '🌀', '💎', '⭐', '✨'];
        
        for (let i = 0; i < dropCount; i++) {
            this.fallingObjects.push({
                x: centerZoneStart + Math.random() * (centerZoneEnd - centerZoneStart),
                y: 50, // Tombent depuis le haut
                width: 20,
                height: 20,
                icon: icons[Math.floor(Math.random() * icons.length)],
                isDangerous: Math.random() > 0.5, // 50% dangereux
                velocityY: 0.5,
                oscillation: Math.random() * Math.PI * 2,
                oscillationSpeed: 0.03 + Math.random() * 0.03
            });
        }
    }
    
    updateFallingObjects() {
        for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
            const obj = this.fallingObjects[i];
            
            // Mouvement vertical (lent)
            obj.y += obj.velocityY;
            obj.velocityY += 0.05; // Gravité réduite
            
            // Oscillation horizontale (sans cumul - oscillation pure)
            obj.oscillation += obj.oscillationSpeed;
            const baseX = obj.baseX || obj.x; // Sauvegarder la position de base
            if (!obj.baseX) obj.baseX = obj.x;
            obj.x = baseX + Math.sin(obj.oscillation) * 30; // ±30px d'oscillation
            
            // Garder dans le canvas
            obj.x = Math.max(20, Math.min(this.game.canvas.width - 20, obj.x));
            
            // Collision avec joueur
            if (this.checkCollision(obj)) {
                if (obj.isDangerous) {
                    const stillAlive = this.game.player.loseLife();
                    if (!stillAlive) {
                        this.game.gameOver();
                    }
                }
                this.fallingObjects.splice(i, 1);
                continue;
            }
            
            // Supprimer si touche le sol
            if (obj.y > this.game.canvas.height - 50) {
                this.fallingObjects.splice(i, 1);
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            
            // Expansion
            exp.radius += 2;
            exp.opacity -= 0.02;
            
            // Mettre à jour les particules
            exp.particles.forEach(p => {
                p.distance += p.speed;
            });
            
            // Supprimer si terminée
            if (exp.opacity <= 0 || exp.radius >= exp.maxRadius) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    spawnFunObstacle() {
        const funObs = FunObstacles.getRandom();
        this.obstacles.push(funObs);
        
        // Message rigolo!
        console.log(`🎉 ${funObs.message}`);
        
        // Effet visuel
        this.game.renderer.addParticle(
            funObs.x,
            funObs.y,
            funObs.icon + funObs.icon + funObs.icon,
            funObs.color
        );
    }
    
    handleFunCollision(obs) {
        const player = this.game.player;
        
        // Gérer les vies selon l'obstacle FUN
        if (obs.lifeBonus !== undefined) {
            if (obs.lifeBonus > 0) {
                // Donner des vies (max 25)
                const oldLives = player.lives;
                player.lives = Math.min(player.maxLives, player.lives + obs.lifeBonus);
                const gained = player.lives - oldLives;
                if (gained > 0) {
                    console.log(`❤️ ${obs.text}: +${gained} vies! (${player.lives}/${player.maxLives})`);
                }
            } else if (obs.lifeBonus < 0) {
                // Retirer des vies
                const livesToLose = Math.abs(obs.lifeBonus);
                let stillAlive = true;
                for (let i = 0; i < livesToLose; i++) {
                    stillAlive = player.loseLife();
                    if (!stillAlive) break;
                }
                console.log(`💔 ${obs.text}: ${livesToLose} vies perdues! (${player.lives}/${player.maxLives})`);
                
                if (!stillAlive) {
                    this.game.gameOver();
                }
            }
        }
        
        switch(obs.effect) {
            case 'bounce':
                player.velY = -8;
                player.velX = Math.random() * 4 - 2;
                break;
                
            case 'slow':
                player.velX *= 0.3;
                player.velY *= 0.3;
                break;
                
            case 'super_bounce':
                player.velY = -15;
                break;
                
            case 'slide':
                player.velX = 10;
                player.velY = 0;
                break;
                
            case 'attract':
                const dx = obs.x - player.x;
                const dy = obs.y - player.y;
                player.velX += dx * 0.05;
                player.velY += dy * 0.05;
                break;
                
            case 'float':
                player.velY = -0.5;
                break;
                
            case 'spin':
                player.velX = Math.cos(Date.now() * 0.01) * 5;
                player.velY = Math.sin(Date.now() * 0.01) * 5;
                break;
                
            case 'boost':
                player.velX = 12;
                player.velY = -5;
                break;
        }
        
        // Effet visuel selon si on donne ou retire des vies
        if (obs.lifeBonus !== undefined && obs.lifeBonus < 0) {
            // Explosion si retrait de vies
            this.createExplosion(obs.x + obs.width/2, obs.y + obs.height/2);
        } else {
            // Simple particule si don de vies ou neutre
            this.game.renderer.addParticle(
                player.x,
                player.y,
                obs.icon + '✨',
                obs.color
            );
        }
        
        return true; // L'obstacle fun disparaît après contact
    }
    
    createIceBreakEffect(x, y) {
        // Créer des morceaux de glace qui tombent
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.game.renderer.addParticle(
                x,
                y,
                '❄️',
                '#87CEEB'
            );
        }
        console.log('❄️💥 Bris de glace!');
    }
    
    onMessagePopped() {
        this.narrativeBubblesPopped++;
        this.totalXP++; // +1 XP pour la bulle narrative
        
        // Ajouter 1000 points au score
        this.game.score += 1000;
        
        // Redonner 0.25 vie au joueur
        if (this.game.player.lives < this.game.player.maxLives) {
            this.game.player.lives = Math.min(this.game.player.maxLives, this.game.player.lives + 0.25);
            console.log(`❤️ +0.25 vie ! Vies: ${this.game.player.lives.toFixed(2)}/${this.game.player.maxLives}`);
        }
        
        console.log(`💭 Bulle éclatée! Total: ${this.narrativeBubblesPopped} | XP: ${this.totalXP} | +1000 pts`);
        
        // Spawner une arme tous les 7 bulles narratives éclatées
        if (this.narrativeBubblesPopped % 7 === 0) {
            console.log(`🎯 7 bulles atteintes! Spawn d'arme...`);
            this.spawnWeapon();
        }
    }
    
    addXP(amount) {
        // Ajouter XP directement au total (power-ups, boss)
        this.totalXP += amount;
        
        // Log seulement pour les gros gains (>50 XP)
        if (amount >= 50) {
            console.log(`🎉 +${amount} XP! Total: ${this.totalXP}`);
        }
        
        // PAS de spawn d'armes ici - uniquement via onMessagePopped()
    }
    
    spawnWeapon() {
        const weapon = WeaponObstacles.getRandom();
        this.weapons.push(weapon);
        console.log(`⚔️ Arme ${weapon.text} spawnée (bulles: ${this.narrativeBubblesPopped})`);
    }
    
    spawnBossInLine() {
        // Liste des boss dangereux ET fun
        const bossTypes = [
            { id: 'whale', icon: '🐋', text: 'BALEINE', color: '#4169E1', width: 80, height: 50, damage: 2 },
            { id: 'pacman', icon: '👾', text: 'PACMAN', color: '#FFFF00', width: 60, height: 60, damage: 2 },
            { id: 'dragon', icon: '🐉', text: 'DRAGON', color: '#FF4500', width: 70, height: 55, damage: 2 },
            { id: 'ufo', icon: '🛸', text: 'OVNI', color: '#00FF00', width: 65, height: 45, damage: 2 },
            { id: 'shark', icon: '🦈', text: 'REQUIN', color: '#4682B4', width: 55, height: 40, damage: 2 },
            { id: 'cruise_ship', icon: '🚢', text: 'PAQUEBOT', color: '#0055A4', width: 90, height: 60, damage: 2 },
            // 3 nouveaux boss fun
            { id: 'robot', icon: '🤖', text: 'ROBOT', color: '#C0C0C0', width: 65, height: 60, damage: 2 },
            { id: 'alien', icon: '👽', text: 'ALIEN', color: '#00FF7F', width: 60, height: 55, damage: 2 },
            { id: 'monster', icon: '👹', text: 'MONSTRE', color: '#8B0000', width: 70, height: 65, damage: 2 }
        ];
        
        // Vérifier quels boss sont déjà présents dans la ligne
        const existingBossIds = this.bossLine.map(b => b.id);
        
        // Filtrer pour obtenir les boss qui peuvent encore spawner
        const availableBossTypes = bossTypes.filter(b => {
            // Pas déjà dans la ligne ET pas atteint la limite de spawn
            const spawnCount = this.bossSpawnCount[b.id] || 0;
            return !existingBossIds.includes(b.id) && spawnCount < this.maxSpawnsPerBoss;
        });
        
        // Si aucun boss disponible
        if (availableBossTypes.length === 0) {
            console.log('⚠️ Tous les boss ont atteint leur limite de spawn!');
            return;
        }
        
        // Trouver les positions occupées
        const occupiedPositions = this.bossLine.map(b => b.bossPosition);
        
        // Trouver la première position libre (0-5)
        let freePosition = -1;
        for (let i = 0; i < 6; i++) {
            if (!occupiedPositions.includes(i)) {
                freePosition = i;
                break;
            }
        }
        
        // Si aucune position libre, on ne peut pas spawner
        if (freePosition === -1) {
            console.log('⚠️ Aucune position libre dans la ligne de boss!');
            return;
        }
        
        // Choisir aléatoirement parmi les boss disponibles
        const boss = availableBossTypes[Math.floor(Math.random() * availableBossTypes.length)];
        
        // Centrer les boss avec moins d'espace entre eux
        const spacing = 100; // Réduit de 130 à 100
        const totalWidth = 6 * spacing; // Largeur totale pour 6 positions
        const startX = (this.game.canvas.width - totalWidth) / 2 + 50; // Centrer sur le canvas
        
        const bossObj = {
            ...boss,
            x: startX + freePosition * spacing, // Position centrée
            y: 50, // Alignés en haut
            type: 'boss',
            dangerous: true,
            bossPosition: freePosition, // Enregistrer la position dans la ligne
            cloudEffect: 120, // Effet nuage pendant 2 secondes
            isFixed: true // Boss ne bouge pas
        };
        
        this.bossLine.push(bossObj);
        this.obstacles.push(bossObj);
        
        // Incrémenter le compteur de spawn pour ce boss
        this.bossSpawnCount[boss.id] = (this.bossSpawnCount[boss.id] || 0) + 1;
        
        console.log(`🐉 Boss ${boss.text} ajouté en position ${freePosition + 1}/6 (spawn ${this.bossSpawnCount[boss.id]}/${this.maxSpawnsPerBoss})`);
    }
    
    updateBossLine() {
        for (let i = this.bossLine.length - 1; i >= 0; i--) {
            const boss = this.bossLine[i];
            
            // Les boss restent fixes, juste diminuer l'effet nuage
            if (boss.cloudEffect > 0) {
                boss.cloudEffect--;
            }
            
            // Diminuer l'indicateur de ciblage
            if (boss.targetIndicator > 0) {
                boss.targetIndicator--;
            }
            
            // Diminuer la protection au spawn
            if (boss.spawnProtection > 0) {
                boss.spawnProtection--;
                if (boss.spawnProtection === 0) {
                    console.log(`🛡️ Protection du ${boss.text} terminée`);
                }
            }
        }
    }
    
    canSpawnMoreBosses() {
        // Vérifier s'il reste des boss qui peuvent spawner
        const bossIds = ['whale', 'pacman', 'dragon', 'ufo', 'shark', 'cruise_ship', 'robot', 'alien', 'monster'];
        for (const id of bossIds) {
            const spawnCount = this.bossSpawnCount[id] || 0;
            if (spawnCount < this.maxSpawnsPerBoss) {
                return true; // Au moins un boss peut encore spawner
            }
        }
        return false; // Tous les boss ont atteint leur limite
    }
    
    checkVictoryCondition() {
        // Victoire si tous les boss ont été tués 2 fois et qu'il n'y en a plus à l'écran
        if (this.bossLine.length > 0) {
            return false; // Il reste des boss à l'écran
        }
        
        const bossIds = ['whale', 'pacman', 'dragon', 'ufo', 'shark', 'cruise_ship', 'robot', 'alien', 'monster'];
        for (const id of bossIds) {
            const spawnCount = this.bossSpawnCount[id] || 0;
            const killCount = this.bossesKilled[id] || 0;
            
            // Si un boss a été spawné mais pas complètement tué
            if (spawnCount > killCount) {
                return false;
            }
        }
        
        // Tous les boss spawnés ont été tués ET plus aucun ne peut spawner
        return !this.canSpawnMoreBosses();
    }
    
    bossFire(shooterIndex) {
        if (shooterIndex >= this.bossLine.length) return;
        
        const shooter = this.bossLine[shooterIndex];
        if (!shooter) return;
        
        // Position de départ du projectile
        const startX = shooter.x + shooter.width / 2;
        const startY = shooter.y + shooter.height;
        
        // Position du mouton
        const targetX = this.game.player.x;
        const targetY = this.game.player.y;
        
        // Calculer la direction vers le mouton
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normaliser et appliquer une vitesse
        const speed = 6;
        const velX = (dx / distance) * speed;
        const velY = (dy / distance) * speed;
        
        // Créer un projectile qui vise le mouton
        const projectile = {
            x: startX - 10,
            y: startY,
            width: 20,
            height: 30,
            velX: velX,
            velY: velY,
            icon: shooter.icon === '🐉' ? '🔥' : shooter.icon === '🛸' ? '⚡' : shooter.icon === '🦈' ? '💧' : '💥',
            color: shooter.color,
            damage: 1 // Les projectiles de boss font 1 dégât
        };
        
        this.projectiles.push(projectile);
        console.log(`💥 ${shooter.text} tire un projectile vers le mouton!`);
    }
    
    spawnBigBoss() {
        // Le BIG BOSS apparaît à droite au milieu de l'écran
        this.bigBoss = {
            id: 'big_boss',
            icon: '👹',
            text: 'BIG BOSS',
            color: '#8B0000',
            width: 140, // 2x plus gros (70 * 2)
            height: 130, // 2x plus gros (65 * 2)
            x: this.game.canvas.width - 160, // À droite
            y: this.game.canvas.height / 2 - 65, // Au milieu verticalement
            type: 'boss',
            dangerous: true,
            damage: 3,
            isFixed: true,
            isBigBoss: true,
            spawnProtection: 120 // 2 secondes de protection au spawn
        };
        
        this.obstacles.push(this.bigBoss);
        this.bigBossShootCount = 0;
        this.bigBossShootTimer = 0;
        console.log('🔥💀 BIG BOSS apparaît à droite!');
    }
    
    bigBossFire() {
        if (!this.bigBoss) return;
        
        // Position de départ du projectile (centre gauche du BIG BOSS)
        const startX = this.bigBoss.x;
        const startY = this.bigBoss.y + this.bigBoss.height / 2;
        
        // Position du mouton
        const targetX = this.game.player.x;
        const targetY = this.game.player.y;
        
        // Calculer la direction vers le mouton
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normaliser et appliquer une vitesse
        const speed = 8; // Plus rapide que les boss normaux
        const velX = (dx / distance) * speed;
        const velY = (dy / distance) * speed;
        
        // Créer un gros projectile
        const projectile = {
            x: startX,
            y: startY - 15,
            width: 30,
            height: 30,
            velX: velX,
            velY: velY,
            icon: '💀',
            color: '#8B0000',
            damage: 2 // Plus de dégâts
        };
        
        this.projectiles.push(projectile);
        console.log(`💀💥 BIG BOSS tire (${this.bigBossShootCount + 1}/3)!`);
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // Mouvement selon la vélocité (X et Y)
            proj.x += proj.velX;
            proj.y += proj.velY;
            
            // Collision avec le joueur
            if (this.checkCollision(proj)) {
                // Retirer 1 vie
                const stillAlive = this.game.player.loseLife();
                this.game.player.fuel = Math.max(0, this.game.player.fuel - 15);
                console.log('💥 Projectile touché! -1 vie');
                
                if (!stillAlive) {
                    this.game.gameOver();
                }
                
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Retirer si hors écran
            if (proj.y > this.game.canvas.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    getAll() {
        return this.obstacles;
    }
    
    getWeapons() {
        return this.weapons;
    }
    
    getFallingObjects() {
        return this.fallingObjects;
    }
    
    getProjectiles() {
        return this.projectiles;
    }
}
