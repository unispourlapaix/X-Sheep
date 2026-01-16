// LaserSystem.js - Système de tir laser façon Star Wars avec 6 types
import { GameConfig } from '../config/GameConfig.js';

export class LaserSystem {
    constructor(game) {
        this.game = game;
        this.lasers = [];
        this.fireRate = 60; // Frames entre chaque tir - très lent (1 tir par seconde)
        this.lastFireTime = 0;
        this.maxLasers = 15; // Limite de lasers à l'écran
        
        // Compteur pour les onomatopées alternées
        this.bossHitCounter = 0;
        
        // 6 types de tirs spéciaux
        this.weaponTypes = [
            {
                id: 'laser',
                name: 'LASER',
                emoji: '⚡',
                color: '#00FF00',
                glowColor: '#88FF88',
                count: 1,
                spread: 0,
                speed: 12,
                size: { width: 40, height: 4 },
                damage: 1
            },
            {
                id: 'triple',
                name: 'TRIPLE',
                emoji: '⚡⚡⚡',
                color: '#00FFFF',
                glowColor: '#88FFFF',
                count: 3,
                spread: 20,
                speed: 12,
                size: { width: 35, height: 4 },
                damage: 1
            },
            {
                id: 'mega',
                name: 'MEGA',
                emoji: '💥',
                color: '#FF6600',
                glowColor: '#FFAA66',
                count: 1,
                spread: 0,
                speed: 10,
                size: { width: 60, height: 10 },
                damage: 3
            },
            {
                id: 'bombe',
                name: 'BOMBE',
                emoji: '💣',
                color: '#FF0000',
                glowColor: '#FF6666',
                count: 1,
                spread: 0,
                speed: 8,
                size: { width: 20, height: 20 },
                damage: 5,
                explosive: true
            },
            {
                id: 'multiple',
                name: 'MULTIPLE',
                emoji: '✨',
                color: '#FFFF00',
                glowColor: '#FFFF88',
                count: 5,
                spread: 15,
                speed: 11,
                size: { width: 25, height: 3 },
                damage: 1
            },
            {
                id: 'wave',
                name: 'WAVE',
                emoji: '〰️',
                color: '#FF00FF',
                glowColor: '#FF88FF',
                count: 1,
                spread: 0,
                speed: 10,
                size: { width: 50, height: 6 },
                damage: 2,
                wave: true
            }
        ];
        
        this.currentWeaponIndex = 0;
        this.weaponSwitchTimer = 0;
        this.weaponSwitchInterval = 300; // Changer d'arme toutes les 5 secondes
        
        // Mega Pistol (power-up temporaire)
        this.megaPistolActive = false;
        this.megaPistolTimer = 0;
        this.megaPistolDuration = 180; // 3 secondes (60fps * 3)
        
        // Bombes spéciales (double-clic)
        this.specialBombs = [];
    }
    
    getCurrentWeapon() {
        return this.weaponTypes[this.currentWeaponIndex];
    }
    
    fireSpecialBomb() {
        const player = this.game.player;
        const weapon = this.getCurrentWeapon();
        
        // Créer une MEGA BOMBE basée sur l'arme actuelle
        const specialBomb = {
            x: player.x + player.width,
            y: player.y + player.height / 2,
            width: 50,
            height: 50,
            speed: 6,
            color: weapon.color,
            glowColor: weapon.glowColor,
            weaponType: weapon.id,
            weaponName: weapon.name,
            lifetime: 180,
            age: 0,
            damage: weapon.damage * 5, // 5x les dégâts de l'arme
            rotation: 0,
            scale: 1.0
        };
        
        this.specialBombs.push(specialBomb);
        
        // Son de bombe
        if (this.game.audioManager && this.game.audioManager.initialized) {
            this.game.audioManager.playBombSound();
        }
        
        // Notification visuelle
        this.game.renderer.addParticle(
            GameConfig.CANVAS_WIDTH / 2,
            100,
            `💣 ${weapon.name} BOMB 💣`,
            weapon.color
        );
        
        console.log(`💣 Bombe spéciale ${weapon.name} lancée! Dégâts: ${specialBomb.damage}`);
    }
    
