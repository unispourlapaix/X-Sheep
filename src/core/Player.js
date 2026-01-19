// Player.js - Logique du mouton joueur
import { GameConfig } from '../config/GameConfig.js';

export class Player {
    constructor(game) {
        this.game = game;
        
        // Position
        this.x = GameConfig.PLAYER.START_X;
        this.y = GameConfig.PLAYER.START_Y;
        this.width = GameConfig.PLAYER.WIDTH;
        this.height = GameConfig.PLAYER.HEIGHT;
        this.groundY = GameConfig.PLAYER.GROUND_Y;
        
        // Vélocité
        this.velX = 0;
        this.velY = 0;
        
        // États
        this.jumping = false;
        this.flying = false;
        this.parachuting = false; // Mode parachute après le vol
        this.parachuteTimer = 0; // Durée de l'effet parachute
        this.frozen = false; // Gelé par le Phantom
        this.frozenTimer = 0; // Durée du gel
        
        // Point d'exclamation au-dessus de la tête
        this.exclamationMark = false;
        this.exclamationTimer = 0;
        
        // Carburant pour le vol
        this.fuel = 100;
        this.maxFuel = 100;
        this.fuelConsumption = 0.08; // Consommation réduite pour que le carburant dure plus longtemps
        this.bonusFuel = 0; // Carburant bonus (carrés jaunes)
        this.bonusFuelTimer = 0; // Durée du bonus (3 secondes = 180 frames)
        
        // Corruption par richesse
        this.goldCollected = 0;
        this.size = 1.0;
        this.hairLength = 0;
        this.isRich = false; // Active l'animation fusée
        
        // Système de vies
        this.maxLives = 25;
        this.lives = 25;
        
        // Arme équipée
        this.equippedWeapon = null; // {id, icon, kills: []}
        
        // Direction du regard
        this.facingDirection = 1; // 1 = droite, -1 = gauche
        
        // Son de fusée continu
        this.rocketSoundActive = false;
        
        // Invincibilité après collision
        this.invincible = true; // Commence avec invincibilité
        this.invincibleTimer = 30; // 0.5 seconde d'invincibilité au début
        this.invincibleDuration = 30; // 0.5 seconde d'invincibilité
        this.invincibleCooldown = 0; // Cooldown avant de pouvoir redevenir invincible
        
        // Effets spéciaux des obstacles
        this.specialEffect = null; // Type d'effet actif
        this.effectTimer = 0; // Durée de l'effet
        this.rolling = false; // État de roulement (handicap)
        this.hairEffect = 0; // Longueur de mèche de cheveux (richesse)
        
        // Contrôle manuel
        this.manualControl = false;
    }
    
    update() {
        // Si contrôle manuel actif (souris/tactile), pas de physique
        if (this.manualControl) {
            return;
        }
        
        // MODE INFINI: Fuel infini et maintien en vol
        if (this.game.mode === 'endless') {
            this.fuel = this.maxFuel;
            this.bonusFuel = 0;
            if (!this.flying) {
                this.flying = true;
            }
            // Son de fusée continu en mode infini
            if (this.flying && !this.rocketSoundActive && this.game.audioManager) {
                this.game.audioManager.startRocketSound();
                this.rocketSoundActive = true;
            }
            // Appliquer friction pour l'inertie
            this.velX *= 0.95;
            this.velY *= 0.95;
        }
        
        // NIVEAU 2: Fuel infini
        if (this.game.level2Active) {
            this.fuel = this.maxFuel;
            this.bonusFuel = 0;
        }
        
        // NIVEAU 3: Mode bateau - physique normale pour permettre le vol
        if (this.game.boatMode) {
            // Réduire la friction pour mouvement plus fluide
            // La physique normale s'applique après pour permettre le vol
        }
        
        // Gérer les effets spéciaux
        if (this.effectTimer > 0) {
            this.effectTimer--;
            
            // Effet de roulement (handicap)
            if (this.specialEffect === 'rolling') {
                this.rolling = true;
                // Forcer à monter et rouler
                this.velY = -2; // Monte doucement
                this.velX = 3; // Roule vers la droite
                
                if (this.effectTimer === 0) {
                    this.rolling = false;
                    this.specialEffect = null;
                    console.log('♿ Effet handicap terminé');
                }
            }
            
            // Effet de mèche de cheveux (richesse)
            if (this.specialEffect === 'hair') {
                this.hairEffect = Math.sin(Date.now() / 200) * 20 + 30; // Oscillation
                
                if (this.effectTimer === 0) {
                    this.hairEffect = 0;
                    this.specialEffect = null;
                    console.log('💰 Effet richesse terminé');
                }
            }
        }
        
        // Si gelé, juste tomber et décompter le timer
        if (this.frozen && this.frozenTimer > 0) {
            this.frozenTimer--;
            this.velX = 0; // Immobile horizontalement
            this.velY += GameConfig.PLAYER.GRAVITY * 2; // Tombe plus vite
            this.x += this.velX;
            this.y += this.velY;
            
            // Collision avec le sol
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velY = 0;
                this.frozen = false;
                this.frozenTimer = 0;
                console.log('❄️ Dégelé !');
            }
            return;
        }
        
