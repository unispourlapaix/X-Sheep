// ResponsiveHelper.js - Utilitaires pour l'affichage responsive
export class ResponsiveHelper {
    static isMobileLandscape() {
        return window.innerWidth <= 900 && 
               window.innerWidth > window.innerHeight;
    }
    
    static getScaleFactor() {
        if (this.isMobileLandscape()) {
            // Facteur d'échelle basé sur la largeur de l'écran
            // 900px = 1.0, 600px = 0.8, 400px = 0.6
            const width = window.innerWidth;
            return Math.max(0.6, Math.min(1.0, width / 900));
        }
        return 1.0;
    }
    
    static getFontSize(baseSize) {
        return Math.floor(baseSize * this.getScaleFactor());
    }
    
    static getUISize(baseSize) {
        return Math.floor(baseSize * this.getScaleFactor());
    }
    
    static getMargin(baseMargin) {
        const scale = this.getScaleFactor();
        return Math.floor(baseMargin * scale);
    }
    
    static getCanvasSize() {
        if (this.isMobileLandscape()) {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
        return {
            width: 800,
            height: 500
        };
    }
}