    fire() {
        const currentTime = this.game.frameCount || 0;
        
        // Vérifier le cooldown
        if (currentTime - this.lastFireTime < this.fireRate) {
            return;
        }
        
        // Limiter le nombre de lasers à l'écran
        if (this.lasers.length >= this.maxLasers) {
            return;
        }
        
        const player = this.game.player;
        let weapon = this.getCurrentWeapon();
        
        // Si Mega Pistol actif, utiliser une arme surpuissante
        if (this.megaPistolActive) {
            weapon = {
                id: 'mega_pistol',
                name: 'MEGA PISTOL',
                emoji: '🔫💥',
                color: '#FF00FF',
                glowColor: '#FF88FF',
                count: 3,
                spread: 30,
                speed: 15,
                size: { width: 80, height: 12 },
                damage: 10
            };
        }
        
        // Créer les lasers selon le type d'arme
        for (let i = 0; i < weapon.count; i++) {
            const spreadOffset = weapon.spread * (i - (weapon.count - 1) / 2);
            
            const laser = {
                x: player.x + player.width,
                y: player.y + player.height / 2 + spreadOffset,
                width: weapon.size.width,
                height: weapon.size.height,
                speed: weapon.speed,
                color: weapon.color,
                glowColor: weapon.glowColor,
                lifetime: 120,
                age: 0,
                damage: weapon.damage,
                explosive: weapon.explosive || false,
                wave: weapon.wave || false,
                wavePhase: Math.random() * Math.PI * 2,
                spreadOffset: spreadOffset
            };
            
            this.lasers.push(laser);
        }
        
        this.lastFireTime = currentTime;
        
        // Son de tir laser
        if (this.game.audioManager && this.game.audioManager.initialized) {
            this.game.audioManager.playLaserSound();
        }
        
        // Pas de particule de tir (anti-spam pour performance)
    }
    
