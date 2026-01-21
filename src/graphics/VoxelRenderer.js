// VoxelRenderer.js - Moteur de rendu style voxel/blocky (Minecraft-like)
import { GameConfig } from '../config/GameConfig.js';
import { PixelIconCache } from './PixelIconCache.js';

export class VoxelRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.blockSize = 8; // Taille d'un bloc voxel
        this.sheepBlockSize = 5; // Taille spécifique pour le mouton (plus petit)
        this.iconCache = new PixelIconCache(); // Cache d'icônes pixel art
        this.sheepCache = new Map(); // Cache pour les moutons
        this.bubbleCache = new Map(); // Cache pour les bulles
        this.obstacleCache = new Map(); // Cache pour les obstacles
    }
    
    // Dessiner un cube isométrique (vue 3D simplifiée)
    drawCube(x, y, size, topColor, sideColor, frontColor) {
        const ctx = this.ctx;
        
        // Face du haut (losange)
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size * 0.5);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y + size * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // Face droite
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size, y + size * 0.5);
        ctx.lineTo(x + size, y + size * 1.5);
        ctx.lineTo(x, y + size * 2);
        ctx.closePath();
        ctx.fill();
        
        // Face gauche
        ctx.fillStyle = frontColor;
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x - size, y + size * 0.5);
        ctx.lineTo(x - size, y + size * 1.5);
        ctx.lineTo(x, y + size * 2);
        ctx.closePath();
        ctx.fill();
        
        // Contours pour effet blocky
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Dessiner un bloc simple (vue de dessus)
    drawBlock(x, y, size, color) {
        const ctx = this.ctx;
        
        // Bloc principal
        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        
        // Ombre en bas
        ctx.fillStyle = this.darkenColor(color, 0.3);
        ctx.fillRect(x, y + size * 0.8, size, size * 0.2);
        
        // Lumière en haut
        ctx.fillStyle = this.lightenColor(color, 0.2);
        ctx.fillRect(x, y, size, size * 0.2);
        
        // Contour
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
    }
    
    // Mouton en voxels
    drawVoxelSheep(x, y, flying = false, hasGold = false) {
        const size = this.sheepBlockSize;
        
        // Clé de cache basée sur l'état
        const cacheKey = `${flying}_${hasGold}`;
        
        // Vérifier si le mouton est déjà en cache
        if (!this.sheepCache.has(cacheKey)) {
            // Créer un canvas pour ce mouton
            const canvas = document.createElement('canvas');
            canvas.width = size * 16;
            canvas.height = size * 12;
            const ctx = canvas.getContext('2d');
            
            this.drawSheepToCanvas(ctx, 0, 0, flying, hasGold);
            this.sheepCache.set(cacheKey, canvas);
        }
        
        // Dessiner le mouton depuis le cache
        const cachedSheep = this.sheepCache.get(cacheKey);
        this.ctx.drawImage(cachedSheep, x, y);
        
        // Si hasGold, dessiner les pièces animées (non cachées car animées)
        if (hasGold) {
            this.drawGoldCoins(x, y);
        }
    }
    
    // Dessiner les pièces d'or animées
    drawGoldCoins(x, y) {
        const size = this.sheepBlockSize;
        const goldColor = '#FFD700';
        for (let i = 0; i < 3; i++) {
            const angle = (Date.now() / 1000 + i * 2) % (Math.PI * 2);
            const ox = Math.cos(angle) * size * 3;
            const oy = Math.sin(angle) * size * 2;
            // Pièce simple
            this.ctx.fillStyle = goldColor;
            this.ctx.fillRect(x + 8*size + ox, y + 4*size + oy, size*2, size*2);
            this.ctx.fillStyle = '#FFA500';
            this.ctx.fillRect(x + 8.5*size + ox, y + 4.5*size + oy, size, size);
        }
    }
    
    // Dessiner le mouton sur un canvas (pour le cache)
    drawSheepToCanvas(ctx, x, y, flying, hasGold) {
        const size = this.sheepBlockSize;
        const bodyColor = '#FFFFFF';
        
        // Corps du mouton (nuage)
        ctx.fillStyle = bodyColor;
        ctx.fillRect(x + 4*size, y + 2*size, 8*size, 6*size);
        ctx.fillRect(x + 2*size, y + 4*size, 4*size, 4*size);
        ctx.fillRect(x + 10*size, y + 4*size, 4*size, 4*size);
        
        // Tête (cercle blanc)
        ctx.fillRect(x + 12*size, y + 4*size, 4*size, 4*size);
        ctx.fillRect(x + 14*size, y + 2*size, 2*size, 2*size);
        
        // Yeux
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 13*size, y + 5*size, size, size);
        ctx.fillRect(x + 15*size, y + 5*size, size, size);
        
        // Pattes
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4*size, y + 8*size, 2*size, 4*size);
        ctx.fillRect(x + 8*size, y + 8*size, 2*size, 4*size);
        
        if (flying) {
            // Ailes (plumes angéliques)
            ctx.fillStyle = '#FFD700';
            // Aile gauche
            ctx.fillRect(x + size, y + 4*size, 3*size, size);
            ctx.fillRect(x, y + 5*size, 2*size, 2*size);
            // Aile droite
            ctx.fillRect(x + 12*size, y + 3*size, 3*size, size);
            ctx.fillRect(x + 14*size, y + 4*size, 2*size, 2*size);
            
            // Auréole
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 14*size, y + size, 4*size, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Obstacle en voxels
    drawVoxelObstacle(obstacle) {
        const size = this.blockSize;
        const x = obstacle.x;
        const y = obstacle.y;
        
        // Clé de cache basée sur l'icône (type d'obstacle)
        const cacheKey = obstacle.icon;
        
        // Vérifier si l'obstacle est déjà en cache
        if (!this.obstacleCache.has(cacheKey)) {
            // Créer un canvas pour cet obstacle
            const canvas = document.createElement('canvas');
            canvas.width = size * 6;
            canvas.height = size * 6;
            const ctx = canvas.getContext('2d');
            
            this.drawObstacleShape(ctx, 0, 0, obstacle.icon, obstacle.color || '#888888');
            this.obstacleCache.set(cacheKey, canvas);
        }
        
        // Dessiner l'obstacle depuis le cache
        const cachedObstacle = this.obstacleCache.get(cacheKey);
        this.ctx.drawImage(cachedObstacle, x, y, size * 6, size * 6);
    }
    
    // Dessiner la forme de l'obstacle sur un canvas (pour le cache)
    drawObstacleShape(ctx, x, y, icon, color) {
        const s = this.blockSize; // Taille de bloc
        
        // Dessiner selon l'icône (formes reconnaissables style LEGO)
        switch(icon) {
            case '♿': // Wheelchair - Fauteuil roulant détaillé
                // Siège bleu
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 2*s, y + 2*s, 3*s, 2*s);
                // Dossier
                ctx.fillRect(x + 2*s, y + s, s, 2*s);
                // Roues noires
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2*s, y + 4*s, s, s);
                ctx.fillRect(x + 4*s, y + 4*s, s, s);
                // Rayons des roues (gris)
                ctx.fillStyle = '#666666';
                ctx.fillRect(x + 2.5*s, y + 4.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4.5*s, y + 4.5*s, 0.5*s, 0.5*s);
                break;
                
            case '🚗': // Car - Voiture détaillée
                // Carrosserie rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + s, y + 2*s, 4*s, 2*s);
                // Toit
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, s);
                // Vitres bleues
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 2*s, y + 1.7*s, s, 0.8*s);
                ctx.fillRect(x + 3.5*s, y + 1.7*s, s, 0.8*s);
                // Roues noires
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 1.5*s, y + 4*s, s, s);
                ctx.fillRect(x + 3.5*s, y + 4*s, s, s);
                // Phares jaunes
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 5*s, y + 2.5*s, 0.5*s, 0.5*s);
                break;
                
            case '⚰️': // Coffin - Cercueil détaillé
                // Corps marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 1.5*s, y + s, 3*s, 4*s);
                // Haut plus large
                ctx.fillRect(x + s, y + 1.5*s, 4*s, 2*s);
                // Croix dorée
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.5*s, y + 2*s, s, 2*s);
                ctx.fillRect(x + 2*s, y + 2.5*s, 2*s, s);
                break;
                
            case '🏦': // Safe - Coffre-fort détaillé
                // Corps gris métallique
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + s, y + s, 4*s, 4*s);
                // Porte plus claire
                ctx.fillStyle = '#A9A9A9';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                // Poignée dorée
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 4*s, y + 2.5*s, s, s);
                // Cadran
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                break;
                
            case '🏠': // House - Maison détaillée
                // Murs marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + s, y + 2*s, 4*s, 3*s);
                // Toit rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 0.5*s, y + s, 5*s, 1.5*s);
                // Porte marron foncé
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 2.5*s, y + 3.5*s, s, 1.5*s);
                // Fenêtre jaune
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.5*s, y + 2.5*s, s, s);
                break;
                
            case '🐺': // Wolf - Loup détaillé
                // Corps gris
                ctx.fillStyle = '#808080';
                ctx.fillRect(x + s, y + 2*s, 4*s, 2*s);
                // Tête
                ctx.fillRect(x + 4*s, y + s, 2*s, 2*s);
                // Oreilles pointues
                ctx.fillRect(x + 4*s, y + 0.5*s, 0.7*s, s);
                ctx.fillRect(x + 5.3*s, y + 0.5*s, 0.7*s, s);
                // Yeux rouges
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 4.5*s, y + 1.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 5.5*s, y + 1.5*s, 0.5*s, 0.5*s);
                // Pattes
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 1.5*s, y + 4*s, 0.7*s, s);
                ctx.fillRect(x + 2.5*s, y + 4*s, 0.7*s, s);
                ctx.fillRect(x + 3.5*s, y + 4*s, 0.7*s, s);
                break;
                
            case '🐑': // Sheep - Mouton noir
                // Corps noir
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + s, y + 2*s, 4*s, 2*s);
                // Tête noire
                ctx.fillRect(x + 4*s, y + 1.5*s, 1.5*s, 1.5*s);
                // Yeux blancs
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 4.5*s, y + 2*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 5*s, y + 2*s, 0.4*s, 0.4*s);
                // Pattes noires
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 1.5*s, y + 4*s, 0.7*s, s);
                ctx.fillRect(x + 3.5*s, y + 4*s, 0.7*s, s);
                break;
                
            case '💼': // Briefcase - Mallette de travail
                // Corps noir
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + s, y + 2*s, 4*s, 3*s);
                // Poignée grise
                ctx.fillStyle = '#808080';
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 0.7*s);
                // Serrure dorée
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.8*s, y + 3*s, 0.5*s, 0.5*s);
                break;
                
            case '💔': // Broken heart - Coeur brisé
                // Coeur rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 1.5*s, y + 2*s, 1.5*s, 2*s);
                ctx.fillRect(x + 3*s, y + 2*s, 1.5*s, 2*s);
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, s);
                ctx.fillRect(x + 2.5*s, y + 4*s, s, s);
                // Fissure noire
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2.8*s, y + 1.5*s, 0.4*s, 3*s);
                break;
                
            case '💀': // Skull - Crâne détaillé
                // Crâne blanc
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1.5*s, y + s, 3*s, 3*s);
                // Yeux noirs
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2*s, y + 1.5*s, s, s);
                ctx.fillRect(x + 3.5*s, y + 1.5*s, s, s);
                // Nez
                ctx.fillRect(x + 2.8*s, y + 2.5*s, 0.7*s, 0.7*s);
                // Mâchoire
                ctx.fillRect(x + 2*s, y + 3.5*s, 2.5*s, 0.7*s);
                break;
                
            case '🎗️': // Reminder ribbon - Ruban
                // Ruban rose
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 2*s, y + s, 2*s, 3*s);
                ctx.fillRect(x + s, y + 2*s, 4*s, s);
                // Boucle
                ctx.fillRect(x + 2.5*s, y + 0.5*s, s, s);
                // Queues
                ctx.fillRect(x + 1.5*s, y + 4*s, s, s);
                ctx.fillRect(x + 3.5*s, y + 4*s, s, s);
                break;
                
            case '☢️': // Radiation - Symbole radioactif
                // Centre jaune
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                // Branches noires
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2.5*s, y + s, s, 1.5*s);
                ctx.fillRect(x + s, y + 3.5*s, 1.5*s, s);
                ctx.fillRect(x + 3.5*s, y + 3.5*s, 1.5*s, s);
                break;
                
            case '☄️': // Meteor - Météorite
                // Roche grise
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2*s);
                ctx.fillRect(x + 1.5*s, y + 2.5*s, s, s);
                ctx.fillRect(x + 4*s, y + 2.5*s, s, s);
                // Flammes orange/rouge
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(x + s, y + 3*s, 0.7*s, s);
                ctx.fillRect(x + 1.5*s, y + 4*s, 0.7*s, s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 0.5*s, y + 3.5*s, 0.7*s, 0.7*s);
                break;
                
            case '⏰': // Clock - Horloge
                // Cadran blanc
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                // Bordure noire
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                // Aiguilles
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 3*s, y + 2*s, 0.3*s, 1.5*s);
                ctx.fillRect(x + 3*s, y + 3*s, s, 0.3*s);
                break;
                
            case '😡': // Angry face - Visage en colère
                // Face rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                // Yeux noirs
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2*s, y + 2*s, 0.7*s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 2*s, 0.7*s, 0.7*s);
                // Sourcils froncés
                ctx.fillRect(x + 2*s, y + 1.8*s, 0.7*s, 0.3*s);
                ctx.fillRect(x + 3.5*s, y + 1.8*s, 0.7*s, 0.3*s);
                // Bouche
                ctx.fillRect(x + 2.5*s, y + 3.5*s, 1.5*s, 0.5*s);
                break;
                
            case '🌀': // Cyclone - Spirale
                // Spirale bleue
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                ctx.fillRect(x + 2*s, y + 2*s, 0.7*s, 2*s);
                ctx.fillRect(x + 3.5*s, y + 2*s, 0.7*s, 2*s);
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 0.7*s);
                ctx.fillRect(x + 2*s, y + 3.5*s, 2*s, 0.7*s);
                break;
                
            case '💰': // Money bag - Sac d'argent
                // Sac vert
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 3*s);
                // Haut resserré
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, s);
                // Symbole $ jaune
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.8*s, y + 2.5*s, 0.7*s, 2*s);
                ctx.fillRect(x + 2.5*s, y + 2.8*s, 1.3*s, 0.4*s);
                ctx.fillRect(x + 2.5*s, y + 3.8*s, 1.3*s, 0.4*s);
                break;
                
            case '👄': // Lips - Lèvres
                // Lèvres rouges
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + s, y + 2.5*s, 4*s, s);
                ctx.fillRect(x + 1.5*s, y + 2*s, s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 2*s, s, 0.7*s);
                ctx.fillRect(x + 1.5*s, y + 3.5*s, s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 3.5*s, s, 0.7*s);
                break;
                
            case '🤝': // Handshake - Poignée de main
                // Main gauche beige
                ctx.fillStyle = '#FFDAB9';
                ctx.fillRect(x + s, y + 2.5*s, 2*s, s);
                // Main droite beige
                ctx.fillRect(x + 3*s, y + 2.5*s, 2*s, s);
                // Doigts
                ctx.fillRect(x + 2.5*s, y + 2*s, s, 0.7*s);
                ctx.fillRect(x + 2.5*s, y + 3.5*s, s, 0.7*s);
                break;
                
            case '👥': // Busts - Groupe de personnes
                // Personne 1
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + s, y + 2*s, 1.5*s, 2*s);
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 0.7*s, 0.7*s);
                // Personne 2
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2.5*s, y + 2*s, 1.5*s, 2*s);
                ctx.fillRect(x + 3*s, y + 1.5*s, 0.7*s, 0.7*s);
                // Personne 3
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 4*s, y + 2*s, 1.5*s, 2*s);
                ctx.fillRect(x + 4.5*s, y + 1.5*s, 0.7*s, 0.7*s);
                break;
                
            case '⛓️': // Chains - Chaînes
                // Chaîne grise
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 2*s, y + s, s, s);
                ctx.fillRect(x + 2*s, y + 2.5*s, s, s);
                ctx.fillRect(x + 2*s, y + 4*s, s, s);
                ctx.fillRect(x + 2.5*s, y + 1.7*s, 0.7*s, s);
                ctx.fillRect(x + 2.5*s, y + 3.3*s, 0.7*s, s);
                break;
                
            case '🏭': // Factory - Usine
                // Bâtiment gris
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + s, y + 2*s, 4*s, 3*s);
                // Cheminées
                ctx.fillRect(x + 1.5*s, y + 0.5*s, 0.7*s, 1.5*s);
                ctx.fillRect(x + 3*s, y + s, 0.7*s, s);
                ctx.fillRect(x + 4*s, y + 0.5*s, 0.7*s, 1.5*s);
                // Fumée grise
                ctx.fillStyle = '#A9A9A9';
                ctx.fillRect(x + 1.5*s, y + 0.2*s, 0.7*s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 0.2*s, 0.7*s, 0.5*s);
                break;
                
            case '💧': // Water drop - Goutte d'eau
                // Goutte bleue
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 2.5*s, y + 2*s, s, 2*s);
                ctx.fillRect(x + 2*s, y + 2.5*s, 2*s, 1.5*s);
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 0.7*s);
                // Reflet blanc
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.8*s, y + 2.3*s, 0.4*s, 0.4*s);
                break;
                
            case '🐟': // Fish - Poisson (carburant niveau 1)
                // Corps orange vif avec écailles
                ctx.fillStyle = '#FF8C00';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 2*s);
                // Tête arrondie
                ctx.fillRect(x + 4*s, y + 2.5*s, 0.8*s, s);
                // Queue en éventail
                ctx.fillRect(x + 0.5*s, y + 1.5*s, s, 3*s);
                ctx.fillRect(x + s, y + 2*s, 0.5*s, 2*s);
                // Nageoires dorsale et ventrale
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 0.5*s);
                ctx.fillRect(x + 2.5*s, y + 4*s, s, 0.5*s);
                // Oeil noir brillant
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 4*s, y + 2.7*s, 0.4*s, 0.4*s);
                // Reflet blanc dans l'oeil
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 4.1*s, y + 2.8*s, 0.2*s, 0.2*s);
                // Écailles détaillées
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2*s, y + 2.5*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 2.8*s, y + 2.8*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.5*s, y + 2.5*s, 0.3*s, 0.3*s);
                break;
                
            case '🍒': // Cherry - Cerise (carburant niveau 2)
                // Deux cerises rouges brillantes
                ctx.fillStyle = '#DC143C';
                // Cerise gauche
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 1.5*s, 1.5*s);
                ctx.fillRect(x + 1.8*s, y + 2.2*s, s, 0.3*s);
                // Cerise droite
                ctx.fillRect(x + 3.5*s, y + 3*s, 1.5*s, 1.5*s);
                ctx.fillRect(x + 3.8*s, y + 2.7*s, s, 0.3*s);
                // Reflets brillants sur les cerises
                ctx.fillStyle = '#FF6B9D';
                ctx.fillRect(x + 2*s, y + 2.7*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 3.2*s, 0.5*s, 0.5*s);
                // Tiges vertes qui se rejoignent
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 2.2*s, y + 1.5*s, 0.3*s, s);
                ctx.fillRect(x + 4.2*s, y + 2*s, 0.3*s, 0.7*s);
                // Point de jonction des tiges
                ctx.fillRect(x + 2.5*s, y + 1.2*s, s, 0.3*s);
                // Feuille verte
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(x + 3.2*s, y + 1*s, 0.8*s, 0.5*s);
                ctx.fillRect(x + 3.4*s, y + 0.8*s, 0.4*s, 0.2*s);
                break;
                
            case '💎': // Diamond - Diamant (carburant niveau 3)
                // Diamant cyan brillant avec facettes
                ctx.fillStyle = '#00CED1';
                // Partie supérieure (pyramide inversée)
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 0.5*s);
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 0.5*s);
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 3*s, 0.5*s);
                // Partie centrale (plus large)
                ctx.fillRect(x + s, y + 3*s, 4*s, 0.5*s);
                // Partie inférieure (pyramide)
                ctx.fillRect(x + 1.5*s, y + 3.5*s, 3*s, 0.5*s);
                ctx.fillRect(x + 2*s, y + 4*s, 2*s, 0.5*s);
                ctx.fillRect(x + 2.5*s, y + 4.5*s, s, 0.5*s);
                // Facettes sombres (profondeur)
                ctx.fillStyle = '#008B8B';
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 2.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 2.5*s, y + 3.5*s, 0.5*s, 0.5*s);
                // Reflets blancs brillants
                ctx.fillStyle = '#E0FFFF';
                ctx.fillRect(x + 2.8*s, y + 2*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 3.5*s, y + 2.7*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 2*s, y + 3.2*s, 0.3*s, 0.3*s);
                break;
                
            case '🍃': // Leaf - Feuille (carburant niveau 4)
                // Feuille verte avec nervures
                ctx.fillStyle = '#32CD32';
                // Corps de la feuille (forme ovale)
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, 0.5*s);
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, s);
                ctx.fillRect(x + 1.8*s, y + 3*s, 2.5*s, s);
                ctx.fillRect(x + 2.2*s, y + 4*s, 1.5*s, 0.5*s);
                // Pointe de la feuille
                ctx.fillRect(x + 2.8*s, y + 4.5*s, 0.5*s, 0.3*s);
                // Nervure centrale sombre
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 2.9*s, y + 1.5*s, 0.3*s, 3*s);
                // Nervures latérales
                ctx.fillRect(x + 2.2*s, y + 2.3*s, 0.7*s, 0.2*s);
                ctx.fillRect(x + 3.2*s, y + 2.3*s, 0.7*s, 0.2*s);
                ctx.fillRect(x + 2.2*s, y + 3*s, 0.7*s, 0.2*s);
                ctx.fillRect(x + 3.2*s, y + 3*s, 0.7*s, 0.2*s);
                // Reflet lumineux
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(x + 2.5*s, y + 2.2*s, 0.5*s, 0.5*s);
                break;
                
            case '🌟': // Star - Étoile (carburant niveau 5)
                // Étoile dorée brillante à 5 branches
                ctx.fillStyle = '#FFD700';
                // Centre
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                // Branche du haut
                ctx.fillRect(x + 2.7*s, y + 1*s, 0.6*s, 1.5*s);
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 0.5*s);
                // Branche haut-droite
                ctx.fillRect(x + 3.5*s, y + 1.5*s, s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 1.8*s, 0.5*s, 0.5*s);
                // Branche bas-droite
                ctx.fillRect(x + 3.5*s, y + 3.5*s, s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 3.8*s, 0.5*s, 0.5*s);
                // Branche bas-gauche
                ctx.fillRect(x + 1.5*s, y + 3.5*s, s, 0.5*s);
                ctx.fillRect(x + 1.2*s, y + 3.8*s, 0.5*s, 0.5*s);
                // Branche haut-gauche
                ctx.fillRect(x + 1.5*s, y + 1.5*s, s, 0.5*s);
                ctx.fillRect(x + 1.2*s, y + 1.8*s, 0.5*s, 0.5*s);
                // Contour orange pour effet lumineux
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 2.3*s, y + 2.3*s, 0.2*s, 1.4*s);
                ctx.fillRect(x + 3.5*s, y + 2.3*s, 0.2*s, 1.4*s);
                ctx.fillRect(x + 2.3*s, y + 2.3*s, 1.4*s, 0.2*s);
                ctx.fillRect(x + 2.3*s, y + 3.5*s, 1.4*s, 0.2*s);
                // Centre blanc brillant
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.8*s, y + 2.8*s, 0.4*s, 0.4*s);
                break;
                
            case '🐠': // Tropical Fish - Poisson tropical (carburant niveau 6)
                // Poisson exotique multicolore
                ctx.fillStyle = '#FF69B4';
                // Corps rose vif
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 2*s);
                ctx.fillRect(x + 4*s, y + 2.5*s, 0.8*s, s);
                // Rayures bleues et jaunes
                ctx.fillStyle = '#1E90FF';
                ctx.fillRect(x + 2*s, y + 2*s, 0.4*s, 2*s);
                ctx.fillRect(x + 3.2*s, y + 2*s, 0.4*s, 2*s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.6*s, y + 2*s, 0.4*s, 2*s);
                // Queue en éventail multicolore
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 0.5*s, y + 1.5*s, s, 3*s);
                ctx.fillStyle = '#1E90FF';
                ctx.fillRect(x + 0.8*s, y + 2*s, 0.7*s, 0.5*s);
                ctx.fillRect(x + 0.8*s, y + 3.5*s, 0.7*s, 0.5*s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 0.8*s, y + 2.7*s, 0.7*s, 0.6*s);
                // Nageoires dorsale et ventrale colorées
                ctx.fillStyle = '#FF1493';
                ctx.fillRect(x + 2.5*s, y + 1.2*s, s, 0.5*s);
                ctx.fillRect(x + 2.5*s, y + 4.3*s, s, 0.5*s);
                // Oeil noir avec reflet
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 4*s, y + 2.7*s, 0.4*s, 0.4*s);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 4.1*s, y + 2.8*s, 0.2*s, 0.2*s);
                break;
                
            case '🔋': // Battery - Batterie (carburant niveau 7)
                // Batterie verte chargée
                ctx.fillStyle = '#2F4F4F';
                // Corps de la batterie (rectangle)
                ctx.fillRect(x + 1.8*s, y + 2*s, 2.5*s, 3*s);
                // Borne positive en haut
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 0.5*s);
                // Contour métallique
                ctx.strokeStyle = '#696969';
                ctx.lineWidth = 0.2*s;
                ctx.strokeRect(x + 1.8*s, y + 2*s, 2.5*s, 3*s);
                // Niveau de charge (barres vertes)
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(x + 2*s, y + 4.5*s, 2*s, 0.3*s);
                ctx.fillRect(x + 2*s, y + 4*s, 2*s, 0.3*s);
                ctx.fillRect(x + 2*s, y + 3.5*s, 2*s, 0.3*s);
                ctx.fillRect(x + 2*s, y + 3*s, 2*s, 0.3*s);
                // Symbole + et -
                ctx.fillStyle = '#FFFFFF';
                // Plus
                ctx.fillRect(x + 2.7*s, y + 2.3*s, 0.6*s, 0.15*s);
                ctx.fillRect(x + 2.93*s, y + 2.07*s, 0.15*s, 0.6*s);
                // Moins
                ctx.fillRect(x + 2.7*s, y + 4.3*s, 0.6*s, 0.15*s);
                // Éclat d'énergie (éclair jaune)
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + 3.2*s, y + 2.8*s, 0.3*s, 0.5*s);
                ctx.fillRect(x + 3.4*s, y + 3*s, 0.3*s, 0.5*s);
                ctx.fillRect(x + 2.9*s, y + 3.3*s, 0.3*s, 0.5*s);
                break;
                
            case '✨': // Sparkles - Étincelles (carburant niveau 8)
                // Effet d'étincelles magiques multicolores
                ctx.fillStyle = '#FFD700';
                // Grande étoile centrale
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                ctx.fillRect(x + 2.7*s, y + 2*s, 0.6*s, 0.5*s);
                ctx.fillRect(x + 2.7*s, y + 3.5*s, 0.6*s, 0.5*s);
                ctx.fillRect(x + 2*s, y + 2.7*s, 0.5*s, 0.6*s);
                ctx.fillRect(x + 3.5*s, y + 2.7*s, 0.5*s, 0.6*s);
                // Petites étoiles autour (rose)
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 1.2*s, y + 1.5*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 4.4*s, y + 1.8*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 1.5*s, y + 4.2*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 4.2*s, y + 4.5*s, 0.4*s, 0.4*s);
                // Étoiles cyan
                ctx.fillStyle = '#00FFFF';
                ctx.fillRect(x + 0.8*s, y + 2.8*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 4.9*s, y + 3*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 2.2*s, y + 1*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.5*s, y + 5*s, 0.3*s, 0.3*s);
                // Points blancs brillants
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.8*s, y + 2.8*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 1.5*s, y + 2*s, 0.2*s, 0.2*s);
                ctx.fillRect(x + 4*s, y + 3.5*s, 0.2*s, 0.2*s);
                // Rayons dorés
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 3*s, y + 1.5*s, 0.15*s, 0.5*s);
                ctx.fillRect(x + 3*s, y + 4*s, 0.15*s, 0.5*s);
                ctx.fillRect(x + 1.5*s, y + 3*s, 0.5*s, 0.15*s);
                ctx.fillRect(x + 4*s, y + 3*s, 0.5*s, 0.15*s);
                break;
                
            // ========== BOSS ==========
            case '🐉': // Dragon BOSS - Grand et détaillé
                // Corps rouge puissant
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(x + s, y + 2*s, 4*s, 2*s);
                // Tête avec cornes
                ctx.fillRect(x + 4.5*s, y + s, 1.5*s, 2*s);
                // Cornes noires
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 4.5*s, y + 0.5*s, 0.5*s, s);
                ctx.fillRect(x + 5.5*s, y + 0.5*s, 0.5*s, s);
                // Yeux jaunes brillants
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 4.8*s, y + 1.5*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 5.5*s, y + 1.5*s, 0.4*s, 0.4*s);
                // Ailes rouges
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 0.5*s, y + s, 1.5*s, 2*s);
                ctx.fillRect(x + 2*s, y + 0.5*s, s, 1.5*s);
                // Flammes de la bouche
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 6*s, y + 2*s, 0.5*s, 0.5*s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 6.5*s, y + 2*s, 0.3*s, 0.3*s);
                // Queue avec pointe
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(x + 0.5*s, y + 3*s, 1.5*s, s);
                // Écailles (détails)
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(x + 2*s, y + 2.3*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3*s, y + 2.3*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 2.3*s, 0.5*s, 0.5*s);
                break;
                
            case '🛸': // OVNI BOSS - Vaisseau spatial
                // Soucoupe métallique
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + s, y + 2.5*s, 4*s, s);
                // Dôme transparent
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, s);
                // Cockpit
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 2.5*s, y + 1.8*s, s, 0.7*s);
                // Lumières vertes clignotantes
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(x + 1.2*s, y + 2.8*s, 0.5*s, 0.3*s);
                ctx.fillRect(x + 3*s, y + 2.8*s, 0.5*s, 0.3*s);
                ctx.fillRect(x + 4.3*s, y + 2.8*s, 0.5*s, 0.3*s);
                // Propulseurs jaunes
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.5*s, y + 3.5*s, 0.5*s, 0.7*s);
                ctx.fillRect(x + 2.8*s, y + 3.5*s, 0.5*s, 0.7*s);
                ctx.fillRect(x + 4*s, y + 3.5*s, 0.5*s, 0.7*s);
                // Rayons lumineux sous l'OVNI
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.fillRect(x + 2*s, y + 3.5*s, 2*s, s);
                // Antennes
                ctx.fillStyle = '#A9A9A9';
                ctx.fillRect(x + 2*s, y + s, 0.3*s, 0.7*s);
                ctx.fillRect(x + 3.7*s, y + s, 0.3*s, 0.7*s);
                break;
                
            case '🦈': // Requin BOSS - Prédateur marin
                // Corps gris menaçant
                ctx.fillStyle = '#708090';
                ctx.fillRect(x + s, y + 2*s, 4*s, 2*s);
                // Tête avec museau
                ctx.fillRect(x + 4.5*s, y + 2.3*s, 1.5*s, 1.5*s);
                // Nageoire dorsale
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 2.5*s, y + s, s, 1.5*s);
                // Nageoires latérales
                ctx.fillRect(x + 1.5*s, y + 3.5*s, s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 3.5*s, s, 0.7*s);
                // Queue
                ctx.fillRect(x + 0.3*s, y + 1.5*s, s, 2*s);
                ctx.fillRect(x + 0.3*s, y + s, 0.7*s, s);
                // Oeil noir
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 4.7*s, y + 2.5*s, 0.4*s, 0.4*s);
                // Dents blanches
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 5.5*s, y + 3*s, 0.3*s, 0.5*s);
                ctx.fillRect(x + 5.8*s, y + 3*s, 0.3*s, 0.5*s);
                ctx.fillRect(x + 6.1*s, y + 3*s, 0.3*s, 0.5*s);
                // Ventre plus clair
                ctx.fillStyle = '#A9A9A9';
                ctx.fillRect(x + 2*s, y + 3.2*s, 2*s, 0.8*s);
                break;
                
            // ========== PROJECTILES DES BOSS ==========
            case '🔥': // Flamme du dragon
                // Flamme orange vif
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2*s);
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, s);
                // Centre jaune
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                // Étincelles
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 1.8*s, y + 2.3*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 4*s, y + 2.7*s, 0.4*s, 0.4*s);
                break;
                
            case '⚡': // Éclair de l'OVNI
                // Éclair jaune électrique
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.5*s, y + s, s, s);
                ctx.fillRect(x + 2*s, y + 2*s, s, s);
                ctx.fillRect(x + 2.5*s, y + 3*s, s, s);
                ctx.fillRect(x + 2*s, y + 4*s, s, s);
                // Lueur blanche
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.7*s, y + 2.2*s, 0.6*s, 0.6*s);
                break;
                
            case '💧': // Jet d'eau du requin
                // Goutte bleue
                ctx.fillStyle = '#4682B4';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2*s);
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, s);
                // Reflet blanc
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.8*s, y + 2.3*s, 0.5*s, 0.5*s);
                // Éclaboussures
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 1.8*s, y + 2.5*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 4*s, y + 2.8*s, 0.4*s, 0.4*s);
                break;
                
            // ========== AUTRES BOSS ==========
            case '🐋': // Baleine BOSS
                // Corps bleu massif
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 0.5*s, y + 2*s, 5*s, 2.5*s);
                // Tête arrondie
                ctx.fillRect(x + 5*s, y + 2.3*s, s, 2*s);
                // Nageoire caudale
                ctx.fillRect(x, y + 1.5*s, 1.5*s, s);
                ctx.fillRect(x, y + 3.5*s, 1.5*s, s);
                // Nageoire dorsale
                ctx.fillStyle = '#1E90FF';
                ctx.fillRect(x + 2.5*s, y + 1.2*s, s, s);
                // Ventre blanc
                ctx.fillStyle = '#F0F8FF';
                ctx.fillRect(x + 1.5*s, y + 3.5*s, 3*s, s);
                // Œil
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 5*s, y + 2.8*s, 0.4*s, 0.4*s);
                // Jet d'eau
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 2.5*s, y + 0.5*s, 0.5*s, s);
                break;
                
            case '👾': // Pacman BOSS
                // Corps jaune
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                ctx.fillRect(x + 2*s, y + s, 2*s, s);
                ctx.fillRect(x + 2*s, y + 4.5*s, 2*s, s);
                // Bouche ouverte
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 4*s, y + 2.5*s, s, s);
                // Yeux
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(x + 2.5*s, y + 2*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3.5*s, y + 2*s, 0.5*s, 0.5*s);
                break;
                
            case '🚢': // Paquebot BOSS
                // Coque bleue
                ctx.fillStyle = '#0055A4';
                ctx.fillRect(x + 0.5*s, y + 3*s, 5*s, 1.5*s);
                // Superstructure blanche
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, s);
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, 0.7*s);
                // Cheminées rouges
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2*s, y + 0.5*s, 0.7*s, s);
                ctx.fillRect(x + 3.3*s, y + 0.8*s, 0.7*s, 0.7*s);
                // Hublots
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 2*s, y + 2.3*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3*s, y + 2.3*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 2.3*s, 0.5*s, 0.5*s);
                break;
                
            case '🤖': // Robot BOSS
                // Corps métallique
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2.5*s);
                // Tête
                ctx.fillRect(x + 2.3*s, y + 1*s, 1.5*s, s);
                // Yeux rouges
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 2.5*s, y + 1.3*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 3.3*s, y + 1.3*s, 0.4*s, 0.4*s);
                // Antenne
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 3*s, y + 0.5*s, 0.3*s, 0.7*s);
                // Bras
                ctx.fillStyle = '#A9A9A9';
                ctx.fillRect(x + 1.3*s, y + 2.5*s, 0.7*s, 1.5*s);
                ctx.fillRect(x + 4*s, y + 2.5*s, 0.7*s, 1.5*s);
                // Jambes
                ctx.fillRect(x + 2.3*s, y + 4.5*s, 0.7*s, s);
                ctx.fillRect(x + 3.3*s, y + 4.5*s, 0.7*s, s);
                break;
                
            case '👽': // Alien BOSS
                // Tête verte
                ctx.fillStyle = '#00FF7F';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 2*s);
                ctx.fillRect(x + 2*s, y + s, 2*s, s);
                // Grands yeux noirs
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2*s, y + 2*s, s, s);
                ctx.fillRect(x + 3*s, y + 2*s, s, s);
                // Corps fin
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(x + 2.3*s, y + 3.5*s, 1.5*s, s);
                // Bras fins
                ctx.fillRect(x + 1.5*s, y + 3.8*s, 0.7*s, s);
                ctx.fillRect(x + 3.8*s, y + 3.8*s, 0.7*s, s);
                break;
                
            case '👹': // Monstre BOSS
                // Corps rouge
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 2.5*s);
                // Tête avec cornes
                ctx.fillRect(x + 2*s, y + s, 2*s, s);
                // Cornes noires
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 1.8*s, y + 0.5*s, 0.7*s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 0.5*s, 0.7*s, 0.7*s);
                // Yeux jaunes féroces
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + 2.3*s, y + 1.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3.2*s, y + 1.5*s, 0.5*s, 0.5*s);
                // Crocs blancs
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.3*s, y + 2.3*s, 0.4*s, 0.7*s);
                ctx.fillRect(x + 3.3*s, y + 2.3*s, 0.4*s, 0.7*s);
                // Griffes
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 1.3*s, y + 3*s, 0.5*s, s);
                ctx.fillRect(x + 4.2*s, y + 3*s, 0.5*s, s);
                break;
                
            // ========== OBSTACLES MIDDLE ==========
            case '☁️': // Nuage
                // Forme de nuage blanc
                ctx.fillStyle = '#F0F8FF';
                ctx.fillRect(x + s, y + 2.5*s, 4*s, s);
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, s);
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, s);
                // Ombre légère
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(x + 1.5*s, y + 3.3*s, 3*s, 0.3*s);
                break;
                
            case '💨': // Vent
                // Lignes de vent gris
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + s, y + 2*s, 3*s, 0.5*s);
                ctx.fillRect(x + 1.5*s, y + 2.7*s, 3*s, 0.5*s);
                ctx.fillRect(x + 0.5*s, y + 3.4*s, 3*s, 0.5*s);
                break;
                
            case '❓': // Question
                // Point d'interrogation
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.5*s, y + s, s, 0.7*s);
                ctx.fillRect(x + 3*s, y + 1.7*s, 0.7*s, s);
                ctx.fillRect(x + 2.5*s, y + 2.7*s, s, s);
                ctx.fillRect(x + 2.5*s, y + 4*s, s, 0.7*s);
                break;
                
            case '👻': // Fantôme
                // Corps blanc fantomatique
                ctx.fillStyle = '#F0F8FF';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                ctx.fillRect(x + 2*s, y + s, 2*s, s);
                // Yeux noirs
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2.3*s, y + 2*s, 0.5*s, 0.7*s);
                ctx.fillRect(x + 3.2*s, y + 2*s, 0.5*s, 0.7*s);
                // Queue ondulée
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(x + 2*s, y + 4.5*s, 0.7*s, 0.7*s);
                ctx.fillRect(x + 3.3*s, y + 4.5*s, 0.7*s, 0.7*s);
                break;
                
            case '🦅': // Aigle
                // Corps marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 1.5*s);
                // Tête blanche
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 3.5*s, y + 1.8*s, s, s);
                // Bec jaune
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 4.5*s, y + 2.3*s, 0.5*s, 0.5*s);
                // Ailes déployées marron
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 0.5*s, y + 2.3*s, 2*s, s);
                ctx.fillRect(x + 4*s, y + 2.3*s, 2*s, s);
                // Œil noir
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 4*s, y + 2.2*s, 0.3*s, 0.3*s);
                break;
                
            // ========== ARMES ==========
            case '⚔️': // Épée
                // Lame argentée
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 2.8*s, y + 0.5*s, 0.5*s, 4*s);
                // Garde dorée
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2*s, y + 3.5*s, 2*s, 0.5*s);
                // Poignée marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2.8*s, y + 4*s, 0.5*s, 1.5*s);
                // Pommeau doré
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.5*s, y + 5.5*s, s, 0.5*s);
                break;
                
            case '🔫': // Pistolet laser
                // Corps noir
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 3*s, s);
                // Canon
                ctx.fillRect(x + 4.5*s, y + 2.7*s, s, 0.7*s);
                // Détails verts
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(x + 2*s, y + 2.7*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3*s, y + 2.7*s, 0.5*s, 0.5*s);
                // Poignée grise
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 2*s, y + 3.5*s, s, s);
                break;
                
            case '🥅': // Filet
                // Structure bleue
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + s, y + s, 0.3*s, 4*s);
                ctx.fillRect(x + 4.7*s, y + s, 0.3*s, 4*s);
                ctx.fillRect(x + s, y + s, 4*s, 0.3*s);
                ctx.fillRect(x + s, y + 4.7*s, 4*s, 0.3*s);
                // Mailles du filet
                ctx.fillStyle = '#87CEEB';
                for(let i = 0; i < 4; i++) {
                    ctx.fillRect(x + (1.5 + i)*s, y + 1.5*s, 0.2*s, 3*s);
                    ctx.fillRect(x + 1.5*s, y + (1.5 + i)*s, 3*s, 0.2*s);
                }
                break;
                
            case '🛡️': // Bouclier
                // Bouclier doré
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.5*s, y + s, 3*s, 4*s);
                ctx.fillRect(x + 2.5*s, y + 5*s, s, s);
                // Croix argentée
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 2.8*s, y + 1.5*s, 0.5*s, 3*s);
                ctx.fillRect(x + 2*s, y + 2.8*s, 2*s, 0.5*s);
                break;
                
            case '🔨': // Marteau
                // Tête grise
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 1.5*s, y + s, 3*s, 1.5*s);
                // Manche marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2.8*s, y + 2.5*s, 0.5*s, 3*s);
                break;
                
            case '🔦': // Lampe torche/Rayon
                // Corps jaune
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2*s);
                // Lentille blanche
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 4*s, y + 2.5*s, s, s);
                // Rayon lumineux
                ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
                ctx.fillRect(x + 5*s, y + 2.7*s, 1.5*s, 0.7*s);
                break;
                
            // ========== 7 PÉCHÉS CAPITAUX ==========
            case '👑': // Orgueil (couronne)
                // Couronne dorée
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 1.5*s);
                // Pointes
                ctx.fillRect(x + 1.7*s, y + 1.3*s, 0.7*s, 0.7*s);
                ctx.fillRect(x + 2.8*s, y + s, 0.7*s, s);
                ctx.fillRect(x + 3.8*s, y + 1.3*s, 0.7*s, 0.7*s);
                // Joyaux rouges
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2*s, y + 2.3*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3*s, y + 2.3*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 2.3*s, 0.5*s, 0.5*s);
                break;
                
            case '💋': // Luxure (lèvres) - déjà fait mais améliorer
                // Lèvres rouges pulpeuses
                ctx.fillStyle = '#FF1493';
                ctx.fillRect(x + s, y + 2.5*s, 4*s, s);
                ctx.fillRect(x + 1.5*s, y + 2*s, s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 2*s, s, 0.7*s);
                ctx.fillRect(x + 1.5*s, y + 3.5*s, s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 3.5*s, s, 0.7*s);
                // Brillance
                ctx.fillStyle = '#FFB6C1';
                ctx.fillRect(x + 2*s, y + 2.7*s, 0.5*s, 0.5*s);
                break;
                
            case '👁️': // Envie (œil)
                // Blanc de l'œil
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 2*s);
                // Iris vert
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(x + 2.5*s, y + 2.3*s, s, 1.5*s);
                // Pupille noire
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2.7*s, y + 2.7*s, 0.7*s, 0.7*s);
                // Contour
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 1.5*s, y + 2*s, 3*s, 2*s);
                break;
                
            case '🍖': // Gourmandise (viande)
                // Os blanc
                ctx.fillStyle = '#F5DEB3';
                ctx.fillRect(x + 2*s, y + s, s, 0.7*s);
                ctx.fillRect(x + 2*s, y + 4.3*s, s, 0.7*s);
                // Viande rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 1.5*s, y + 1.7*s, 3*s, 2.7*s);
                // Gras blanc
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2*s, y + 2.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3.5*s, y + 3*s, 0.5*s, 0.5*s);
                break;
                
            case '💢': // Colère (symbole colère)
                // Croix rouge de colère
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 3*s);
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 3*s, s);
                // Contour noir épais
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.strokeRect(x + 2.5*s, y + 1.5*s, s, 3*s);
                ctx.strokeRect(x + 1.5*s, y + 2.5*s, 3*s, s);
                break;
                
            case '😴': // Paresse (endormi)
                // Visage jaune endormi
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                // Yeux fermés
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2*s, y + 2.5*s, s, 0.3*s);
                ctx.fillRect(x + 3.5*s, y + 2.5*s, s, 0.3*s);
                // Bouche bâillant
                ctx.fillRect(x + 2.5*s, y + 3.5*s, s, 0.5*s);
                // Zzz
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 4.5*s, y + s, 0.7*s, 0.3*s);
                ctx.fillRect(x + 5*s, y + 1.5*s, 0.5*s, 0.3*s);
                break;
                
            // ========== FUN OBSTACLES ==========
            case '🪩': // Boule disco
                // Sphère miroir
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                // Carrés colorés (reflets)
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 2*s, y + 2*s, 0.7*s, 0.7*s);
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(x + 3.3*s, y + 2*s, 0.7*s, 0.7*s);
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 2*s, y + 3.3*s, 0.7*s, 0.7*s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 3.3*s, y + 3.3*s, 0.7*s, 0.7*s);
                break;
                
            case '🍕': // Pizza
                // Base ronde beige
                ctx.fillStyle = '#F5DEB3';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                ctx.fillRect(x + 2*s, y + s, 2*s, s);
                ctx.fillRect(x + 2*s, y + 4.5*s, 2*s, s);
                // Sauce rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2*s);
                // Fromage jaune
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.3*s, y + 2.3*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3.2*s, y + 2.8*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 2.7*s, y + 3.5*s, 0.5*s, 0.5*s);
                break;
                
            case '🎪': // Chapiteau/Trampoline
                // Structure rouge et blanche
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + s, y + 2*s, 4*s, s);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1.5*s, y + 2*s, s, s);
                ctx.fillRect(x + 3.5*s, y + 2*s, s, s);
                // Toit pointu
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2*s, y + s, 2*s, s);
                ctx.fillRect(x + 2.5*s, y + 0.5*s, s, 0.7*s);
                break;
                
            case '🍌': // Banane
                // Banane jaune courbée
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, 0.7*s);
                ctx.fillRect(x + 2.3*s, y + 2.2*s, 1.7*s, 0.7*s);
                ctx.fillRect(x + 2.7*s, y + 2.9*s, 1.3*s, 0.7*s);
                ctx.fillRect(x + 3*s, y + 3.6*s, s, 0.7*s);
                // Extrémités vertes
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x + 2*s, y + 1.3*s, 0.5*s, 0.5*s);
                break;
                
            case '🧲': // Aimant
                // Fer à cheval rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 1.5*s, y + 2*s, s, 2.5*s);
                ctx.fillRect(x + 3.5*s, y + 2*s, s, 2.5*s);
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, s);
                // Pôles gris
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 1.5*s, y + 4.5*s, s, 0.5*s);
                ctx.fillRect(x + 3.5*s, y + 4.5*s, s, 0.5*s);
                // Lettres N/S
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1.8*s, y + 4.7*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.8*s, y + 4.7*s, 0.3*s, 0.3*s);
                break;
                
            case '🎈': // Ballon
                // Ballon rond
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 2*s, y + s, 2*s, 2.5*s);
                ctx.fillRect(x + 2.5*s, y + 0.5*s, s, s);
                // Ficelle
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2.8*s, y + 3.5*s, 0.3*s, 2*s);
                break;
                
            case '🌪️': // Tornade
                // Spirale grise
                ctx.fillStyle = '#708090';
                ctx.fillRect(x + 2*s, y + 0.5*s, 2*s, s);
                ctx.fillRect(x + 2.3*s, y + 1.5*s, 1.5*s, s);
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                ctx.fillRect(x + 2.7*s, y + 3.5*s, 0.7*s, s);
                ctx.fillRect(x + 2.8*s, y + 4.5*s, 0.5*s, s);
                break;
                
            case '🚀': // Fusée
                // Corps blanc
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 3*s);
                // Pointe rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2.5*s, y + 0.5*s, s, s);
                ctx.fillRect(x + 2.7*s, y, 0.7*s, 0.5*s);
                // Ailerons
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2*s, y + 4*s, 0.7*s, s);
                ctx.fillRect(x + 3.3*s, y + 4*s, 0.7*s, s);
                // Flammes
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(x + 2.7*s, y + 4.5*s, 0.7*s, s);
                break;
                
            // ========== OBSTACLES MER ==========
            case '🌊': // Vague
                // Vague bleue
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + s, y + 3*s, 4*s, s);
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 3*s, 0.7*s);
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 0.7*s);
                // Écume blanche
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2*s, y + 1.8*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3.5*s, y + 2.3*s, 0.5*s, 0.5*s);
                break;
                
            case '🪨': // Rocher
                // Rocher gris
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 2*s);
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, 0.7*s);
                // Ombres
                ctx.fillStyle = '#4B4B4B';
                ctx.fillRect(x + 2*s, y + 3.5*s, 2.5*s, 0.5*s);
                break;
                
            case '🪼': // Méduse
                // Tête rose transparente
                ctx.fillStyle = '#FFB6C1';
                ctx.fillRect(x + 2*s, y + 1.5*s, 2*s, 1.5*s);
                // Tentacules
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 2*s, y + 3*s, 0.3*s, 2*s);
                ctx.fillRect(x + 2.5*s, y + 3*s, 0.3*s, 2.5*s);
                ctx.fillRect(x + 3*s, y + 3*s, 0.3*s, 2*s);
                ctx.fillRect(x + 3.7*s, y + 3*s, 0.3*s, 2.3*s);
                break;
                
            case '🧜‍♀️': // Sirène
                // Corps beige
                ctx.fillStyle = '#FFDAB9';
                ctx.fillRect(x + 2.5*s, y + 2*s, s, 1.5*s);
                // Tête
                ctx.fillRect(x + 2.5*s, y + 1.3*s, s, 0.7*s);
                // Cheveux blonds
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.3*s, y + s, 1.5*s, 0.7*s);
                // Queue verte
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(x + 2.5*s, y + 3.5*s, s, 1.5*s);
                ctx.fillRect(x + 2*s, y + 5*s, 2*s, 0.7*s);
                break;
                
            case '💳': // Carte de crédit (dettes)
                // Carte bleue
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 2*s);
                // Bande magnétique noire
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 3*s, 0.5*s);
                // Puce dorée
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2*s, y + 3.3*s, 0.7*s, 0.5*s);
                break;
                
            case '🗡️': // Dague (trahison)
                // Lame argentée
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 2.8*s, y + 0.5*s, 0.5*s, 3.5*s);
                // Pointe
                ctx.fillRect(x + 2.8*s, y, 0.5*s, 0.5*s);
                // Garde noire
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2*s, y + 4*s, 2*s, 0.3*s);
                // Poignée marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2.8*s, y + 4.3*s, 0.5*s, 1.5*s);
                break;
                
            case '📦': // Boîte (addiction)
                // Boîte cartonnée marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 1.5*s, y + 2*s, 3*s, 2.5*s);
                // Scotch beige
                ctx.fillStyle = '#F5DEB3';
                ctx.fillRect(x + 2.8*s, y + 2*s, 0.5*s, 2.5*s);
                ctx.fillRect(x + 1.5*s, y + 3*s, 3*s, 0.5*s);
                // Ombre
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 1.5*s, y + 4*s, 3*s, 0.5*s);
                break;
                
            // ========== POWER-UPS SPIRITUELS ==========
            case '💪': // Courage - BRAS MUSCLÉ simple et clair
                // Avant-bras (partie du coude au poignet)
                ctx.fillStyle = '#FFDAB9';
                ctx.fillRect(x + 1*s, y + 3*s, 2.5*s, 1.2*s);
                
                // Biceps gonflé (gros muscle)
                ctx.fillStyle = '#F5DEB3';
                ctx.fillRect(x + 1.5*s, y + 1.8*s, 2*s, 1.8*s);
                // Ombre musculaire
                ctx.fillStyle = '#DEB887';
                ctx.fillRect(x + 2*s, y + 2.2*s, 0.3*s, 1*s);
                
                // Poing fermé (simple)
                ctx.fillStyle = '#FFDAB9';
                ctx.fillRect(x + 3.5*s, y + 2.8*s, 1.8*s, 1.5*s);
                // Jointures des doigts
                ctx.fillStyle = '#DEB887';
                ctx.fillRect(x + 3.8*s, y + 3*s, 0.3*s, 0.4*s);
                ctx.fillRect(x + 4.3*s, y + 3*s, 0.3*s, 0.4*s);
                ctx.fillRect(x + 4.8*s, y + 3*s, 0.3*s, 0.4*s);
                
                // Pouce levé (signe de courage)
                ctx.fillStyle = '#F5DEB3';
                ctx.fillRect(x + 4.5*s, y + 2*s, 0.6*s, 1*s);
                ctx.fillRect(x + 4.6*s, y + 1.5*s, 0.5*s, 0.6*s);
                
                // Étoiles de motivation (jaune doré)
                ctx.fillStyle = '#FFD700';
                // Étoile 1
                ctx.fillRect(x + 0.8*s, y + 1.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 0.6*s, y + 1.7*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 1.1*s, y + 1.7*s, 0.3*s, 0.3*s);
                // Étoile 2
                ctx.fillRect(x + 5.5*s, y + 1.8*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 5.3*s, y + 2*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 5.8*s, y + 2*s, 0.3*s, 0.3*s);
                break;
                
            case '⚡': // Force - ÉCLAIR PUISSANT
                // ÉCLAIR JAUNE zigzaguant
                ctx.fillStyle = '#FFD700';
                // Haut de l'éclair
                ctx.fillRect(x + 2.8*s, y + 0.5*s, 0.6*s, s);
                // Zigzag 1
                ctx.fillRect(x + 2.3*s, y + 1.5*s, s, 0.5*s);
                // Zigzag 2
                ctx.fillRect(x + 2.8*s, y + 2*s, 0.8*s, 0.8*s);
                // Zigzag 3
                ctx.fillRect(x + 2*s, y + 2.8*s, 1.2*s, 0.6*s);
                // Pointe finale
                ctx.fillRect(x + 2.5*s, y + 3.4*s, 0.7*s, 1.2*s);
                ctx.fillRect(x + 2.7*s, y + 4.6*s, 0.5*s, s);
                
                // LUEUR ÉLECTRIQUE blanche
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.9*s, y + 0.7*s, 0.4*s, 0.6*s);
                ctx.fillRect(x + 2.6*s, y + 2.2*s, 0.5*s, 0.4*s);
                ctx.fillRect(x + 2.7*s, y + 3.8*s, 0.4*s, 0.6*s);
                
                // ÉTINCELLES autour
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + 1.5*s, y + 1.8*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.8*s, y + 2.5*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 1.8*s, y + 3.5*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.5*s, y + 4.2*s, 0.3*s, 0.3*s);
                
                // Aura électrique bleue
                ctx.fillStyle = 'rgba(135, 206, 250, 0.3)';
                ctx.fillRect(x + 1.5*s, y + 0.3*s, 3*s, 5.5*s);
                break;
                
            case '🛡️': // Résilience - BOUCLIER ROYAL
                // BOUCLIER bleu royal (forme)
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 1.8*s, y + 1.5*s, 2.5*s, 3*s);
                ctx.fillRect(x + 2.2*s, y + s, 1.7*s, 0.5*s);
                ctx.fillRect(x + 2.5*s, y + 4.5*s, 1.2*s, 0.8*s);
                
                // Bordure métallique argentée
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 1.8*s, y + 1.5*s, 0.3*s, 3*s);
                ctx.fillRect(x + 4*s, y + 1.5*s, 0.3*s, 3*s);
                ctx.fillRect(x + 1.8*s, y + 1.5*s, 2.5*s, 0.3*s);
                
                // CROIX DORÉE (emblème)
                ctx.fillStyle = '#FFD700';
                // Barre verticale
                ctx.fillRect(x + 2.9*s, y + 2*s, 0.4*s, 2*s);
                // Barre horizontale
                ctx.fillRect(x + 2.2*s, y + 2.8*s, 1.8*s, 0.4*s);
                
                // Rivets métalliques
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 2.3*s, y + 2*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.5*s, y + 2*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 2.3*s, y + 3.8*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.5*s, y + 3.8*s, 0.3*s, 0.3*s);
                
                // Reflets brillants
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect(x + 2.2*s, y + 1.8*s, 0.6*s, 1.5*s);
                break;
                
            case '👑': // Assurance - COURONNE ROYALE
                // BASE de la couronne (or)
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.5*s, y + 3.5*s, 3*s, 0.8*s);
                // Bandeau intérieur
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(x + 1.8*s, y + 3.7*s, 2.4*s, 0.4*s);
                
                // POINTES de la couronne (5 pointes)
                ctx.fillStyle = '#FFD700';
                // Pointe centrale (plus haute)
                ctx.fillRect(x + 2.8*s, y + 1*s, 0.6*s, 2.5*s);
                // Boule au sommet
                ctx.fillRect(x + 2.9*s, y + 0.7*s, 0.4*s, 0.4*s);
                
                // Pointe gauche 1
                ctx.fillRect(x + 1.8*s, y + 1.8*s, 0.6*s, 1.7*s);
                ctx.fillRect(x + 1.9*s, y + 1.5*s, 0.4*s, 0.4*s);
                
                // Pointe gauche 2
                ctx.fillRect(x + 2.3*s, y + 1.4*s, 0.5*s, 2.1*s);
                ctx.fillRect(x + 2.4*s, y + 1.1*s, 0.3*s, 0.4*s);
                
                // Pointe droite 1
                ctx.fillRect(x + 3.4*s, y + 1.4*s, 0.5*s, 2.1*s);
                ctx.fillRect(x + 3.5*s, y + 1.1*s, 0.3*s, 0.4*s);
                
                // Pointe droite 2
                ctx.fillRect(x + 3.8*s, y + 1.8*s, 0.6*s, 1.7*s);
                ctx.fillRect(x + 3.9*s, y + 1.5*s, 0.4*s, 0.4*s);
                
                // GEMMES précieuses (rouges)
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2.1*s, y + 2.2*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 2.6*s, y + 1.8*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 3.1*s, y + 1.5*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 3.6*s, y + 1.8*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 4.1*s, y + 2.2*s, 0.4*s, 0.4*s);
                
                // Aura royale violette
                ctx.fillStyle = 'rgba(147, 112, 219, 0.3)';
                ctx.fillRect(x + 1.2*s, y + 0.5*s, 3.6*s, 3.5*s);
                break;
                
            case '🚀': // Agir - FUSÉE SPATIALE
                // FUSÉE blanche
                ctx.fillStyle = '#F0F0F0';
                // Nez de la fusée (pointe)
                ctx.fillRect(x + 2.8*s, y + 0.8*s, 0.6*s, 0.8*s);
                ctx.fillRect(x + 2.6*s, y + 1.6*s, s, 0.6*s);
                // Corps principal
                ctx.fillRect(x + 2.3*s, y + 2.2*s, 1.6*s, 2.5*s);
                
                // FENÊTRE (hublot bleu)
                ctx.fillStyle = '#1E90FF';
                ctx.fillRect(x + 2.7*s, y + 2.8*s, 0.8*s, 0.8*s);
                // Reflet
                ctx.fillStyle = '#87CEEF';
                ctx.fillRect(x + 2.8*s, y + 2.9*s, 0.4*s, 0.4*s);
                
                // Bandes rouges (détails)
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 2.3*s, y + 3.8*s, 1.6*s, 0.3*s);
                
                // AILERONS (gauche et droite)
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 1.5*s, y + 3.5*s, 0.8*s, 1.2*s);
                ctx.fillRect(x + 3.9*s, y + 3.5*s, 0.8*s, 1.2*s);
                
                // PROPULSEURS / Flammes
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 2.5*s, y + 4.7*s, 0.5*s, 0.8*s);
                ctx.fillRect(x + 3.2*s, y + 4.7*s, 0.5*s, 0.8*s);
                // Flammes jaunes
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.6*s, y + 5.5*s, 0.3*s, 0.5*s);
                ctx.fillRect(x + 3.3*s, y + 5.5*s, 0.3*s, 0.5*s);
                
                // Étoiles de propulsion
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2*s, y + 5.2*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 4*s, y + 5.2*s, 0.3*s, 0.3*s);
                break;
                
            case '⚔️': // Persévérance - ÉPÉE LÉGENDAIRE
                // LAME argentée (longue)
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 2.9*s, y + 0.5*s, 0.4*s, 3*s);
                // Tranchant (effet brillant)
                ctx.fillStyle = '#E8E8E8';
                ctx.fillRect(x + 2.8*s, y + 0.8*s, 0.2*s, 2.5*s);
                
                // GARDE croisée (dorée)
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.8*s, y + 3.5*s, 2.6*s, 0.5*s);
                // Ornements sur la garde
                ctx.fillRect(x + 1.6*s, y + 3.6*s, 0.4*s, 0.3*s);
                ctx.fillRect(x + 4.2*s, y + 3.6*s, 0.4*s, 0.3*s);
                
                // POIGNÉE (cuir marron)
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2.7*s, y + 4*s, 0.8*s, 1.2*s);
                // Segments de la poignée
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 2.7*s, y + 4.3*s, 0.8*s, 0.15*s);
                ctx.fillRect(x + 2.7*s, y + 4.7*s, 0.8*s, 0.15*s);
                
                // POMMEAU (boule dorée)
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.6*s, y + 5.2*s, s, 0.6*s);
                ctx.fillRect(x + 2.7*s, y + 5.8*s, 0.8*s, 0.2*s);
                
                // RUNES MAGIQUES sur la lame (bleu lumineux)
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x + 3*s, y + 1.2*s, 0.2*s, 0.3*s);
                ctx.fillRect(x + 3*s, y + 1.8*s, 0.2*s, 0.3*s);
                ctx.fillRect(x + 3*s, y + 2.4*s, 0.2*s, 0.3*s);
                
                // Aura de puissance (rouge)
                ctx.fillStyle = 'rgba(220, 20, 60, 0.3)';
                ctx.fillRect(x + 2.2*s, y + 0.3*s, 1.8*s, 5.5*s);
                break;
                
            case '🕰️': // Patience - HORLOGE ANCIENNE DÉTAILLÉE
                // Sommet décoratif
                ctx.fillStyle = '#B8860B';
                ctx.fillRect(x + 2.5*s, y + 0.8*s, s, 0.5*s);
                
                // Boîtier doré ouvragé
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(x + 1.5*s, y + 1.3*s, 3*s, 4*s);
                // Bordures dorées foncées
                ctx.fillStyle = '#B8860B';
                ctx.fillRect(x + 1.5*s, y + 1.3*s, 0.3*s, 4*s);
                ctx.fillRect(x + 4.2*s, y + 1.3*s, 0.3*s, 4*s);
                ctx.fillRect(x + 1.5*s, y + 1.3*s, 3*s, 0.3*s);
                ctx.fillRect(x + 1.5*s, y + 5*s, 3*s, 0.3*s);
                
                // CADRAN BLANC grand et détaillé
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2.5*s);
                
                // Chiffres romains (12, 3, 6, 9)
                ctx.fillStyle = '#000000';
                // 12 en haut
                ctx.fillRect(x + 2.9*s, y + 2.2*s, 0.2*s, 0.4*s);
                ctx.fillRect(x + 3.2*s, y + 2.2*s, 0.2*s, 0.4*s);
                // 3 à droite
                ctx.fillRect(x + 3.7*s, y + 3.3*s, 0.5*s, 0.2*s);
                // 6 en bas
                ctx.fillRect(x + 2.9*s, y + 4.1*s, 0.5*s, 0.2*s);
                // 9 à gauche
                ctx.fillRect(x + 2.1*s, y + 3.3*s, 0.5*s, 0.2*s);
                
                // AIGUILLES détaillées
                // Aiguille heures (courte, épaisse)
                ctx.fillRect(x + 2.9*s, y + 3.2*s, 0.3*s, 0.8*s);
                // Aiguille minutes (longue, fine)
                ctx.fillRect(x + 3.05*s, y + 2.5*s, 0.2*s, 1.3*s);
                // Pivot central doré
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.85*s, y + 3.2*s, 0.4*s, 0.4*s);
                
                // Pendule en bas
                ctx.fillStyle = '#B8860B';
                ctx.fillRect(x + 2.8*s, y + 4.8*s, 0.5*s, 0.8*s);
                break;
                
            case '🕊️': // Liberté (colombe) - Colombe blanche simple en vol
                // Corps blanc central
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.2*s, y + 2.5*s, 1.8*s, 1.5*s);
                
                // Tête ronde blanche
                ctx.fillRect(x + 2.5*s, y + 1.5*s, 1.2*s, 1.2*s);
                
                // Bec jaune court
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 3.7*s, y + 2*s, 0.5*s, 0.3*s);
                
                // Œil noir (petit)
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 3.2*s, y + 1.9*s, 0.3*s, 0.3*s);
                
                // AILE GAUCHE (simple et large)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 0.5*s, y + 2.2*s, 2.2*s, 1.8*s);
                // Bout de l'aile (3 plumes simples)
                ctx.fillRect(x + 0.2*s, y + 2.5*s, 0.4*s, 1.2*s);
                ctx.fillRect(x + 0.7*s, y + 2.3*s, 0.4*s, 1.4*s);
                ctx.fillRect(x + 1.2*s, y + 2.4*s, 0.4*s, 1.3*s);
                // Ombre légère
                ctx.fillStyle = '#F0F0F0';
                ctx.fillRect(x + 1.5*s, y + 3*s, 1*s, 0.8*s);
                
                // AILE DROITE (simple et large)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 3.8*s, y + 2.2*s, 2.2*s, 1.8*s);
                // Bout de l'aile (3 plumes simples)
                ctx.fillRect(x + 5.6*s, y + 2.5*s, 0.4*s, 1.2*s);
                ctx.fillRect(x + 5.1*s, y + 2.3*s, 0.4*s, 1.4*s);
                ctx.fillRect(x + 4.6*s, y + 2.4*s, 0.4*s, 1.3*s);
                // Ombre légère
                ctx.fillStyle = '#F0F0F0';
                ctx.fillRect(x + 3.8*s, y + 3*s, 1*s, 0.8*s);
                
                // Queue blanche simple (3 plumes en éventail)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.3*s, y + 4*s, 0.4*s, 0.8*s);
                ctx.fillRect(x + 2.8*s, y + 4.2*s, 0.4*s, 0.7*s);
                ctx.fillRect(x + 3.3*s, y + 4*s, 0.4*s, 0.8*s);
                
                // Petites pattes orange
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 2.7*s, y + 4*s, 0.2*s, 0.4*s);
                ctx.fillRect(x + 3.3*s, y + 4*s, 0.2*s, 0.4*s);
                break;
                
            case '🎯': // Contrôle - CIBLE DE PRÉCISION
                // Cercle externe ROUGE (le plus grand)
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + s, y + s, 4*s, 4*s);
                ctx.fillRect(x + 0.5*s, y + 2*s, 5*s, 2*s);
                ctx.fillRect(x + 2*s, y + 0.5*s, 2*s, 5*s);
                
                // Cercle BLANC
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 1.5*s, y + 1.5*s, 3*s, 3*s);
                ctx.fillRect(x + 1.2*s, y + 2.3*s, 3.6*s, 1.4*s);
                ctx.fillRect(x + 2.3*s, y + 1.2*s, 1.4*s, 3.6*s);
                
                // Cercle ROUGE moyen
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2*s);
                ctx.fillRect(x + 1.8*s, y + 2.5*s, 2.4*s, s);
                ctx.fillRect(x + 2.5*s, y + 1.8*s, s, 2.4*s);
                
                // Cercle BLANC petit
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.5*s, y + 2.5*s, s, s);
                
                // Centre NOIR (mouche)
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2.7*s, y + 2.7*s, 0.6*s, 0.6*s);
                
                // Réticule de visée
                ctx.fillStyle = '#000000';
                // Ligne horizontale
                ctx.fillRect(x + 1.5*s, y + 2.95*s, s, 0.2*s);
                ctx.fillRect(x + 3.5*s, y + 2.95*s, s, 0.2*s);
                // Ligne verticale
                ctx.fillRect(x + 2.95*s, y + 1.5*s, 0.2*s, s);
                ctx.fillRect(x + 2.95*s, y + 3.5*s, 0.2*s, s);
                break;
                
            case '🦉': // Sagesse - HIBOU MAJESTUEUX
                // CORPS massif marron
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 1.8*s, y + 2.5*s, 2.5*s, 2.8*s);
                // Plumes du ventre (plus clair)
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(x + 2.2*s, y + 3*s, 1.7*s, 2*s);
                
                // TÊTE RONDE très large
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 1.5*s, y + 1*s, 3*s, 2*s);
                ctx.fillRect(x + 1.8*s, y + 0.8*s, 2.4*s, 0.5*s);
                
                // Aigrettes (oreilles)
                ctx.fillRect(x + 1.3*s, y + 0.5*s, 0.5*s, 0.8*s);
                ctx.fillRect(x + 4.2*s, y + 0.5*s, 0.5*s, 0.8*s);
                
                // GRANDS YEUX JAUNES perçants
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.9*s, y + 1.5*s, 1*s, 1*s);
                ctx.fillRect(x + 3.1*s, y + 1.5*s, 1*s, 1*s);
                // Contour des yeux
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 1.8*s, y + 1.4*s, 1.2*s, 0.2*s);
                ctx.fillRect(x + 3*s, y + 1.4*s, 1.2*s, 0.2*s);
                
                // PUPILLES NOIRES dilatées
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 2.2*s, y + 1.8*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3.4*s, y + 1.8*s, 0.5*s, 0.5*s);
                // Reflet blanc dans les yeux
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.3*s, y + 1.9*s, 0.2*s, 0.2*s);
                ctx.fillRect(x + 3.5*s, y + 1.9*s, 0.2*s, 0.2*s);
                
                // BEC crochu jaune-orange
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 2.7*s, y + 2.5*s, 0.7*s, 0.5*s);
                ctx.fillRect(x + 2.8*s, y + 3*s, 0.5*s, 0.3*s);
                
                // Ailes repliées
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 1.3*s, y + 3*s, 0.7*s, 1.5*s);
                ctx.fillRect(x + 4*s, y + 3*s, 0.7*s, 1.5*s);
                
                // Serres puissantes
                ctx.fillStyle = '#2F4F4F';
                ctx.fillRect(x + 2.2*s, y + 5*s, 0.4*s, 0.5*s);
                ctx.fillRect(x + 3.5*s, y + 5*s, 0.4*s, 0.5*s);
                break;
                
            case '⚖️': // Gestion - BALANCE DE JUSTICE
                // Socle massif doré
                ctx.fillStyle = '#B8860B';
                ctx.fillRect(x + 2.5*s, y + 4.5*s, 1.2*s, 0.8*s);
                // Colonne centrale
                ctx.fillRect(x + 2.8*s, y + 2*s, 0.6*s, 2.5*s);
                
                // FLÉAU horizontal (barre)
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(x + 0.8*s, y + 2*s, 4.5*s, 0.4*s);
                
                // Chaînes de suspension (gauche)
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 1.2*s, y + 2.4*s, 0.2*s, 0.8*s);
                ctx.fillRect(x + 1.8*s, y + 2.4*s, 0.2*s, 0.8*s);
                // Chaînes (droite)
                ctx.fillRect(x + 4*s, y + 2.4*s, 0.2*s, 0.8*s);
                ctx.fillRect(x + 4.6*s, y + 2.4*s, 0.2*s, 0.8*s);
                
                // PLATEAU GAUCHE (doré)
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 0.8*s, y + 3.2*s, 1.5*s, 0.3*s);
                // Bords relevés
                ctx.fillRect(x + 0.8*s, y + 3*s, 0.2*s, 0.5*s);
                ctx.fillRect(x + 2.1*s, y + 3*s, 0.2*s, 0.5*s);
                
                // PLATEAU DROIT (doré)
                ctx.fillRect(x + 3.7*s, y + 3.2*s, 1.5*s, 0.3*s);
                // Bords relevés
                ctx.fillRect(x + 3.7*s, y + 3*s, 0.2*s, 0.5*s);
                ctx.fillRect(x + 5*s, y + 3*s, 0.2*s, 0.5*s);
                
                // Poids sur les plateaux (simulation équilibre)
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 1.3*s, y + 2.7*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4.2*s, y + 2.7*s, 0.5*s, 0.5*s);
                break;
                
            case '🔒': // Paix intérieure - CADENAS DORÉ MASSIF
                // ANSE argentvée épaisse
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 1.8*s, y + 1.2*s, 0.6*s, 1.5*s);
                ctx.fillRect(x + 3.6*s, y + 1.2*s, 0.6*s, 1.5*s);
                ctx.fillRect(x + 1.8*s, y + 1.2*s, 2.4*s, 0.6*s);
                // Intérieur anse (creux)
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 2.4*s, y + 1.8*s, 1.2*s, 0.9*s);
                
                // CORPS du cadenas (doré brillant)
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.5*s, y + 2.7*s, 3*s, 2.5*s);
                // Reflets métalliques
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 1.5*s, y + 2.7*s, 0.5*s, 2.5*s);
                ctx.fillRect(x + 4*s, y + 2.7*s, 0.5*s, 2.5*s);
                
                // TROU DE SERRURE noir (forme de clé)
                ctx.fillStyle = '#000000';
                // Cercle haut
                ctx.fillRect(x + 2.7*s, y + 3.2*s, 0.7*s, 0.7*s);
                // Fente verticale
                ctx.fillRect(x + 2.9*s, y + 3.9*s, 0.3*s, 1*s);
                // Élargissement bas
                ctx.fillRect(x + 2.7*s, y + 4.7*s, 0.7*s, 0.3*s);
                
                // Vis de fixation aux coins
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 1.8*s, y + 3*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.9*s, y + 3*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 1.8*s, y + 4.9*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 3.9*s, y + 4.9*s, 0.3*s, 0.3*s);
                break;
                
            case '🏔️': // Stabilité - MONTAGNE MAJESTUEUSE
                // BASE de la montagne (très large)
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 0.5*s, y + 4.5*s, 5*s, s);
                // Deuxième niveau
                ctx.fillRect(x + s, y + 3.8*s, 4*s, 0.7*s);
                // Troisième niveau
                ctx.fillRect(x + 1.5*s, y + 3*s, 3*s, 0.8*s);
                
                // PICS multiples
                // Pic principal (centre)
                ctx.fillStyle = '#808080';
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 1.5*s);
                ctx.fillRect(x + 2.2*s, y + 2.2*s, 1.6*s, 0.8*s);
                // Pic gauche
                ctx.fillRect(x + 1.5*s, y + 2*s, 0.8*s, s);
                ctx.fillRect(x + 1.3*s, y + 2.5*s, 1.2*s, 0.5*s);
                // Pic droit
                ctx.fillRect(x + 3.7*s, y + 2.3*s, 0.8*s, 0.7*s);
                ctx.fillRect(x + 3.5*s, y + 2.7*s, 1.2*s, 0.3*s);
                
                // NEIGE éternelle (sommets blancs)
                ctx.fillStyle = '#FFFFFF';
                // Sommet principal
                ctx.fillRect(x + 2.5*s, y + 1.5*s, s, 0.6*s);
                ctx.fillRect(x + 2.3*s, y + 2.1*s, 1.4*s, 0.4*s);
                // Sommet gauche
                ctx.fillRect(x + 1.5*s, y + 2*s, 0.8*s, 0.5*s);
                ctx.fillRect(x + 1.4*s, y + 2.5*s, 1*s, 0.3*s);
                // Sommet droit
                ctx.fillRect(x + 3.7*s, y + 2.3*s, 0.8*s, 0.4*s);
                
                // Glaciers (bleu clair)
                ctx.fillStyle = '#E0F6FF';
                ctx.fillRect(x + 2.7*s, y + 2.5*s, 0.4*s, 0.5*s);
                ctx.fillRect(x + 1.7*s, y + 2.8*s, 0.3*s, 0.3*s);
                
                // Ombres des pics (profondeur)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(x + 3.5*s, y + 2*s, 0.3*s, s);
                ctx.fillRect(x + 2*s, y + 2.5*s, 0.3*s, 0.8*s);
                break;
                
            // ========== POWER-UPS FUN ==========
            case '🕺': // Disco - DANSEUR + BOULE DISCO
                // BOULE DISCO en haut
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 2.2*s, y + 0.5*s, 1.6*s, 1.6*s);
                // Carreaux miroir multicolores
                ctx.fillStyle = '#FF1493';
                ctx.fillRect(x + 2.4*s, y + 0.7*s, 0.5*s, 0.5*s);
                ctx.fillStyle = '#00FFFF';
                ctx.fillRect(x + 3.1*s, y + 0.7*s, 0.5*s, 0.5*s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.4*s, y + 1.4*s, 0.5*s, 0.5*s);
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(x + 3.1*s, y + 1.4*s, 0.5*s, 0.5*s);
                
                // SILHOUETTE DANSANTE (rose vif)
                ctx.fillStyle = '#FF1493';
                // Tête
                ctx.fillRect(x + 2.6*s, y + 2.5*s, 0.8*s, 0.8*s);
                // Corps
                ctx.fillRect(x + 2.3*s, y + 3.3*s, 1.4*s, 1.2*s);
                // Bras levé gauche (pose danse)
                ctx.fillRect(x + 1.5*s, y + 3*s, 0.8*s, 0.4*s);
                ctx.fillRect(x + 1.2*s, y + 2.3*s, 0.4*s, 0.8*s);
                // Bras levé droit
                ctx.fillRect(x + 3.7*s, y + 3.2*s, 0.8*s, 0.4*s);
                ctx.fillRect(x + 4.4*s, y + 2.7*s, 0.4*s, 0.6*s);
                // Jambe gauche (écartée)
                ctx.fillRect(x + 2*s, y + 4.5*s, 0.5*s, 1*s);
                // Jambe droite
                ctx.fillRect(x + 3.5*s, y + 4.5*s, 0.5*s, 1*s);
                
                // PAILLETTES volantes
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 0.8*s, y + s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 4.8*s, y + 1.5*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 1.2*s, y + 4.5*s, 0.4*s, 0.4*s);
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 5*s, y + 3.5*s, 0.4*s, 0.4*s);
                ctx.fillRect(x + 0.6*s, y + 2.8*s, 0.4*s, 0.4*s);
                break;
                
            case '🦣': // Géant - MAMMOUTH MASSIF
                // CORPS énorme marron
                ctx.fillStyle = '#8B7355';
                ctx.fillRect(x + s, y + 2.5*s, 3.5*s, 2.8*s);
                // Fourrure épaisse (texture)
                ctx.fillStyle = '#6F5943';
                ctx.fillRect(x + s, y + 3*s, 0.4*s, 2*s);
                ctx.fillRect(x + 1.8*s, y + 3.2*s, 0.4*s, 1.8*s);
                ctx.fillRect(x + 2.6*s, y + 3*s, 0.4*s, 2*s);
                ctx.fillRect(x + 3.4*s, y + 3.2*s, 0.4*s, 1.8*s);
                
                // PATTES massives
                ctx.fillStyle = '#8B7355';
                ctx.fillRect(x + 1.2*s, y + 5.3*s, 0.8*s, 0.7*s);
                ctx.fillRect(x + 2.2*s, y + 5.3*s, 0.8*s, 0.7*s);
                ctx.fillRect(x + 3.2*s, y + 5.3*s, 0.8*s, 0.7*s);
                
                // TÊTE imposante
                ctx.fillRect(x + 4*s, y + 2*s, 1.5*s, 2*s);
                // Oreille
                ctx.fillRect(x + 4.8*s, y + 2.3*s, 0.7*s, s);
                
                // TROMPE longue et recourbée
                ctx.fillRect(x + 5.5*s, y + 2.5*s, 0.5*s, 1.2*s);
                ctx.fillRect(x + 5.3*s, y + 3.7*s, 0.7*s, 0.5*s);
                ctx.fillRect(x + 4.8*s, y + 4.2*s, 0.5*s, 0.6*s);
                
                // DÉFENSES BLANCHES géantes
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 4.8*s, y + 3.5*s, 0.4*s, 1.5*s);
                ctx.fillRect(x + 4.5*s, y + 4.8*s, 0.4*s, 0.5*s);
                ctx.fillRect(x + 5.7*s, y + 3.5*s, 0.4*s, 1.5*s);
                ctx.fillRect(x + 5.8*s, y + 4.8*s, 0.4*s, 0.5*s);
                
                // Oeil
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 4.5*s, y + 2.5*s, 0.3*s, 0.3*s);
                break;
                
            case '🐭': // Minuscule (souris)
                // Corps gris minuscule
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 2.5*s, y + 2.8*s, 1.5*s, 0.7*s);
                // Tête
                ctx.fillRect(x + 3.8*s, y + 2.5*s, 0.7*s, 0.7*s);
                // Oreilles rondes
                ctx.fillRect(x + 3.8*s, y + 2.2*s, 0.3*s, 0.3*s);
                ctx.fillRect(x + 4.4*s, y + 2.2*s, 0.3*s, 0.3*s);
                // Queue
                ctx.fillRect(x + 2*s, y + 3*s, 0.7*s, 0.3*s);
                break;
                
            case '🌈': // Arc-en-ciel
                // Bandes colorées
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + s, y + 3*s, 4*s, 0.4*s);
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 1.2*s, y + 2.6*s, 3.6*s, 0.4*s);
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(x + 1.4*s, y + 2.2*s, 3.2*s, 0.4*s);
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(x + 1.6*s, y + 1.8*s, 2.8*s, 0.4*s);
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(x + 1.8*s, y + 1.4*s, 2.4*s, 0.4*s);
                ctx.fillStyle = '#9400D3';
                ctx.fillRect(x + 2*s, y + s, 2*s, 0.4*s);
                break;
                
            case '🦘': // Kangourou (ressort)
                // Corps beige
                ctx.fillStyle = '#DEB887';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2*s);
                // Tête
                ctx.fillRect(x + 2.5*s, y + 1.3*s, s, s);
                // Oreilles
                ctx.fillRect(x + 2.3*s, y + s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 3.2*s, y + s, 0.5*s, 0.5*s);
                // Queue épaisse
                ctx.fillRect(x + 1.3*s, y + 3*s, s, s);
                // Pattes arrière puissantes
                ctx.fillRect(x + 2.3*s, y + 4*s, 0.7*s, s);
                ctx.fillRect(x + 3*s, y + 4*s, 0.7*s, s);
                break;
                
            case '🎒': // Jetpack
                // Sac à dos bleu
                ctx.fillStyle = '#00CED1';
                ctx.fillRect(x + 2*s, y + 2*s, 2*s, 2.5*s);
                // Bretelles
                ctx.fillStyle = '#008B8B';
                ctx.fillRect(x + 2.3*s, y + 1.5*s, 0.5*s, s);
                ctx.fillRect(x + 3.2*s, y + 1.5*s, 0.5*s, s);
                // Propulseurs
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 2.3*s, y + 4.5*s, 0.7*s, 0.7*s);
                ctx.fillRect(x + 3*s, y + 4.5*s, 0.7*s, 0.7*s);
                // Flammes
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(x + 2.5*s, y + 5.2*s, 0.3*s, 0.5*s);
                ctx.fillRect(x + 3.2*s, y + 5.2*s, 0.3*s, 0.5*s);
                break;
                
            case '🥷': // Ninja - GUERRIER FURTIF
                // SILHOUETTE noire en position de combat
                ctx.fillStyle = '#2F4F4F';
                // Tête
                ctx.fillRect(x + 2.6*s, y + 1.8*s, 0.9*s, 0.9*s);
                
                // BANDEAU ROUGE (frontal)
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2.3*s, y + 2*s, 1.5*s, 0.4*s);
                // Noeud derrière
                ctx.fillRect(x + 3.8*s, y + 1.9*s, 0.5*s, 0.6*s);
                
                // YEUX (fente blanche)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(x + 2.7*s, y + 2.1*s, 0.4*s, 0.2*s);
                ctx.fillRect(x + 3.2*s, y + 2.1*s, 0.4*s, 0.2*s);
                
                // CORPS en armure
                ctx.fillStyle = '#2F4F4F';
                ctx.fillRect(x + 2.3*s, y + 2.7*s, 1.5*s, 2*s);
                
                // Bras avec katana
                ctx.fillRect(x + 1.5*s, y + 3*s, 0.8*s, 0.5*s);
                // KATANA (lame argentée)
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(x + 0.5*s, y + 2.3*s, s, 0.3*s);
                ctx.fillRect(x + 0.8*s, y + 1.8*s, 0.7*s, 0.3*s);
                // Poignée noire
                ctx.fillStyle = '#000000';
                ctx.fillRect(x + 1.5*s, y + 2.5*s, 0.5*s, 0.3*s);
                
                // Bras droit
                ctx.fillStyle = '#2F4F4F';
                ctx.fillRect(x + 3.8*s, y + 3.3*s, 0.8*s, 0.5*s);
                
                // Ceinture rouge
                ctx.fillStyle = '#DC143C';
                ctx.fillRect(x + 2.3*s, y + 3.8*s, 1.5*s, 0.3*s);
                
                // Jambes
                ctx.fillStyle = '#2F4F4F';
                ctx.fillRect(x + 2.5*s, y + 4.7*s, 0.6*s, 1.3*s);
                ctx.fillRect(x + 3.2*s, y + 4.7*s, 0.6*s, 1.3*s);
                
                // Shuriken (dans l'autre main)
                ctx.fillStyle = '#696969';
                ctx.fillRect(x + 4.5*s, y + 3.5*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 4.3*s, y + 3.7*s, 0.9*s, 0.2*s);
                break;
                
            case '🎉': // Fête - EXPLOSION DE CONFETTIS
                // CONFETTIS multicolores (carrés et rectangles)
                // Rouges
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(x + 0.8*s, y + 0.8*s, 0.6*s, 0.6*s);
                ctx.fillRect(x + 4.5*s, y + 1.5*s, 0.5*s, 0.8*s);
                // Jaunes
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 1.8*s, y + s, 0.7*s, 0.5*s);
                ctx.fillRect(x + 4*s, y + 4.2*s, 0.8*s, 0.6*s);
                // Verts
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(x + 3.2*s, y + 1.2*s, 0.6*s, 0.7*s);
                ctx.fillRect(x + 1.2*s, y + 4*s, 0.7*s, 0.5*s);
                // Bleus
                ctx.fillStyle = '#0000FF';
                ctx.fillRect(x + 4.8*s, y + 3*s, 0.5*s, 0.6*s);
                ctx.fillRect(x + 2.8*s, y + 5*s, 0.6*s, 0.5*s);
                // Roses
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(x + 0.5*s, y + 3*s, 0.7*s, 0.6*s);
                ctx.fillRect(x + 3.8*s, y + 5.2*s, 0.6*s, 0.5*s);
                // Violets
                ctx.fillStyle = '#9400D3';
                ctx.fillRect(x + 2*s, y + 3.5*s, 0.5*s, 0.7*s);
                ctx.fillRect(x + 5.2*s, y + 2*s, 0.6*s, 0.5*s);
                
                // SERPENTINS ondulés (orange/rose)
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(x + 1.5*s, y + 2*s, 1.5*s, 0.3*s);
                ctx.fillRect(x + 2*s, y + 2.3*s, s, 0.3*s);
                ctx.fillRect(x + 2.5*s, y + 2.6*s, 1.2*s, 0.3*s);
                
                ctx.fillStyle = '#FF1493';
                ctx.fillRect(x + 3.5*s, y + 3.2*s, 1.3*s, 0.3*s);
                ctx.fillRect(x + 3.8*s, y + 3.5*s, 0.8*s, 0.3*s);
                ctx.fillRect(x + 3.3*s, y + 3.8*s, s, 0.3*s);
                
                // ÉTOILES de fête
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x + 2.8*s, y + 1.8*s, 0.5*s, 0.5*s);
                ctx.fillRect(x + 2.6*s, y + 2*s, 0.3*s, 0.2*s);
                ctx.fillRect(x + 3.2*s, y + 2*s, 0.3*s, 0.2*s);
                break;
                
            case '☕': // Café - TASSE FUMANTE
                // SOUCOUPE blanche
                ctx.fillStyle = '#F5F5F5';
                ctx.fillRect(x + 1.2*s, y + 4.5*s, 3.6*s, 0.5*s);
                ctx.fillRect(x + 0.8*s, y + 5*s, 4.4*s, 0.4*s);
                
                // TASSE marron (céramique)
                ctx.fillStyle = '#6F4E37';
                ctx.fillRect(x + 1.8*s, y + 2.8*s, 2.5*s, 1.7*s);
                // Reflet brillant
                ctx.fillStyle = '#8B6F47';
                ctx.fillRect(x + 1.9*s, y + 2.9*s, 0.5*s, 1.5*s);
                
                // ANSE incurvée
                ctx.fillStyle = '#6F4E37';
                ctx.fillRect(x + 4.3*s, y + 3.2*s, 0.5*s, 1.2*s);
                // Creux de l'anse
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(x + 4.5*s, y + 3.5*s, 0.3*s, 0.6*s);
                
                // CAFÉ NOIR (liquide)
                ctx.fillStyle = '#2F1B0F';
                ctx.fillRect(x + 2*s, y + 3*s, 2.1*s, s);
                // Reflet sur le café
                ctx.fillStyle = '#4A2F1F';
                ctx.fillRect(x + 2.2*s, y + 3.1*s, 0.8*s, 0.3*s);
                
                // VAPEUR chaude (3 volutes)
                ctx.fillStyle = '#E0E0E0';
                // Volute gauche
                ctx.fillRect(x + 2.2*s, y + 2*s, 0.4*s, 0.8*s);
                ctx.fillRect(x + 2*s, y + 1.5*s, 0.4*s, 0.5*s);
                ctx.fillRect(x + 2.2*s, y + 1.2*s, 0.3*s, 0.3*s);
                // Volute centre
                ctx.fillRect(x + 3*s, y + 1.5*s, 0.4*s, s);
                ctx.fillRect(x + 3.2*s, y + 0.8*s, 0.4*s, 0.7*s);
                ctx.fillRect(x + 3*s, y + 0.5*s, 0.3*s, 0.3*s);
                // Volute droite
                ctx.fillRect(x + 3.8*s, y + 2.2*s, 0.4*s, 0.6*s);
                ctx.fillRect(x + 4*s, y + 1.7*s, 0.4*s, 0.5*s);
                ctx.fillRect(x + 3.8*s, y + 1.3*s, 0.3*s, 0.4*s);
                
                // Logo café (grain sur la tasse)
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2.8*s, y + 3.8*s, 0.5*s, 0.4*s);
                break;
                
            default:
                // Forme générique si icône non reconnue
                ctx.fillStyle = color;
                ctx.fillRect(x + s, y + s, 4*s, 4*s);
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(x + s, y + 4*s, 4*s, s);
                // Contour
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + s, y + s, 4*s, 4*s);
                break;
        }
        
        // Ajouter un contour noir pour tous les obstacles
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 6*s, 6*s);
    }
    
    // Particule voxel (carré simple avec ombre)
    drawVoxelParticle(x, y, size, color) {
        // Particule carrée simple
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, size, size);
        
        // Ombre légère
        this.ctx.fillStyle = this.darkenColor(color, 0.3);
        this.ctx.fillRect(x, y + size * 0.7, size, size * 0.3);
        
        // Contour
        this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, size, size);
    }
    
    // Explosion en voxels (blocs qui éclatent)
    drawVoxelExplosion(x, y, radius, progress) {
        const particleCount = 12;
        const size = this.blockSize * 0.5;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = radius * progress;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;
            
            // Couleurs variées pour l'explosion
            const colors = ['#FF6B00', '#FFD700', '#FF0000', '#FFA500'];
            const color = colors[i % colors.length];
            
            this.drawVoxelParticle(px, py, size * (1 - progress * 0.5), color);
        }
    }
    
    // Bulle narrative en style voxel
    drawVoxelBubble(x, y, width, height, text) {
        const cacheKey = `${width}_${height}_${text}`;
        
        // Vérifier si la bulle est déjà en cache
        if (!this.bubbleCache.has(cacheKey)) {
            // Créer un canvas pour cette bulle
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            this.drawBubbleToCanvas(ctx, 0, 0, width, height, text);
            this.bubbleCache.set(cacheKey, canvas);
        }
        
        // Dessiner la bulle depuis le cache
        const cachedBubble = this.bubbleCache.get(cacheKey);
        this.ctx.drawImage(cachedBubble, x, y);
    }
    
    // Dessiner la bulle sur un canvas (pour le cache)
    drawBubbleToCanvas(ctx, x, y, width, height, text) {
        const s = 4; // Taille des blocs pixel art
        
        // Fond dégradé doux
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#F0F8FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        // Bordure épaisse style BD/comics
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
        
        // Bordure interne dorée
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);
        
        // Coins décoratifs en pixels (style ancien parchemin)
        ctx.fillStyle = '#4169E1';
        // Coin haut gauche
        ctx.fillRect(x + 8, y + 8, s, s);
        ctx.fillRect(x + 8 + s, y + 8, s, s);
        ctx.fillRect(x + 8, y + 8 + s, s, s);
        // Coin haut droit
        ctx.fillRect(x + width - 8 - 2*s, y + 8, s, s);
        ctx.fillRect(x + width - 8 - s, y + 8, s, s);
        ctx.fillRect(x + width - 8 - 2*s, y + 8 + s, s, s);
        // Coin bas gauche
        ctx.fillRect(x + 8, y + height - 8 - 2*s, s, s);
        ctx.fillRect(x + 8 + s, y + height - 8 - 2*s, s, s);
        ctx.fillRect(x + 8, y + height - 8 - s, s, s);
        // Coin bas droit
        ctx.fillRect(x + width - 8 - 2*s, y + height - 8 - 2*s, s, s);
        ctx.fillRect(x + width - 8 - s, y + height - 8 - 2*s, s, s);
        ctx.fillRect(x + width - 8 - 2*s, y + height - 8 - s, s, s);
        
        // Étoiles décoratives dorées
        ctx.fillStyle = '#FFD700';
        // Étoile gauche
        ctx.fillRect(x + 15, y + height/2 - s, s, s);
        ctx.fillRect(x + 15 - s, y + height/2, s, s);
        ctx.fillRect(x + 15 + s, y + height/2, s, s);
        // Étoile droite
        ctx.fillRect(x + width - 15 - s, y + height/2 - s, s, s);
        ctx.fillRect(x + width - 15 - 2*s, y + height/2, s, s);
        ctx.fillRect(x + width - 15, y + height/2, s, s);
        
        // Ombre douce en bas pour profondeur
        const shadowGradient = ctx.createLinearGradient(x, y + height * 0.8, x, y + height);
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(x, y + height * 0.8, width, height * 0.2);
        
        // Texte par dessus avec style amélioré
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Découper le texte en lignes
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > width - 20 && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);
        
        // Afficher les lignes
        const lineHeight = 16;
        const startY = y + height / 2 - (lines.length * lineHeight) / 2;
        lines.forEach((line, i) => {
            ctx.fillText(line.trim(), x + width / 2, startY + i * lineHeight);
        });
    }
    
    // Fond voxel (ciel avec nuages pixel art)
    drawVoxelBackground(scrollX) {
        const size = this.blockSize * 2;
        
        // Ciel dégradé
        const gradient = this.ctx.createLinearGradient(0, 0, 0, GameConfig.CANVAS_HEIGHT);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
        
        // Nuages pixel art en parallaxe
        for (let i = 0; i < 5; i++) {
            const x = ((scrollX * 0.3 + i * 200) % (GameConfig.CANVAS_WIDTH + 200)) - 100;
            const y = 50 + i * 40;
            
            // Nuage = rectangles plats (forme de nuage pixelisée)
            this.ctx.fillStyle = '#FFFFFF';
            // Corps central
            this.ctx.fillRect(x + size, y, size * 3, size);
            // Parties hautes et basses
            this.ctx.fillRect(x, y + size * 0.3, size * 4, size * 0.7);
            this.ctx.fillRect(x + size * 0.5, y + size * 0.6, size * 3, size * 0.5);
            
            // Contour pixel art
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y + size * 0.3, size * 4, size * 0.7);
        }
        
        // Sol pixel art (herbe)
        const groundY = GameConfig.CANVAS_HEIGHT - 80;
        const blockSize = size;
        
        for (let i = 0; i < GameConfig.CANVAS_WIDTH / blockSize + 1; i++) {
            // Couche d'herbe (blocs verts)
            this.ctx.fillStyle = '#7CFC00';
            this.ctx.fillRect(i * blockSize, groundY, blockSize, blockSize);
            
            // Ombre en bas de l'herbe
            this.ctx.fillStyle = '#5DA800';
            this.ctx.fillRect(i * blockSize, groundY + blockSize * 0.7, blockSize, blockSize * 0.3);
            
            // Contour
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(i * blockSize, groundY, blockSize, blockSize);
            
            // Couche de terre (blocs marron)
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(i * blockSize, groundY + blockSize, blockSize, blockSize);
            
            // Ombre de la terre
            this.ctx.fillStyle = '#654321';
            this.ctx.fillRect(i * blockSize, groundY + blockSize + blockSize * 0.7, blockSize, blockSize * 0.3);
            
            // Contour
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.strokeRect(i * blockSize, groundY + blockSize, blockSize, blockSize);
        }
    }
    
    /**
     * Dessine une bulle BD en pixel art détaillé
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {number} width - Largeur de la bulle
     * @param {number} height - Hauteur de la bulle
     * @param {string} icon - Emoji/icône à afficher
     * @param {string} text - Texte à afficher
     * @param {string} borderColor - Couleur de la bordure (défaut: noir)
     */
    drawVoxelSpeechBubble(x, y, width, height, icon, text, borderColor = '#000000') {
        const ctx = this.ctx;
        const s = 4; // Taille d'un pixel
        const cornerSize = 3 * s; // 3 pixels pour les coins arrondis
        
        // Fond blanc avec effet dégradé pixel art
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + cornerSize, y, width - 2*cornerSize, height);
        ctx.fillRect(x, y + cornerSize, width, height - 2*cornerSize);
        
        // Coins arrondis en pixel art (style Minecraft)
        // Coin haut gauche
        ctx.fillRect(x + s, y + s, 2*s, s);
        ctx.fillRect(x + s, y + 2*s, s, s);
        
        // Coin haut droit
        ctx.fillRect(x + width - 3*s, y + s, 2*s, s);
        ctx.fillRect(x + width - 2*s, y + 2*s, s, s);
        
        // Coin bas gauche
        ctx.fillRect(x + s, y + height - 2*s, 2*s, s);
        ctx.fillRect(x + s, y + height - 3*s, s, s);
        
        // Coin bas droit
        ctx.fillRect(x + width - 3*s, y + height - 2*s, 2*s, s);
        ctx.fillRect(x + width - 2*s, y + height - 3*s, s, s);
        
        // Bordure noire épaisse (4 pixels) style pixel art
        ctx.fillStyle = borderColor;
        
        // Bord haut
        ctx.fillRect(x + cornerSize, y, width - 2*cornerSize, s);
        // Bord bas
        ctx.fillRect(x + cornerSize, y + height - s, width - 2*cornerSize, s);
        // Bord gauche
        ctx.fillRect(x, y + cornerSize, s, height - 2*cornerSize);
        // Bord droit
        ctx.fillRect(x + width - s, y + cornerSize, s, height - 2*cornerSize);
        
        // Coins de la bordure
        // Haut gauche
        ctx.fillRect(x + 2*s, y, s, s);
        ctx.fillRect(x + s, y + s, s, s);
        ctx.fillRect(x, y + 2*s, s, s);
        // Haut droit
        ctx.fillRect(x + width - 3*s, y, s, s);
        ctx.fillRect(x + width - 2*s, y + s, s, s);
        ctx.fillRect(x + width - s, y + 2*s, s, s);
        // Bas gauche
        ctx.fillRect(x + 2*s, y + height - s, s, s);
        ctx.fillRect(x + s, y + height - 2*s, s, s);
        ctx.fillRect(x, y + height - 3*s, s, s);
        // Bas droit
        ctx.fillRect(x + width - 3*s, y + height - s, s, s);
        ctx.fillRect(x + width - 2*s, y + height - 2*s, s, s);
        ctx.fillRect(x + width - s, y + height - 3*s, s, s);
        
        // Pointe triangulaire pixel art vers le bas (queue de bulle)
        const pointerX = x + width / 2;
        const pointerY = y + height;
        const pointerWidth = 5 * s;
        const pointerHeight = 4 * s;
        
        // Fond blanc de la pointe
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(pointerX - 2*s, pointerY, 4*s, s); // Ligne 1: 4 pixels
        ctx.fillRect(pointerX - s, pointerY + s, 2*s, s); // Ligne 2: 2 pixels
        ctx.fillRect(pointerX - s, pointerY + 2*s, s, s); // Ligne 3: 1 pixel
        
        // Bordure de la pointe
        ctx.fillStyle = borderColor;
        // Côté gauche
        ctx.fillRect(pointerX - 3*s, pointerY, s, s);
        ctx.fillRect(pointerX - 2*s, pointerY + s, s, s);
        ctx.fillRect(pointerX - 2*s, pointerY + 2*s, s, s);
        ctx.fillRect(pointerX - s, pointerY + 3*s, s, s);
        // Côté droit
        ctx.fillRect(pointerX + 2*s, pointerY, s, s);
        ctx.fillRect(pointerX + s, pointerY + s, s, s);
        ctx.fillRect(pointerX + s, pointerY + 2*s, s, s);
        ctx.fillRect(pointerX, pointerY + 3*s, s, s);
        
        // Icône en gros (emoji géant pixelisé)
        if (icon) {
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';
            // Effet ombre pixel art
            ctx.fillText(icon, x + width/2 + 2, y + 12);
            ctx.fillStyle = borderColor;
            ctx.fillText(icon, x + width/2, y + 10);
        }
        
        // Texte en gras style pixel art
        if (text) {
            ctx.font = 'bold 16px monospace'; // Monospace pour effet pixel
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000000';
            
            // Découper le texte en lignes si trop long
            const maxWidth = width - 20;
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);
            
            // Dessiner chaque ligne
            const lineHeight = 20;
            const startY = y + (icon ? 55 : 15);
            lines.forEach((line, i) => {
                ctx.fillText(line, x + width/2, startY + i * lineHeight);
            });
        }
        
        // Pixels décoratifs aux coins (brillance style BD)
        ctx.fillStyle = '#FFD700'; // Doré
        ctx.fillRect(x + 2*s, y + 2*s, s, s); // Haut gauche
        ctx.fillRect(x + width - 3*s, y + 2*s, s, s); // Haut droit
        
        // Étoiles décoratives style pixel art
        ctx.fillStyle = '#FFEB3B'; // Jaune brillant
        const starSize = s;
        // Étoile 1 (coin haut gauche)
        ctx.fillRect(x + 4*s, y + 3*s, starSize, starSize);
        ctx.fillRect(x + 3*s, y + 4*s, starSize, starSize);
        ctx.fillRect(x + 5*s, y + 4*s, starSize, starSize);
        ctx.fillRect(x + 4*s, y + 5*s, starSize, starSize);
        
        // Étoile 2 (coin haut droit)
        ctx.fillRect(x + width - 5*s, y + 3*s, starSize, starSize);
        ctx.fillRect(x + width - 6*s, y + 4*s, starSize, starSize);
        ctx.fillRect(x + width - 4*s, y + 4*s, starSize, starSize);
        ctx.fillRect(x + width - 5*s, y + 5*s, starSize, starSize);
    }
    
    /**
     * Dessine un proverbe (parchemin) en pixel art
     * @param {number} x - Position X (centre)
     * @param {number} y - Position Y (centre)
     * @param {string} icon - Icône du proverbe
     */
    drawVoxelProverb(x, y, icon) {
        const ctx = this.ctx;
        const s = 4; // Taille d'un pixel
        const size = 32; // Taille totale du parchemin
        
        // Parchemin beige/papier ancien
        ctx.fillStyle = '#F4E8D0'; // Beige parchemin
        ctx.fillRect(x - size/2, y - size/2 + s, size, size - 2*s);
        ctx.fillRect(x - size/2 + s, y - size/2, size - 2*s, size);
        
        // Bordure marron foncé style ancien
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - size/2 + 2, y - size/2 + 2, size - 4, size - 4);
        
        // Lignes horizontales d'écriture sur le parchemin
        ctx.strokeStyle = '#A0826D';
        ctx.lineWidth = 2;
        [y - 8, y, y + 8].forEach(lineY => {
            ctx.beginPath();
            ctx.moveTo(x - size/2 + 6, lineY);
            ctx.lineTo(x + size/2 - 6, lineY);
            ctx.stroke();
        });
        
        // Ombre du parchemin (effet profondeur)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x - size/2 + 2, y + size/2 - 4, size - 4, 2);
        
        // Brillance papier (coins)
        ctx.fillStyle = '#FFF8E7';
        ctx.fillRect(x - size/2 + 4, y - size/2 + 4, s*2, s);
        ctx.fillRect(x + size/2 - 4 - s*2, y - size/2 + 4, s*2, s);
        
        // Aura bleue pulsante autour (sagesse divine)
        const auraSize = size + 12;
        ctx.strokeStyle = 'rgba(74, 144, 164, 0.5)';
        ctx.lineWidth = 4;
        ctx.strokeRect(x - auraSize/2, y - auraSize/2, auraSize, auraSize);
        
        // Particules brillantes aux coins (effet sacré)
        ctx.fillStyle = '#87CEEB';
        const corners = [
            [x - auraSize/2 - 2, y - auraSize/2 - 2],
            [x + auraSize/2 - 2, y - auraSize/2 - 2],
            [x - auraSize/2 - 2, y + auraSize/2 - 2],
            [x + auraSize/2 - 2, y + auraSize/2 - 2]
        ];
        corners.forEach(([cx, cy]) => {
            ctx.fillRect(cx, cy, s, s);
            ctx.fillRect(cx + s, cy + s, s, s);
        });
    }
    
    /**
     * Dessine une bulle narrative compacte en pixel art
     * @param {number} x - Position X (coin haut gauche)
     * @param {number} y - Position Y (coin haut gauche)
     * @param {string} text - Texte à afficher
     * @param {number} maxWidth - Largeur maximale (défaut: 300)
     */
    drawVoxelNarrativeBubble(x, y, text, maxWidth = 300) {
        const ctx = this.ctx;
        const s = 3; // Taille d'un pixel plus petite pour bulle narrative
        const padding = 15;
        
        // Calculer dimensions nécessaires
        ctx.font = 'bold 14px monospace';
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth - 2*padding && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        
        // Calculer la largeur max des lignes
        let textWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            textWidth = Math.max(textWidth, metrics.width);
        });
        
        const width = textWidth + 2*padding;
        const lineHeight = 18;
        const height = lines.length * lineHeight + 2*padding;
        const cornerSize = 2 * s;
        
        // Fond blanc
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + cornerSize, y, width - 2*cornerSize, height);
        ctx.fillRect(x, y + cornerSize, width, height - 2*cornerSize);
        
        // Coins arrondis
        ctx.fillRect(x + s, y + s, s, s);
        ctx.fillRect(x + width - 2*s, y + s, s, s);
        ctx.fillRect(x + s, y + height - 2*s, s, s);
        ctx.fillRect(x + width - 2*s, y + height - 2*s, s, s);
        
        // Bordure noire épaisse
        ctx.fillStyle = '#333333';
        // Haut et bas
        ctx.fillRect(x + cornerSize, y, width - 2*cornerSize, s);
        ctx.fillRect(x + cornerSize, y + height - s, width - 2*cornerSize, s);
        // Gauche et droite
        ctx.fillRect(x, y + cornerSize, s, height - 2*cornerSize);
        ctx.fillRect(x + width - s, y + cornerSize, s, height - 2*cornerSize);
        
        // Coins bordure
        ctx.fillRect(x + s, y, s, s);
        ctx.fillRect(x, y + s, s, s);
        ctx.fillRect(x + width - 2*s, y, s, s);
        ctx.fillRect(x + width - s, y + s, s, s);
        ctx.fillRect(x + s, y + height - s, s, s);
        ctx.fillRect(x, y + height - 2*s, s, s);
        ctx.fillRect(x + width - 2*s, y + height - s, s, s);
        ctx.fillRect(x + width - s, y + height - 2*s, s, s);
        
        // Icône 💭 en pixel art
        ctx.fillStyle = '#666666';
        const iconX = x + padding;
        const iconY = y + padding;
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('💭', iconX, iconY);
        
        // Texte
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'left';
        lines.forEach((line, i) => {
            ctx.fillText(line, x + padding + 20, y + padding + i * lineHeight);
        });
        
        // Pointe triangulaire vers le bas (au milieu)
        const pointerX = x + width / 2;
        const pointerY = y + height;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(pointerX - 2*s, pointerY, 4*s, s);
        ctx.fillRect(pointerX - s, pointerY + s, 2*s, s);
        ctx.fillRect(pointerX, pointerY + 2*s, s, s);
        
        // Bordure pointe
        ctx.fillStyle = '#333333';
        ctx.fillRect(pointerX - 3*s, pointerY, s, s);
        ctx.fillRect(pointerX - 2*s, pointerY + s, s, s);
        ctx.fillRect(pointerX - s, pointerY + 2*s, s, s);
        ctx.fillRect(pointerX + 2*s, pointerY, s, s);
        ctx.fillRect(pointerX + s, pointerY + s, s, s);
        ctx.fillRect(pointerX, pointerY + 2*s, s, s);
    }
    
    /**
     * Dessine un réservoir d'eau en pixel art (carburant)
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {number} width - Largeur
     * @param {number} height - Hauteur
     */
    drawVoxelWaterTank(x, y, width, height) {
        const ctx = this.ctx;
        const s = 3; // Taille d'un pixel
        
        // BARIL bleu clair
        ctx.fillStyle = '#00BFFF';
        ctx.fillRect(x + 2*s, y + 2*s, width - 4*s, height - 4*s);
        
        // Ombres pour volume
        ctx.fillStyle = '#0099CC';
        ctx.fillRect(x + width - 4*s, y + 3*s, 2*s, height - 6*s); // Côté droit
        ctx.fillRect(x + 3*s, y + height - 5*s, width - 6*s, 2*s); // Bas
        
        // Bandes métalliques (cerclage du baril)
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 2*s, y + 3*s, width - 4*s, s);
        ctx.fillRect(x + 2*s, y + height/2 - s, width - 4*s, s);
        ctx.fillRect(x + 2*s, y + height - 4*s, width - 4*s, s);
        
        // Bordure noire du baril
        ctx.fillStyle = '#000000';
        // Haut
        ctx.fillRect(x + 2*s, y + s, width - 4*s, s);
        // Bas
        ctx.fillRect(x + 2*s, y + height - 2*s, width - 4*s, s);
        // Gauche
        ctx.fillRect(x + s, y + 2*s, s, height - 4*s);
        // Droite
        ctx.fillRect(x + width - 2*s, y + 2*s, s, height - 4*s);
        
        // Coins
        ctx.fillRect(x + 2*s, y + 2*s, s, s);
        ctx.fillRect(x + width - 3*s, y + 2*s, s, s);
        ctx.fillRect(x + 2*s, y + height - 3*s, s, s);
        ctx.fillRect(x + width - 3*s, y + height - 3*s, s, s);
        
        // GOUTTE D'EAU simple au centre (bleu vif)
        const centerX = x + width/2;
        const centerY = y + height/2;
        
        // Goutte en forme simple
        ctx.fillStyle = '#FFFFFF';
        // Haut de la goutte (pointe)
        ctx.fillRect(centerX - s, centerY - 3*s, 2*s, s);
        // Corps de la goutte
        ctx.fillRect(centerX - 2*s, centerY - 2*s, 4*s, 3*s);
        // Bas arrondi
        ctx.fillRect(centerX - 1.5*s, centerY + s, 3*s, s);
        ctx.fillRect(centerX - s, centerY + 2*s, 2*s, s);
        
        // Contour bleu foncé de la goutte
        ctx.fillStyle = '#0080FF';
        ctx.fillRect(centerX - s, centerY - 4*s, 2*s, s); // Pointe haut
        ctx.fillRect(centerX - 3*s, centerY - 2*s, s, 3*s); // Gauche
        ctx.fillRect(centerX + 2*s, centerY - 2*s, s, 3*s); // Droite
        ctx.fillRect(centerX - 2*s, centerY + 2*s, 4*s, s); // Bas
        
        // Brillance sur la goutte
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(centerX - s, centerY - s, s, s);
    }
    
    // Utilitaires de couleur
    darkenColor(color, amount) {
        return this.adjustColor(color, -amount);
    }
    
    lightenColor(color, amount) {
        return this.adjustColor(color, amount);
    }
    
    adjustColor(color, amount) {
        // Convertir hex en RGB
        const hex = color.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        // Ajuster
        r = Math.max(0, Math.min(255, r + amount * 255));
        g = Math.max(0, Math.min(255, g + amount * 255));
        b = Math.max(0, Math.min(255, b + amount * 255));
        
        // Retour en hex
        return '#' + 
            Math.round(r).toString(16).padStart(2, '0') +
            Math.round(g).toString(16).padStart(2, '0') +
            Math.round(b).toString(16).padStart(2, '0');
    }
}
