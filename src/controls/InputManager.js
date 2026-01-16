// InputManager.js - Gestionnaire d'entrées unifié
import { KeyboardControls } from './KeyboardControls.js';
import { MouseControls } from './MouseControls.js';
import { TouchControls } from './TouchControls.js';

export class InputManager {
    constructor(game) {
        this.game = game;
        this.keyboard = new KeyboardControls(game);
        this.mouse = new MouseControls(game);
        this.touch = new TouchControls(game);
    }
    
    destroy() {
        this.keyboard.destroy();
        this.mouse.destroy();
        this.touch.destroy();
    }
}
