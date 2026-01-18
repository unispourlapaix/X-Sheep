/**
 * Lighthouse.js - Phare rouge et blanc avec faisceau lumineux rotatif
 */

export class Lighthouse {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 120;
        this.rotation = 0; // Angle du faisceau
        this.rotationSpeed = 0.02; // Vitesse de rotation
        this.beamActive = true;
        this.blinkTimer = 0;
        this.blinkDuration = 120; // Clignotement toutes les 2 secondes
    }

    update() {
        // Rotation continue du faisceau
        this.rotation += this.rotationSpeed;
        if (this.rotation > Math.PI * 2) {
            this.rotation = 0;
        }

        // Clignotement du phare
        this.blinkTimer++;
        if (this.blinkTimer >= this.blinkDuration) {
            this.blinkTimer = 0;
        }
    }

    render(ctx) {
        const beamIntensity = this.blinkTimer < this.blinkDuration / 2 ? 1 : 0.5;

        // Dessiner le faisceau lumineux en premier (derrière le phare)
        if (this.beamActive) {
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + 30);
            ctx.rotate(this.rotation);

            // Faisceau principal
            const gradient = ctx.createLinearGradient(0, 0, 600, 0);
            gradient.addColorStop(0, `rgba(255, 255, 200, ${0.4 * beamIntensity})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 150, ${0.2 * beamIntensity})`);
            gradient.addColorStop(1, `rgba(255, 255, 100, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(600, -80);
            ctx.lineTo(600, 80);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Base du phare (rocher/plateforme)
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(this.x - 10, this.y + this.height - 10, this.width + 20, 20);

        // Tour du phare (rayures rouges et blanches)
        const stripeHeight = this.height / 6;
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#DC143C';
            ctx.fillRect(this.x, this.y + this.height - (i + 1) * stripeHeight, this.width, stripeHeight);
        }

        // Contour de la tour
        ctx.strokeStyle = '#1C1C1C';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Toit du phare (rouge foncé)
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y - 15);
        ctx.lineTo(this.x + this.width + 5, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lanterne (salle vitrée en haut)
        const lanternHeight = 25;
        ctx.fillStyle = this.blinkTimer < this.blinkDuration / 2 ? '#FFFF88' : '#FFCC66';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, lanternHeight);
        
        // Vitres de la lanterne
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            const x = this.x + 5 + (this.width - 10) * (i / 4);
            ctx.beginPath();
            ctx.moveTo(x, this.y + 5);
            ctx.lineTo(x, this.y + 5 + lanternHeight);
            ctx.stroke();
        }

        // Lueur autour du phare quand allumé
        if (this.blinkTimer < this.blinkDuration / 2) {
            const glowGradient = ctx.createRadialGradient(
                this.x + this.width / 2, 
                this.y + 15, 
                10,
                this.x + this.width / 2, 
                this.y + 15, 
                60
            );
            glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
            glowGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(this.x - 30, this.y - 30, this.width + 60, 80);
        }
    }
}