    update() {
        // Gérer le timer du Mega Pistol
        if (this.megaPistolActive) {
            this.megaPistolTimer--;
            if (this.megaPistolTimer <= 0) {
                this.megaPistolActive = false;
                this.game.renderer.addParticle(
                    GameConfig.CANVAS_WIDTH / 2,
                    100,
                    '⚡ MEGA PISTOL TERMINÉ',
                    '#FF00FF'
                );
            }
        }
        
        // Changer d'arme périodiquement (sauf si Mega Pistol actif)
        if (!this.megaPistolActive) {
            this.weaponSwitchTimer++;
            if (this.weaponSwitchTimer >= this.weaponSwitchInterval) {
                this.weaponSwitchTimer = 0;
                this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weaponTypes.length;
                
                // Pas de particule de changement d'arme (anti-spam)
            }
        }
        
        // Le tir n'est plus automatique - il est déclenché par les contrôles
        
        // Mettre à jour toutes les bombes spéciales
        for (let i = this.specialBombs.length - 1; i >= 0; i--) {
            const bomb = this.specialBombs[i];
            
            // Déplacer la bombe
            bomb.x += bomb.speed;
            bomb.age++;
            bomb.rotation += 0.1;
            
            // Pulse effect
            bomb.scale = 1.0 + Math.sin(bomb.age * 0.2) * 0.2;
            
            // Supprimer les bombes hors écran ou trop vieilles
            if (bomb.x > GameConfig.CANVAS_WIDTH || bomb.age >= bomb.lifetime) {
                this.specialBombs.splice(i, 1);
                continue;
            }
            
            // Vérifier les collisions en mode infini
            if (this.game.mode === 'endless' && this.game.endlessMode) {
                this.checkSpecialBombCollisions(bomb, i);
            }
        }
        
        // Mettre à jour tous les lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            
            // Déplacer le laser
            laser.x += laser.speed;
            laser.age++;
            
            // Effet wave (ondulation)
            if (laser.wave) {
                laser.wavePhase += 0.2;
                laser.y += Math.sin(laser.wavePhase) * 2;
            }
            
            // Supprimer les lasers hors écran ou trop vieux
            if (laser.x > GameConfig.CANVAS_WIDTH || laser.age >= laser.lifetime) {
                this.lasers.splice(i, 1);
                continue;
            }
            
            // Vérifier les collisions en mode infini
            if (this.game.mode === 'endless' && this.game.endlessMode) {
                this.checkEndlessCollisions(laser, i);
            }
        }
    }
    
    checkSpecialBombCollisions(bomb, bombIndex) {
        const endless = this.game.endlessMode;
        let hasHit = false;
        
        // Collision avec le BOSS - effet massif!
        if (endless.currentBoss && endless.currentBoss.health > 0) {
            const boss = endless.currentBoss;
            const bossRadius = boss.size / 2;
            
            if (bomb.x < boss.x + bossRadius &&
                bomb.x + bomb.width > boss.x - bossRadius &&
                bomb.y < boss.y + bossRadius &&
                bomb.y + bomb.height > boss.y - bossRadius) {
                
                hasHit = true;
                
                // Son "paf!" pour l'impact de bombe
                if (this.game.audioManager && this.game.audioManager.initialized) {
                    this.game.audioManager.playPafSound();
                }
                
                // Boss de palier avec bouclier
                if (endless.isStageBoss && boss.hasShield && boss.shield > 0) {
                    // Dégâts massifs au bouclier
                    boss.shield -= bomb.damage;
                    
                    console.log(`💣 Bombe sur bouclier! Shield: ${boss.shield}/${boss.maxShield}`);
                    
                    // Bouclier détruit
                    if (boss.shield <= 0) {
                        boss.shield = 0;
                        boss.hasShield = false;
                        
                        // MEGA EXPLOSION du bouclier
                        for (let i = 0; i < 12; i++) {
                            const angle = (Math.PI * 2 * i) / 12;
                            const dist = boss.size * 0.8;
                            this.game.renderer.addParticle(
                                boss.x + Math.cos(angle) * dist,
                                boss.y + Math.sin(angle) * dist,
                                '💥',
                                '#00BFFF'
                            );
                        }
                        
                        this.game.renderer.addParticle(
                            boss.x,
                            boss.y - 80,
                            '🛡️ BOUCLIER ANNIHILÉ !',
                            '#FFD700'
                        );
                    }
                } else {
                    // Dégâts massifs à la vie
                    boss.health -= bomb.damage;
                    
                    console.log(`💣 Bombe sur boss! HP: ${boss.health}/${boss.maxHealth}`);
                    
                    // Boss détruit
                    if (boss.health <= 0) {
                        // Son "pouf" grave pour destruction
                        if (this.game.audioManager && this.game.audioManager.initialized) {
                            this.game.audioManager.playPoufSound();
                        }
                        
                        // MEGA EXPLOSION finale
                        for (let i = 0; i < 20; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const dist = Math.random() * boss.size;
                            this.game.renderer.addParticle(
                                boss.x + Math.cos(angle) * dist,
                                boss.y + Math.sin(angle) * dist,
                                ['💥', '🔥', '💣'][Math.floor(Math.random() * 3)],
                                '#FFD700'
                            );
                        }
                        
                        // GROS BONUS de points
                        this.game.score += 5000;
                        
                        console.log('🎯 Boss annihilé par bombe! +5000 points!');
                        
                        // Forcer le boss à disparaître
                        boss.x = -boss.size * 2;
                    }
                }
                
                // POINTS pour la bombe
                this.game.score += 500 * bomb.damage;
            }
        }
        
        // Explosion de zone - détruire tous les obstacles proches
        if (hasHit) {
            const explosionRadius = 150;
            
            // Détruire tous les obstacles dans le rayon
            for (let i = endless.obstacles.length - 1; i >= 0; i--) {
                const obs = endless.obstacles[i];
                const dx = bomb.x - obs.x;
                const dy = bomb.y - obs.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < explosionRadius) {
                    endless.obstacles.splice(i, 1);
                    
                    // Particules d'explosion
                    this.game.renderer.addParticle(
                        obs.x,
                        obs.y,
                        '💥',
                        bomb.color
                    );
                }
            }
            
            // Grande explosion visuelle
            for (let i = 0; i < 15; i++) {
                const angle = (Math.PI * 2 * i) / 15;
                const dist = explosionRadius * 0.8;
                this.game.renderer.addParticle(
                    bomb.x + Math.cos(angle) * dist,
                    bomb.y + Math.sin(angle) * dist,
                    ['💥', '🔥', '💣', '✨'][Math.floor(Math.random() * 4)],
                    bomb.color
                );
            }
            
            // Supprimer la bombe après impact
            this.specialBombs.splice(bombIndex, 1);
        }
    }
    
    checkEndlessCollisions(laser, laserIndex) {
        const endless = this.game.endlessMode;
        
        // Collision avec le BOSS (gros points!)
        if (endless.currentBoss && endless.currentBoss.health > 0) {
            const boss = endless.currentBoss;
            const bossRadius = boss.size / 2;
            
            if (laser.x < boss.x + bossRadius &&
                laser.x + laser.width > boss.x - bossRadius &&
                laser.y < boss.y + bossRadius &&
                laser.y + laser.height > boss.y - bossRadius) {
                
                // Détruire le laser (sauf si explosif)
                if (!laser.explosive) {
                    this.lasers.splice(laserIndex, 1);
                }
                
                // Boss de palier avec bouclier
                if (endless.isStageBoss && boss.hasShield && boss.shield > 0) {
                    // Attaquer le bouclier
                    boss.shield -= laser.damage;
                    
                    // EXPLOSION BLEUE sur le bouclier
                    this.game.renderer.addParticle(
                        boss.x + (Math.random() - 0.5) * boss.size,
                        boss.y + (Math.random() - 0.5) * boss.size,
                        '🛡️',
                        '#00BFFF'
                    );
                    
                    // POINTS pour toucher le bouclier
                    this.game.score += 50 * laser.damage;
                    
                    console.log(`🛡️ Bouclier touché! Shield: ${boss.shield}/${boss.maxShield}`);
                    
                    // Bouclier détruit
                    if (boss.shield <= 0) {
                        boss.shield = 0;
                        boss.hasShield = false;
                        
                        // MEGA EXPLOSION du bouclier
                        for (let i = 0; i < 8; i++) {
                            const angle = (Math.PI * 2 * i) / 8;
                            const dist = boss.size * 0.8;
                            this.game.renderer.addParticle(
                                boss.x + Math.cos(angle) * dist,
                                boss.y + Math.sin(angle) * dist,
                                '💥',
                                '#00BFFF'
                            );
                        }
                        
                        this.game.renderer.addParticle(
                            boss.x,
                            boss.y - 80,
                            '🛡️ BOUCLIER DÉTRUIT !',
                            '#FFD700'
                        );
                        
                        console.log('🎯 Bouclier du boss détruit!');
                    }
                } else {
                    // Attaquer la vie du boss (normal ou après destruction du bouclier)
                    boss.health -= laser.damage;
                    
                    // Son "fuzze" pour toucher le boss
                    if (this.game.audioManager && this.game.audioManager.initialized) {
                        this.game.audioManager.playFuzzeSound();
                    }
                    
                    // Onomatopée alternée "paf", "pof", "pif"
                    const impacts = ['PAF!', 'POF!', 'PIF!'];
                    const currentImpact = impacts[this.bossHitCounter % 3];
                    
                    this.bossHitCounter++;
                    
                    // EXPLOSION ROUGE sur le boss
                    this.game.renderer.addParticle(
                        boss.x + (Math.random() - 0.5) * 40,
                        boss.y + (Math.random() - 0.5) * 40,
                        currentImpact,
                        '#FFFF00'
                    );
                    
                    // Particule d'explosion
                    this.game.renderer.addParticle(
                        boss.x,
                        boss.y,
                        '💥',
                        '#FF0000'
                    );
                    
                    // POINTS pour toucher le boss
                    this.game.score += 100 * laser.damage;
                    
                    console.log(`💥 Boss touché! HP: ${boss.health}/${boss.maxHealth}`);
                    
                    // Boss détruit
                    if (boss.health <= 0) {
                        // Son "pouf" grave pour destruction
                        if (this.game.audioManager && this.game.audioManager.initialized) {
                            this.game.audioManager.playPoufSound();
                        }
                        
                        // MEGA EXPLOSION finale
                        this.game.renderer.addParticle(
                            boss.x,
                            boss.y,
                            '💥💥💥',
                            '#FFD700'
                        );
                        
                        // GROS BONUS de points
                        this.game.score += 2000;
                        
                        // ACTIVER LE MEGA PISTOL!
                        this.activateMegaPistol();
                        
                        console.log('🎯 Boss détruit! +2000 points + Mega Pistol!');
                        
                        // Forcer le boss à disparaître et passer au suivant
                        boss.x = -boss.size * 2;
                    }
                }
                
                return;
            }
        }
        
        // Collisions avec les obstacles du mode infini
        for (let i = endless.obstacles.length - 1; i >= 0; i--) {
            const obs = endless.obstacles[i];
            
            // Détection de collision simple (rectangle)
            if (laser.x < obs.x + 30 &&
                laser.x + laser.width > obs.x - 30 &&
                laser.y < obs.y + 40 &&
                laser.y + laser.height > obs.y - 40) {
                
                // Son "ping" quand on détruit un obstacle
                if (this.game.audioManager && this.game.audioManager.initialized) {
                    this.game.audioManager.playPingSound();
                }
                
                // Détruire l'obstacle
                endless.obstacles.splice(i, 1);
                
                // Détruire le laser (sauf si explosif)
                if (!laser.explosive) {
                    this.lasers.splice(laserIndex, 1);
                }
                
                // Pas de particule (anti-spam)
                
                // Explosion supplémentaire pour les bombes
                if (laser.explosive) {
                    // Détruire les obstacles proches
                    const explosionRadius = 80;
                    for (let j = endless.obstacles.length - 1; j >= 0; j--) {
                        const nearby = endless.obstacles[j];
                        const dx = obs.x - nearby.x;
                        const dy = obs.y - nearby.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < explosionRadius) {
                            endless.obstacles.splice(j, 1);
                            // Pas de particule (anti-spam)
                            this.game.score += 100;
                            this.game.obstaclesCleared++;
                        }
                    }
                    this.lasers.splice(laserIndex, 1);
                }
                
                // Points bonus
                this.game.score += 100 * laser.damage;
                this.game.obstaclesCleared++;
                
                break;
            }
        }
        
        // Collision avec le fuel (bonus!)
        for (let i = endless.fuels.length - 1; i >= 0; i--) {
            const fuel = endless.fuels[i];
            
            if (laser.x < fuel.x + 20 &&
                laser.x + laser.width > fuel.x - 20 &&
                laser.y < fuel.y + 20 &&
                laser.y + laser.height > fuel.y - 20) {
                
                // Détruire le fuel
                endless.fuels.splice(i, 1);
                
                // Particules bonus
                this.game.renderer.addParticle(
                    fuel.x,
                    fuel.y,
                    '✨+1000✨',
                    '#FFD700'
                );
                
                // MEGA BONUS pour tirer sur le fuel!
                this.game.score += 1000;
                
                break;
            }
        }
    }
    
    render(ctx) {
        // Dessiner les bombes spéciales d'abord (en arrière-plan)
        for (const bomb of this.specialBombs) {
            ctx.save();
            
            // Position centrale de la bombe
            const centerX = bomb.x + bomb.width / 2;
            const centerY = bomb.y + bomb.height / 2;
            
            // Aura pulsante géante
            const auraRadius = 40 * bomb.scale;
            const auraGradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, auraRadius
            );
            auraGradient.addColorStop(0, `${bomb.color}AA`);
            auraGradient.addColorStop(0.5, `${bomb.color}44`);
            auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Rotation et échelle
            ctx.translate(centerX, centerY);
            ctx.rotate(bomb.rotation);
            ctx.scale(bomb.scale, bomb.scale);
            
            // Ombre portée
            ctx.shadowColor = bomb.glowColor;
            ctx.shadowBlur = 30;
            
            // Corps de la bombe (cercle avec glow)
            ctx.fillStyle = bomb.color;
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordure brillante
            ctx.strokeStyle = bomb.glowColor;
            ctx.lineWidth = 4;
            ctx.stroke();
            
            // Symbole au centre
            ctx.shadowBlur = 10;
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('💣', 0, 0);
            
            // Traînée d'énergie
            for (let i = 1; i <= 5; i++) {
                const trailX = -i * 10;
                const trailOpacity = (6 - i) / 6;
                ctx.globalAlpha = trailOpacity * 0.6;
                ctx.fillStyle = bomb.color;
                ctx.beginPath();
                ctx.arc(trailX, 0, 15 * (1 - i / 5), 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        // Dessiner les lasers normaux
        for (const laser of this.lasers) {
            ctx.save();
            
            // Effet de lueur
            ctx.shadowColor = laser.glowColor;
            ctx.shadowBlur = 15;
            
            // Style selon le type
            if (laser.explosive) {
                // Bombe: cercle rouge pulsant
                const pulse = 1 + Math.sin(laser.age * 0.3) * 0.2;
                ctx.fillStyle = laser.color;
                ctx.beginPath();
                ctx.arc(laser.x + laser.width / 2, laser.y, laser.height * pulse, 0, Math.PI * 2);
                ctx.fill();
                
                // Mèche
                ctx.strokeStyle = '#FF8800';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(laser.x + laser.width / 2, laser.y - laser.height);
                ctx.lineTo(laser.x + laser.width / 2, laser.y - laser.height - 5);
                ctx.stroke();
            } else {
                // Laser normal: rectangle allongé
                ctx.fillStyle = laser.color;
                ctx.fillRect(laser.x, laser.y - laser.height / 2, laser.width, laser.height);
                
                // Core du laser (plus brillant)
                ctx.shadowBlur = 25;
                ctx.fillStyle = '#FFFFFF';
                const coreHeight = Math.max(2, laser.height / 2);
                ctx.fillRect(laser.x, laser.y - coreHeight / 2, laser.width, coreHeight);
            }
            
            ctx.restore();
        }
        
        // Affichage de l'arme désactivé (inutile)
    }
    
    activateMegaPistol() {
        this.megaPistolActive = true;
        this.megaPistolTimer = this.megaPistolDuration;
        
        // Grosse annonce
        this.game.renderer.addParticle(
            GameConfig.CANVAS_WIDTH / 2,
            GameConfig.CANVAS_HEIGHT / 2,
            '🔫💥 MEGA PISTOL ACTIVÉ! 💥🔫',
            '#FF00FF'
        );
    }
}