        // Consommation de carburant en vol uniquement
        if (this.flying) {
            // Décompter le bonus fuel d'abord
            if (this.bonusFuelTimer > 0) {
                this.bonusFuelTimer--;
                if (this.bonusFuelTimer <= 0) {
                    this.bonusFuel = 0;
                }
            }
            
            // Consommer d'abord le bonus fuel, puis le fuel normal
            if (this.bonusFuel > 0) {
                this.bonusFuel -= this.fuelConsumption;
                if (this.bonusFuel < 0) {
                    this.fuel += this.bonusFuel; // Reporter le surplus sur fuel normal
                    this.bonusFuel = 0;
                }
            } else {
                this.fuel -= this.fuelConsumption;
            }
            
            if (this.fuel <= 0) {
                this.fuel = 0;
                this.stopFlying();
            }
        } else {
            // Régénération rapide au sol
            if (this.y >= this.groundY - 5) {
                this.fuel = Math.min(this.maxFuel, this.fuel + 0.5);
            }
        }
        
        // Friction horizontale
        this.velX *= GameConfig.PLAYER.FRICTION;
        
        // Gravité (sauf si en vol)
        if (!this.flying) {
            // Mode parachute : gravité très réduite et friction aérienne
            if (this.parachuting && this.parachuteTimer > 0) {
                this.velY += GameConfig.PLAYER.GRAVITY * 0.025; // Gravité réduite à 2.5%
                this.velX *= 0.99; // Friction aérienne légère
                this.parachuteTimer--;
                
                if (this.parachuteTimer <= 0) {
                    this.parachuting = false;
                }
            } else {
                this.velY += GameConfig.PLAYER.GRAVITY;
            }
        }
        
        // Appliquer vélocité
        this.x += this.velX;
        this.y += this.velY;
        
        // Mettre à jour la direction du regard selon le mouvement
        if (Math.abs(this.velX) > 0.5) {
            this.facingDirection = this.velX > 0 ? 1 : -1;
        }
        
