// ModeSelector.js - Sélection de mode (si besoin de logique avancée)
export class ModeSelector {
    constructor() {
        this.selectedMode = null;
    }
    
    selectAdventure() {
        this.selectedMode = 'adventure';
        return this.selectedMode;
    }
    
    selectEndless() {
        this.selectedMode = 'endless';
        return this.selectedMode;
    }
    
    getSelected() {
        return this.selectedMode;
    }
}
