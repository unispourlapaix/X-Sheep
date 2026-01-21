// PixelIconCache.js - Cache d'icônes en pixel art
export class PixelIconCache {
    constructor() {
        this.cache = new Map();
        this.blockSize = 2; // Taille d'un pixel
    }
    
    // Obtenir une icône (crée si nécessaire)
    getIcon(emoji, size = 32) {
        const key = `${emoji}_${size}`;
        
        if (!this.cache.has(key)) {
            this.cache.set(key, this.createIcon(emoji, size));
        }
        
        return this.cache.get(key);
    }
    
    // Créer une icône en pixel art
    createIcon(emoji, size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Dessiner selon l'emoji
        switch(emoji) {
            case '♿': this.drawWheelchair(ctx, size); break;
            case '🚗': this.drawCar(ctx, size); break;
            case '⚰️': this.drawCoffin(ctx, size); break;
            case '🏦': this.drawSafe(ctx, size); break;
            case '🏠': this.drawHouse(ctx, size); break;
            case '🐺': this.drawWolf(ctx, size); break;
            case '🐑': this.drawSheep(ctx, size); break;
            case '📦': this.drawBox(ctx, size); break;
            case '💀': this.drawSkull(ctx, size); break;
            case '🎗️': this.drawRibbon(ctx, size); break;
            case '☢️': this.drawRadiation(ctx, size); break;
            case '☄️': this.drawMeteor(ctx, size); break;
            case '⏰': this.drawClock(ctx, size); break;
            case '😡': this.drawAngry(ctx, size); break;
            case '🌀': this.drawSpiral(ctx, size); break;
            case '💰': this.drawMoneyBag(ctx, size); break;
            case '💋': this.drawLips(ctx, size); break;
            case '🤝': this.drawHandshake(ctx, size); break;
            case '👥': this.drawPeople(ctx, size); break;
            case '⛓️': this.drawChain(ctx, size); break;
            case '🏭': this.drawFactory(ctx, size); break;
            case '💧': this.drawWater(ctx, size); break;
            case '🐟': this.drawFish(ctx, size); break;
            default: this.drawDefault(ctx, size, emoji);
        }
        
        return canvas;
    }
    