        // Limites horizontales - boucle au bord droit
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.canvas.width - this.width) {
            // Retour au début quand on atteint le bord droit
            this.x = GameConfig.PLAYER.START_X;
            console.log('🔄 Retour au début - Le mouton continue!');
        }
        
        // Collision avec le sol
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velY = 0;
            this.jumping = false;
        }
        
        // Limite du haut
        if (this.y < 0) {
            this.y = 0;
            this.velY = 0;
        }
        
        // Gestion de l'invincibilité
        if (this.invincible && this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.invincibleCooldown = 60; // 1 seconde de cooldown
            }
        }
        
        // Décompter le cooldown d'invincibilité
        if (this.invincibleCooldown > 0) {
            this.invincibleCooldown--;
        }
        
        // Timer du point d'exclamation
        if (this.exclamationTimer > 0) {
            this.exclamationTimer--;
            if (this.exclamationTimer === 0) {
                this.exclamationMark = false;
            }
        }
        
        // Malus de vitesse si trop riche
        if (GameConfig.GOLD.SPEED_PENALTY && this.goldCollected > 0) {
            const speedPenalty = 1 / this.size;
            this.velX *= speedPenalty;
        }
    }
    
    jump(isDoubleClick = false, holdDuration = 0) {
        if (this.y >= this.groundY - 5) {
            // Désactiver le mode auto au premier saut manuel
            if (this.autoJumpMode) {
                this.autoJumpMode = false;
                console.log('✋ Mode saut automatique désactivé - Contrôle manuel!');
            }
            
            let jumpForce = this.game.powerUpManager?.hasPower('force') 
                ? GameConfig.PLAYER.JUMP_FORCE_BOOSTED 
                : GameConfig.PLAYER.JUMP_FORCE;
            
            // Augmenter la force du saut selon la durée du maintien (max 2.5x)
            const holdMultiplier = Math.min(1 + (holdDuration / 400), 2.5);
            jumpForce *= holdMultiplier;
            
            if (holdDuration > 100) {
                console.log(`⬆️ Saut chargé: ${holdMultiplier.toFixed(2)}x (${holdDuration}ms)`);
            }
            
            this.velY = jumpForce;
            
            // Distance horizontale augmente avec le temps de charge (max 3x)
            const distanceMultiplier = Math.min(1 + (holdDuration / 300), 3.0);
            const baseSpeed = 1.5; // Réduit de 3 à 1.5
            this.velX += baseSpeed * distanceMultiplier;
            
            // Double-clic = double saut
            if (isDoubleClick) {
                this.velX += 2; // Réduit de 4 à 2
                this.velY += -1; // Réduit de -2 à -1
                console.log('🚀🚀 Double saut!');
            }
            
            this.lastJumpTime = Date.now();
            this.jumping = true;
            this.isChargingJump = false;
        }
    }
    
    startFlying() {
        // En mode bateau (niveau 3), peut voler librement
        if (this.game.boatMode || this.game.level3Active) {
            this.flying = true;
            this.velY = -4; // Vitesse de vol pour le bateau
            return true;
        }
        
        // Ne peut voler qu'avec le powerup de liberté
        if (!this.game.powerUpManager?.hasPower('liberte')) {
            console.log('⛔ Tu dois avoir le powerup de liberté pour voler!');
            return false;
        }
        
        // Peut voler dès qu'on a au moins 5% de carburant
        if (this.fuel >= this.maxFuel * 0.05) {
            this.flying = true;
            this.velY = GameConfig.PLAYER.FLY_SPEED;
            
            // Démarrer le son de fusée
            if (!this.rocketSoundActive && this.game.audioManager) {
                this.game.audioManager.startRocketSound();
                this.rocketSoundActive = true;
            }
            
            return true;
        }
        return false;
    }
    
    stopFlying() {
        this.flying = false;
        
        // Arrêter le son de fusée
        if (this.rocketSoundActive && this.game.audioManager) {
            this.game.audioManager.stopRocketSound();
            this.rocketSoundActive = false;
        }
        
        // Activer l'effet parachute avec inertie
        this.parachuting = true;
        this.parachuteTimer = 480; // 8 secondes d'effet parachute
        
        // Conserver une partie de la vélocité actuelle (inertie)
        // La vélocité est déjà définie par flyTowards, on la garde
        console.log('🪂 Mode parachute activé !');
    }
    
    flyTowards(targetX, targetY) {
        if (this.flying && this.fuel > 0) {
            // Calculer la direction vers la cible
            const dx = targetX - (this.x + this.width / 2);
            const dy = targetY - (this.y + this.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                // Vol doux et lent vers le curseur
                const speed = 4;
                
                // Penalité de vol selon les mèches de cheveux (or)
                const hairPenalty = 1 - (this.hairLength * 0.05); // -5% par mèche
                const verticalSpeed = Math.max(hairPenalty, 0.3); // Minimum 30%
                
                // Appliquer une accélération vers la cible (mix de vitesse directe et inertie)
                this.velX = this.velX * 0.7 + (dx / distance) * speed * 0.3;
                // Monter plus lentement avec les cheveux
                this.velY = this.velY * 0.7 + (dy / distance) * speed * 0.15 * verticalSpeed;
            }
        }
    }
    
    moveTowards(targetX, targetY) {
        // Calculer la direction vers la cible
        const dx = targetX - (this.x + this.width / 2);
        const dy = targetY - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) {
            // Vitesse rapide de déplacement
            const speed = 8;
            this.velX = (dx / distance) * speed;
            // Seulement si pas au sol
            if (this.y < this.groundY - 5) {
                this.velY = (dy / distance) * speed * 0.6;
            }
        }
    }
    
    startChargingJump() {
        if (this.y >= this.groundY - 5) {
            this.isChargingJump = true;
            this.jumpChargeStartTime = Date.now();
        }
    }
    
    getJumpTrajectory() {
        if (!this.isChargingJump) return null;
        
        const holdDuration = Date.now() - this.jumpChargeStartTime;
        const holdMultiplier = Math.min(1 + (holdDuration / 400), 2.5);
        const distanceMultiplier = Math.min(1 + (holdDuration / 300), 3.0);
        
        const jumpForce = GameConfig.PLAYER.JUMP_FORCE * holdMultiplier;
        const horizontalSpeed = 6 * distanceMultiplier;
        
        return {
            velY: jumpForce,
            velX: horizontalSpeed,
            chargePercent: Math.min(holdDuration / 1000, 1.0)
        };
    }
    
    refillFuel(amount) {
        const oldFuel = this.fuel;
        this.fuel = Math.min(this.maxFuel, this.fuel + amount);
        
        // Son de carburant "ploque"
        if (this.game.audioManager && this.game.audioManager.initialized) {
            this.game.audioManager.ploqueSound();
        }
        
        // Si suremplissage, ajouter le surplus en bonus fuel (carrés jaunes)
        const overflow = (oldFuel + amount) - this.maxFuel;
        if (overflow > 0) {
            this.bonusFuel += overflow;
            this.bonusFuelTimer = 180; // 3 secondes
            console.log(`💧 Carburant: ${Math.floor(this.fuel)}/${this.maxFuel} + ${Math.floor(this.bonusFuel)} BONUS!`);
        } else {
            console.log(`💧 Carburant rechargé: ${Math.floor(this.fuel)}/${this.maxFuel}`);
        }
        
        // Effet visuel de recharge
        if (this.game.renderer) {
            this.game.renderer.triggerRefuelEffect(this.x + this.width/2, this.y);
        }
    }
    
    // Vérifie si un point (x, y) est sur le mouton
    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
    
    // Faire bondir le mouton quand on clique dessus
    bounce() {
        if (this.y >= this.groundY - 10) {
            // Bond vertical
            this.velY = -6;
            console.log('🐑 Boing !');
        }
    }
    
    // Geler le mouton (effet Phantom)
    freeze() {
        this.frozen = true;
        this.frozenTimer = 60; // 1 seconde
        this.flying = false;
        this.parachuting = false;
        console.log('❄️ Gelé par le Phantom !');
    }
    
    // Équiper une arme
    equipWeapon(weapon) {
        this.equippedWeapon = weapon;
        console.log(`⚔️ ${weapon.text} équipée ! Peut tuer: ${weapon.kills.join(', ')}`);
        
        // Vérifier si un boss correspondant est actif
        let targetBoss = null;
        for (const bossId of weapon.kills) {
            targetBoss = this.game.obstacleManager.bossLine.find(boss => boss.id === bossId);
            if (targetBoss) break;
        }
        
        if (targetBoss) {
            // Boss trouvé - ajouter un cercle jaune de ciblage
            targetBoss.targetIndicator = 180; // 3 secondes d'indication
            console.log(`🎯 Boss ${targetBoss.text} ciblé!`);
        } else {
            // Aucun boss actif pour cette arme - respawn une autre arme
            console.log(`⚠️ Aucun boss actif pour ${weapon.text}. Respawn d'une nouvelle arme...`);
            setTimeout(() => {
                if (this.game?.obstacleManager) {
                    this.game.obstacleManager.spawnWeapon();
                }
            }, 1000);
        }
    }
    
    // Peut tuer cet obstacle?
    canKill(obstacleId) {
        return this.equippedWeapon && this.equippedWeapon.kills.includes(obstacleId);
    }
    
    moveLeft() {
        this.velX = -4;
    }
    
    moveRight() {
        this.velX = 4;
    }
    
    moveUp() {
        if (this.game.boatMode) {
            this.velY = -4;
        }
    }
    
    moveDown() {
        if (this.game.boatMode) {
            this.velY = 4;
        }
    }
    
    collectGold(amount) {
        this.goldCollected += amount;
        
        // Activer l'animation fusée si riche
        if (this.goldCollected > 0) {
            this.isRich = true;
            
            // Démarrer le son de fusée quand on devient riche
            if (!this.rocketSoundActive && this.game.audioManager) {
                this.game.audioManager.startRocketSound();
                this.rocketSoundActive = true;
            }
        }
        
        // Grossissement progressif
        this.size = 1.0 + (this.goldCollected * GameConfig.GOLD.SIZE_GROWTH_RATE);
        
        // Croissance d'une mèche de cheveux par pièce d'or
        this.hairLength = Math.min(
            this.goldCollected, // 1 mèche par pièce
            GameConfig.GOLD.MAX_HAIR_LENGTH
        );
        
        // Ajuster hitbox
        this.width = GameConfig.PLAYER.WIDTH * this.size;
        this.height = GameConfig.PLAYER.HEIGHT * this.size;
        
        console.log(`💈 Or collecté: ${this.goldCollected} - Cheveux: ${this.hairLength} mèches - Taille: ${this.size.toFixed(2)}x`);
    }
    
    giveGold() {
        // Système de charité - redevenir humble
        const hadGold = this.goldCollected > 0;
        
        this.goldCollected = 0;
        this.size = 1.0;
        this.hairLength = 0;
        this.width = GameConfig.PLAYER.WIDTH;
        this.height = GameConfig.PLAYER.HEIGHT;
        this.isRich = false;
        
        // Arrêter le son de fusée si actif (sauf si en vol)
        if (this.rocketSoundActive && !this.flying && this.game.audioManager) {
            this.game.audioManager.stopRocketSound();
            this.rocketSoundActive = false;
        }
        
        // Débloquer le trophée de charité si on avait de l'or
        if (hadGold && this.game.trophySystem) {
            this.game.trophySystem.unlockTrophy('charity');
        }
        
        console.log('💝 Charité ! Tu as donné ton or pour redevenir humble.');
        this.height = GameConfig.PLAYER.HEIGHT;
    }
    
    setManualControl(active) {
        this.manualControl = active;
        if (active) {
            this.velX = 0;
            this.velY = 0;
        }
    }
    
    setPosition(x, y) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
        
        // Limites
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.canvas.width - this.width) {
            this.x = this.game.canvas.width - this.width;
        }
        if (this.y < 0) this.y = 0;
        if (this.y > this.game.canvas.height - 80 - this.height) {
            this.y = this.game.canvas.height - 80 - this.height;
        }
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Activer un effet spécial d'obstacle
     * @param {string} effectType - Type d'effet ('rolling', 'hair', etc.)
     * @param {number} duration - Durée en frames (180 = 3 secondes)
     */
    applySpecialEffect(effectType, duration = 180) {
        this.specialEffect = effectType;
        this.effectTimer = duration;
        
        if (effectType === 'rolling') {
            console.log('♿ Effet HANDICAP: roulement pendant 3s!');
        } else if (effectType === 'hair') {
            console.log('💰 Effet RICHESSE: grosse mèche de cheveux!');
        }
    }
    
    loseLife() {
        if (this.lives > 0) {
            this.lives--;
            console.log(`💔 Vie perdue ! Vies restantes: ${this.lives}/${this.maxLives}`);
            
            // Son de collision obstacle "paf"
            if (this.game.audioManager && this.game.audioManager.initialized) {
                this.game.audioManager.playPafSound();
            }
            
            // Activer l'invincibilité temporaire seulement si le cooldown est terminé
            if (!this.invincible && this.invincibleCooldown === 0) {
                this.invincible = true;
                this.invincibleTimer = this.invincibleDuration;
                console.log('🛡️ Invincibilité activée pour 1 seconde');
            }
            
            return this.lives > 0;
        }
        return false;
    }
    
    gainLife() {
        if (this.lives < this.maxLives) {
            this.lives++;
            console.log(`❤️ Vie gagnée ! Vies: ${this.lives}/${this.maxLives}`);
        }
    }
    
    isDead() {
        return this.lives <= 0;
    }
}
