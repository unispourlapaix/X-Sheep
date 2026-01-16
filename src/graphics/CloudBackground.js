/**
 * CloudBackground.js - Système de nuages défilants pour le niveau 2
 */

export class CloudBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.clouds = [];
        this.skyGradient = null;
        
        this.initSky();
        this.spawnClouds();
    }
    
    initSky() {
        // Créer un dégradé de ciel
        const ctx = this.canvas.getContext('2d');
        this.skyGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        this.skyGradient.addColorStop(0, '#87CEEB'); // Bleu ciel clair
        this.skyGradient.addColorStop(1, '#E0F6FF'); // Bleu très clair en bas
    }
    
    spawnClouds() {
        // Créer des nuages initiaux
        const cloudCount = 8;
        for (let i = 0; i < cloudCount; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.7, // 70% de la hauteur
                width: 80 + Math.random() * 120,
                height: 40 + Math.random() * 60,
                speed: 0.5 + Math.random() * 1.5,
                opacity: 0.6 + Math.random() * 0.3
            });
        }
    }
    
    update() {
        // Faire défiler les nuages vers la gauche
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            
            // Réapparaître à droite quand sorti à gauche
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width + 50;
                cloud.y = Math.random() * this.canvas.height * 0.7;
                cloud.width = 80 + Math.random() * 120;
                cloud.height = 40 + Math.random() * 60;
                cloud.speed = 0.5 + Math.random() * 1.5;
                cloud.opacity = 0.6 + Math.random() * 0.3;
            }
        });
    }
    
    render(ctx) {
        // Dessiner le ciel en dégradé
        ctx.fillStyle = this.skyGradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner les nuages
        this.clouds.forEach(cloud => {
            ctx.save();
            ctx.globalAlpha = cloud.opacity;
            
            // Nuage stylisé avec plusieurs cercles
            ctx.fillStyle = '#FFFFFF';
            
            const centerX = cloud.x + cloud.width / 2;
            const centerY = cloud.y + cloud.height / 2;
            const radius = cloud.height / 2;
            
            // Corps principal du nuage (3 cercles)
            ctx.beginPath();
            ctx.arc(centerX - cloud.width * 0.25, centerY, radius * 0.8, 0, Math.PI * 2);
            ctx.arc(centerX, centerY - radius * 0.3, radius, 0, Math.PI * 2);
            ctx.arc(centerX + cloud.width * 0.25, centerY, radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            // Base du nuage (ellipse)
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + radius * 0.3, cloud.width * 0.45, radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
}