    // Dessiner pixel par pixel
    drawPixel(ctx, x, y, color, pixelSize = 2) {
        ctx.fillStyle = color;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
    
    // Fauteuil roulant ♿
    drawWheelchair(ctx, size) {
        const p = this.blockSize;
        // Roue
        this.drawPixel(ctx, 3, 10, '#666', p);
        this.drawPixel(ctx, 4, 9, '#666', p);
        this.drawPixel(ctx, 5, 9, '#666', p);
        this.drawPixel(ctx, 6, 10, '#666', p);
        this.drawPixel(ctx, 4, 11, '#666', p);
        this.drawPixel(ctx, 5, 11, '#666', p);
        // Siège
        this.drawPixel(ctx, 5, 7, '#888', p);
        this.drawPixel(ctx, 6, 7, '#888', p);
        this.drawPixel(ctx, 7, 7, '#888', p);
        this.drawPixel(ctx, 7, 8, '#888', p);
        this.drawPixel(ctx, 7, 9, '#888', p);
        // Dossier
        this.drawPixel(ctx, 8, 5, '#888', p);
        this.drawPixel(ctx, 8, 6, '#888', p);
        this.drawPixel(ctx, 8, 7, '#888', p);
    }
    
    // Voiture 🚗
    drawCar(ctx, size) {
        const p = this.blockSize;
        // Carrosserie
        for (let x = 3; x < 10; x++) {
            this.drawPixel(ctx, x, 8, '#FF0000', p);
            this.drawPixel(ctx, x, 9, '#FF0000', p);
        }
        // Toit
        for (let x = 4; x < 9; x++) {
            this.drawPixel(ctx, x, 7, '#CC0000', p);
        }
        // Fenêtres
        this.drawPixel(ctx, 5, 7, '#87CEEB', p);
        this.drawPixel(ctx, 7, 7, '#87CEEB', p);
        // Roues
        this.drawPixel(ctx, 4, 10, '#000', p);
        this.drawPixel(ctx, 8, 10, '#000', p);
    }
    
    // Cercueil ⚰️
    drawCoffin(ctx, size) {
        const p = this.blockSize;
        const brown = '#8B4513';
        // Forme de cercueil
        for (let y = 4; y < 11; y++) {
            const width = y < 7 ? 4 : 6;
            const startX = y < 7 ? 5 : 4;
            for (let x = 0; x < width; x++) {
                this.drawPixel(ctx, startX + x, y, brown, p);
            }
        }
        // Croix
        this.drawPixel(ctx, 6, 6, '#FFD700', p);
        this.drawPixel(ctx, 5, 7, '#FFD700', p);
        this.drawPixel(ctx, 6, 7, '#FFD700', p);
        this.drawPixel(ctx, 7, 7, '#FFD700', p);
    }
    
    // Coffre-fort 🏦
    drawSafe(ctx, size) {
        const p = this.blockSize;
        // Corps du coffre
        for (let y = 5; y < 11; y++) {
            for (let x = 4; x < 10; x++) {
                this.drawPixel(ctx, x, y, '#666', p);
            }
        }
        // Porte
        for (let y = 6; y < 10; y++) {
            for (let x = 5; x < 9; x++) {
                this.drawPixel(ctx, x, y, '#888', p);
            }
        }
        // Poignée
        this.drawPixel(ctx, 7, 8, '#FFD700', p);
        this.drawPixel(ctx, 8, 8, '#FFD700', p);
    }
    
    // Maison 🏠
    drawHouse(ctx, size) {
        const p = this.blockSize;
        // Murs
        for (let y = 7; y < 11; y++) {
            for (let x = 4; x < 10; x++) {
                this.drawPixel(ctx, x, y, '#CD853F', p);
            }
        }
        // Toit
        this.drawPixel(ctx, 6, 5, '#8B0000', p);
        this.drawPixel(ctx, 7, 5, '#8B0000', p);
        for (let x = 5; x < 9; x++) {
            this.drawPixel(ctx, x, 6, '#8B0000', p);
        }
        for (let x = 4; x < 10; x++) {
            this.drawPixel(ctx, x, 7, '#8B0000', p);
        }
        // Porte
        this.drawPixel(ctx, 6, 9, '#654321', p);
        this.drawPixel(ctx, 6, 10, '#654321', p);
    }
    
    // Loup 🐺
    drawWolf(ctx, size) {
        const p = this.blockSize;
        const gray = '#808080';
        // Corps
        for (let x = 4; x < 9; x++) {
            this.drawPixel(ctx, x, 8, gray, p);
            this.drawPixel(ctx, x, 9, gray, p);
        }
        // Tête
        this.drawPixel(ctx, 8, 6, gray, p);
        this.drawPixel(ctx, 9, 7, gray, p);
        this.drawPixel(ctx, 9, 8, gray, p);
        // Oreilles
        this.drawPixel(ctx, 8, 5, gray, p);
        this.drawPixel(ctx, 10, 6, gray, p);
        // Yeux
        this.drawPixel(ctx, 9, 7, '#FF0000', p);
        // Pattes
        this.drawPixel(ctx, 5, 10, gray, p);
        this.drawPixel(ctx, 7, 10, gray, p);
    }
    
    // Mouton 🐑
    drawSheep(ctx, size) {
        const p = this.blockSize;
        // Corps blanc
        for (let y = 7; y < 10; y++) {
            for (let x = 4; x < 8; x++) {
                this.drawPixel(ctx, x, y, '#FFF', p);
            }
        }
        // Tête noire
        this.drawPixel(ctx, 8, 7, '#000', p);
        this.drawPixel(ctx, 8, 8, '#000', p);
        // Pattes noires
        this.drawPixel(ctx, 4, 10, '#000', p);
        this.drawPixel(ctx, 7, 10, '#000', p);
    }
    
    // Boîte 📦
    drawBox(ctx, size) {
        const p = this.blockSize;
        const brown = '#8B4513';
        // Carton
        for (let y = 6; y < 11; y++) {
            for (let x = 4; x < 10; x++) {
                this.drawPixel(ctx, x, y, brown, p);
            }
        }
        // Ruban adhésif
        for (let x = 4; x < 10; x++) {
            this.drawPixel(ctx, x, 8, '#D2691E', p);
        }
        this.drawPixel(ctx, 7, 6, '#D2691E', p);
        this.drawPixel(ctx, 7, 7, '#D2691E', p);
        this.drawPixel(ctx, 7, 9, '#D2691E', p);
        this.drawPixel(ctx, 7, 10, '#D2691E', p);
    }
    
    // Crâne 💀
    drawSkull(ctx, size) {
        const p = this.blockSize;
        // Crâne
        for (let y = 5; y < 9; y++) {
            for (let x = 5; x < 9; x++) {
                this.drawPixel(ctx, x, y, '#FFF', p);
            }
        }
        // Yeux
        this.drawPixel(ctx, 5, 6, '#000', p);
        this.drawPixel(ctx, 8, 6, '#000', p);
        // Nez
        this.drawPixel(ctx, 7, 7, '#000', p);
        // Mâchoire
        for (let x = 5; x < 9; x++) {
            this.drawPixel(ctx, x, 9, '#FFF', p);
        }
        this.drawPixel(ctx, 6, 10, '#FFF', p);
        this.drawPixel(ctx, 7, 10, '#FFF', p);
    }
    
    // Ruban 🎗️
    drawRibbon(ctx, size) {
        const p = this.blockSize;
        const pink = '#FFB6C1';
        // Boucle
        this.drawPixel(ctx, 5, 5, pink, p);
        this.drawPixel(ctx, 6, 5, pink, p);
        this.drawPixel(ctx, 7, 5, pink, p);
        this.drawPixel(ctx, 8, 5, pink, p);
        this.drawPixel(ctx, 5, 6, pink, p);
        this.drawPixel(ctx, 8, 6, pink, p);
        this.drawPixel(ctx, 5, 7, pink, p);
        this.drawPixel(ctx, 8, 7, pink, p);
        this.drawPixel(ctx, 6, 7, pink, p);
        this.drawPixel(ctx, 7, 7, pink, p);
        // Rubans
        this.drawPixel(ctx, 6, 8, pink, p);
        this.drawPixel(ctx, 7, 8, pink, p);
        this.drawPixel(ctx, 5, 9, pink, p);
        this.drawPixel(ctx, 8, 9, pink, p);
        this.drawPixel(ctx, 4, 10, pink, p);
        this.drawPixel(ctx, 9, 10, pink, p);
    }
    
    // Radiation ☢️
    drawRadiation(ctx, size) {
        const p = this.blockSize;
        const yellow = '#FFFF00';
        // Centre
        this.drawPixel(ctx, 6, 7, yellow, p);
        this.drawPixel(ctx, 7, 7, yellow, p);
        this.drawPixel(ctx, 6, 8, yellow, p);
        this.drawPixel(ctx, 7, 8, yellow, p);
        // 3 branches
        this.drawPixel(ctx, 6, 5, yellow, p);
        this.drawPixel(ctx, 7, 5, yellow, p);
        this.drawPixel(ctx, 4, 9, yellow, p);
        this.drawPixel(ctx, 5, 10, yellow, p);
        this.drawPixel(ctx, 9, 9, yellow, p);
        this.drawPixel(ctx, 8, 10, yellow, p);
    }
    
    // Météorite ☄️
    drawMeteor(ctx, size) {
        const p = this.blockSize;
        // Roche
        this.drawPixel(ctx, 7, 5, '#8B4513', p);
        this.drawPixel(ctx, 6, 6, '#8B4513', p);
        this.drawPixel(ctx, 7, 6, '#8B4513', p);
        this.drawPixel(ctx, 8, 6, '#8B4513', p);
        this.drawPixel(ctx, 7, 7, '#8B4513', p);
        // Flammes
        this.drawPixel(ctx, 5, 7, '#FF6600', p);
        this.drawPixel(ctx, 4, 8, '#FF6600', p);
        this.drawPixel(ctx, 3, 9, '#FFD700', p);
        this.drawPixel(ctx, 2, 10, '#FFD700', p);
    }
    
    // Horloge ⏰
    drawClock(ctx, size) {
        const p = this.blockSize;
        // Cadran
        for (let y = 6; y < 10; y++) {
            for (let x = 5; x < 9; x++) {
                this.drawPixel(ctx, x, y, '#FFF', p);
            }
        }
        // Contour
        this.drawPixel(ctx, 4, 6, '#000', p);
        this.drawPixel(ctx, 4, 9, '#000', p);
        this.drawPixel(ctx, 9, 6, '#000', p);
        this.drawPixel(ctx, 9, 9, '#000', p);
        // Aiguilles
        this.drawPixel(ctx, 7, 7, '#000', p);
        this.drawPixel(ctx, 7, 8, '#000', p);
        this.drawPixel(ctx, 8, 8, '#000', p);
    }
    
    // Colère 😡
    drawAngry(ctx, size) {
        const p = this.blockSize;
        // Visage
        for (let y = 5; y < 10; y++) {
            for (let x = 5; x < 9; x++) {
                this.drawPixel(ctx, x, y, '#FF6B6B', p);
            }
        }
        // Sourcils froncés
        this.drawPixel(ctx, 5, 6, '#000', p);
        this.drawPixel(ctx, 6, 5, '#000', p);
        this.drawPixel(ctx, 8, 6, '#000', p);
        this.drawPixel(ctx, 7, 5, '#000', p);
        // Yeux
        this.drawPixel(ctx, 5, 7, '#000', p);
        this.drawPixel(ctx, 8, 7, '#000', p);
        // Bouche
        this.drawPixel(ctx, 6, 9, '#000', p);
        this.drawPixel(ctx, 7, 9, '#000', p);
    }
    
    // Spirale 🌀
    drawSpiral(ctx, size) {
        const p = this.blockSize;
        const blue = '#4169E1';
        // Spirale
        this.drawPixel(ctx, 7, 5, blue, p);
        this.drawPixel(ctx, 6, 6, blue, p);
        this.drawPixel(ctx, 7, 6, blue, p);
        this.drawPixel(ctx, 8, 6, blue, p);
        this.drawPixel(ctx, 5, 7, blue, p);
        this.drawPixel(ctx, 8, 7, blue, p);
        this.drawPixel(ctx, 5, 8, blue, p);
        this.drawPixel(ctx, 6, 8, blue, p);
        this.drawPixel(ctx, 7, 8, blue, p);
        this.drawPixel(ctx, 8, 8, blue, p);
        this.drawPixel(ctx, 7, 9, blue, p);
    }
    
    // Sac d'argent 💰
    drawMoneyBag(ctx, size) {
        const p = this.blockSize;
        // Sac
        for (let y = 7; y < 11; y++) {
            const width = y < 9 ? 4 : 6;
            const startX = y < 9 ? 5 : 4;
            for (let x = 0; x < width; x++) {
                this.drawPixel(ctx, startX + x, y, '#90EE90', p);
            }
        }
        // Signe $
        this.drawPixel(ctx, 7, 8, '#FFD700', p);
        this.drawPixel(ctx, 6, 9, '#FFD700', p);
        this.drawPixel(ctx, 7, 9, '#FFD700', p);
        this.drawPixel(ctx, 8, 9, '#FFD700', p);
        this.drawPixel(ctx, 7, 10, '#FFD700', p);
    }
    
    // Lèvres 💋
    drawLips(ctx, size) {
        const p = this.blockSize;
        const red = '#FF0000';
        // Lèvre supérieure
        this.drawPixel(ctx, 5, 7, red, p);
        this.drawPixel(ctx, 6, 6, red, p);
        this.drawPixel(ctx, 7, 7, red, p);
        this.drawPixel(ctx, 8, 6, red, p);
        this.drawPixel(ctx, 9, 7, red, p);
        // Lèvre inférieure
        this.drawPixel(ctx, 5, 8, red, p);
        this.drawPixel(ctx, 6, 9, red, p);
        this.drawPixel(ctx, 7, 9, red, p);
        this.drawPixel(ctx, 8, 9, red, p);
        this.drawPixel(ctx, 9, 8, red, p);
    }
    
    // Poignée de main 🤝
    drawHandshake(ctx, size) {
        const p = this.blockSize;
        const skin = '#FFD7A8';
        // Main gauche
        this.drawPixel(ctx, 4, 7, skin, p);
        this.drawPixel(ctx, 5, 7, skin, p);
        this.drawPixel(ctx, 5, 8, skin, p);
        // Main droite
        this.drawPixel(ctx, 8, 7, skin, p);
        this.drawPixel(ctx, 9, 7, skin, p);
        this.drawPixel(ctx, 8, 8, skin, p);
        // Poignée
        this.drawPixel(ctx, 6, 7, skin, p);
        this.drawPixel(ctx, 7, 7, skin, p);
        this.drawPixel(ctx, 6, 8, skin, p);
        this.drawPixel(ctx, 7, 8, skin, p);
    }
    
    // Personnes 👥
    drawPeople(ctx, size) {
        const p = this.blockSize;
        // Personne 1
        this.drawPixel(ctx, 5, 5, '#FFD7A8', p);
        this.drawPixel(ctx, 5, 6, '#4169E1', p);
        this.drawPixel(ctx, 5, 7, '#4169E1', p);
        // Personne 2
        this.drawPixel(ctx, 8, 5, '#FFD7A8', p);
        this.drawPixel(ctx, 8, 6, '#FF69B4', p);
        this.drawPixel(ctx, 8, 7, '#FF69B4', p);
    }
    
    // Chaîne ⛓️
    drawChain(ctx, size) {
        const p = this.blockSize;
        const gray = '#808080';
        // Maillons
        this.drawPixel(ctx, 5, 5, gray, p);
        this.drawPixel(ctx, 6, 5, gray, p);
        this.drawPixel(ctx, 5, 6, gray, p);
        this.drawPixel(ctx, 6, 6, gray, p);
        
        this.drawPixel(ctx, 7, 7, gray, p);
        this.drawPixel(ctx, 8, 7, gray, p);
        this.drawPixel(ctx, 7, 8, gray, p);
        this.drawPixel(ctx, 8, 8, gray, p);
        
        this.drawPixel(ctx, 5, 9, gray, p);
        this.drawPixel(ctx, 6, 9, gray, p);
        this.drawPixel(ctx, 5, 10, gray, p);
        this.drawPixel(ctx, 6, 10, gray, p);
    }
    
    // Usine 🏭
    drawFactory(ctx, size) {
        const p = this.blockSize;
        // Bâtiment
        for (let y = 7; y < 11; y++) {
            for (let x = 4; x < 9; x++) {
                this.drawPixel(ctx, x, y, '#666', p);
            }
        }
        // Cheminées
        this.drawPixel(ctx, 5, 5, '#888', p);
        this.drawPixel(ctx, 5, 6, '#888', p);
        this.drawPixel(ctx, 7, 4, '#888', p);
        this.drawPixel(ctx, 7, 5, '#888', p);
        this.drawPixel(ctx, 7, 6, '#888', p);
        // Fumée
        this.drawPixel(ctx, 5, 4, '#AAA', p);
        this.drawPixel(ctx, 7, 3, '#AAA', p);
    }
    
    // Eau 💧
    drawWater(ctx, size) {
        const p = this.blockSize;
        const blue = '#00BFFF';
        // Goutte
        this.drawPixel(ctx, 7, 5, blue, p);
        this.drawPixel(ctx, 6, 6, blue, p);
        this.drawPixel(ctx, 7, 6, blue, p);
        this.drawPixel(ctx, 8, 6, blue, p);
        this.drawPixel(ctx, 6, 7, blue, p);
        this.drawPixel(ctx, 7, 7, blue, p);
        this.drawPixel(ctx, 8, 7, blue, p);
        this.drawPixel(ctx, 6, 8, blue, p);
        this.drawPixel(ctx, 7, 8, blue, p);
        this.drawPixel(ctx, 8, 8, blue, p);
        this.drawPixel(ctx, 7, 9, blue, p);
    }
    
    // Poisson 🐟
    drawFish(ctx, size) {
        const p = this.blockSize;
        const orange = '#FFA500';
        // Corps
        this.drawPixel(ctx, 6, 7, orange, p);
        this.drawPixel(ctx, 7, 7, orange, p);
        this.drawPixel(ctx, 8, 7, orange, p);
        this.drawPixel(ctx, 7, 6, orange, p);
        this.drawPixel(ctx, 7, 8, orange, p);
        // Queue
        this.drawPixel(ctx, 5, 6, orange, p);
        this.drawPixel(ctx, 5, 8, orange, p);
        // Œil
        this.drawPixel(ctx, 8, 7, '#000', p);
    }
    
    // Icône par défaut (carré coloré)
    drawDefault(ctx, size, emoji) {
        const p = this.blockSize;
        const hash = emoji.charCodeAt(0) % 360;
        const color = `hsl(${hash}, 70%, 50%)`;
        
        for (let y = 5; y < 10; y++) {
            for (let x = 5; x < 10; x++) {
                this.drawPixel(ctx, x, y, color, p);
            }
        }
    }
}
