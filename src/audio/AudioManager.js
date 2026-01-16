/**
 * AudioManager - Génération de sons procéduraux
 * Sons calmes, graves et bas pour X-Sheep
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3; // Volume général calme
        this.initialized = false;
        
        // Cache des oscillateurs actifs
        this.activeOscillators = [];
    }
    
    /**
     * Initialiser le contexte audio (nécessite interaction utilisateur)
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 AudioManager initialisé');
        } catch (e) {
            console.error('Erreur initialisation audio:', e);
        }
    }
    
    /**
     * Son de vol - grave et continu
     */
    playFlyingSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime); // Fréquence grave
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        
        return {
            oscillator,
            gainNode,
            stop: () => {
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);
                setTimeout(() => oscillator.stop(), 200);
            }
        };
    }
    
    /**
     * Son de fusée - bruit blanc filtré "fuzzzzz"
     */
    playRocketSound() {
        if (!this.initialized) return;
        
        // Créer un buffer de bruit blanc
        const bufferSize = this.audioContext.sampleRate * 2;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        // Filtre passe-bande pour le son "fuzzzz"
        const bandpassFilter = this.audioContext.createBiquadFilter();
        bandpassFilter.type = 'bandpass';
        bandpassFilter.frequency.setValueAtTime(120, this.audioContext.currentTime);
        bandpassFilter.Q.setValueAtTime(1.5, this.audioContext.currentTime);
        
        // Filtre passe-bas pour rendre plus grave
        const lowpassFilter = this.audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08 * this.masterVolume, this.audioContext.currentTime + 0.1);
        
        // Connexions
        whiteNoise.connect(bandpassFilter);
        bandpassFilter.connect(lowpassFilter);
        lowpassFilter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        whiteNoise.start();
        
        return {
            source: whiteNoise,
            gainNode,
            stop: () => {
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.15);
                setTimeout(() => whiteNoise.stop(), 150);
            }
        };
    }
    
    /**
     * Son de collision - impact grave
     */
    playCollisionSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    /**
     * Son de collision percussif - "toc" / "bloc"
     */
    playBlockSound() {
        if (!this.initialized) return;
        
        // Oscillateur principal pour le "bloc"
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
        
        // Bruit blanc court pour le "toc"
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noise.start();
    }
    
    /**
     * Son de tir laser - "piou piou"
     */
    playLaserSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Son de laser montant puis descendant "piou"
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1400, this.audioContext.currentTime + 0.04);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
        
        // Enveloppe rapide
        gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * Son de bombe spéciale - "bouuifffe" sourd
     */
    playBombSound() {
        if (!this.initialized) return;
        
        // Bruit blanc pour l'attaque
        const bufferSize = this.audioContext.sampleRate * 0.6;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        // Oscillateur très grave pour le "bouuifffe"
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(25, this.audioContext.currentTime + 0.6);
        
        // Filtre passe-bas très grave
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, this.audioContext.currentTime);
        filter.frequency.linearRampToValueAtTime(60, this.audioContext.currentTime + 0.6);
        filter.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.35 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
        
        // Mixer oscillateur et bruit
        oscillator.connect(filter);
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        noise.start();
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }
    
    /**
     * Son de power-up - doux et ascendant
     */
    playPowerUpSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12 * this.masterVolume, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    /**
     * Son de collecte "gline" - cristallin ascendant
     */
    playGlineSound() {
        if (!this.initialized) return;
        
        // Deux oscillateurs pour effet cristallin
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(1600, this.audioContext.currentTime + 0.2);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(2400, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 0.2);
        osc2.stop(this.audioContext.currentTime + 0.2);
    }
    
    /**
     * Son de collecte "poc" - court et sec
     */
    playPocSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    /**
     * Son de carburant "floch/plauch" - liquide
     */
    playFuelSound() {
        if (!this.initialized) return;
        
        // Bruit blanc filtré pour l'éclaboussure
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        // Filtre passe-bande pour le son liquide
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
        filter.frequency.linearRampToValueAtTime(250, this.audioContext.currentTime + 0.15);
        filter.Q.setValueAtTime(3, this.audioContext.currentTime);
        
        // Oscillateur grave pour le "plauch"
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.15);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.18 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        // Mixer bruit et oscillateur
        noise.connect(filter);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        noise.start();
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    /**
     * Son de réservoir de carburant "ploufeu" - liquide avec feu
     */
    playPloufeuSound() {
        console.log('🎮 playPloufeuSound called, initialized:', this.initialized);
        
        if (!this.initialized) {
            console.log('⚠️ AudioManager not initialized!');
            return;
        }
        
        try {
            // Partie "plouf" - impact liquide grave
            const oscPlouf = this.audioContext.createOscillator();
            oscPlouf.type = 'sine';
            oscPlouf.frequency.setValueAtTime(300, this.audioContext.currentTime);
            oscPlouf.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.15);
            
            // Partie "feu" - sifflement aigu
            const oscFeu = this.audioContext.createOscillator();
            oscFeu.type = 'triangle';
            oscFeu.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
            oscFeu.frequency.exponentialRampToValueAtTime(1800, this.audioContext.currentTime + 0.3);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscPlouf.connect(gainNode);
            oscFeu.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscPlouf.start();
            oscFeu.start(this.audioContext.currentTime + 0.1);
            oscPlouf.stop(this.audioContext.currentTime + 0.15);
            oscFeu.stop(this.audioContext.currentTime + 0.3);
            
            console.log('🎵 Ploufeu sound started successfully');
        } catch (e) {
            console.error('❌ Error playing ploufeu sound:', e);
        }
    }
    
    /**
     * Son "ping" - résonance métallique claire
     */
    playPingSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.18 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    /**
     * Son "ploque" - impact sourd et court
     */
    ploqueSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(120, this.audioContext.currentTime + 0.12);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.12);
    }
    
    /**
     * Son de collision avec boss - "tang" métallique
     */
    playBossHitSound() {
        if (!this.initialized) return;
        
        // Oscillateur métallique aigu
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.12);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1800, this.audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.12);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.12);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 0.12);
        osc2.stop(this.audioContext.currentTime + 0.12);
    }
    
    /**
     * Son "paf" - impact sec et aigu
     */
    playPafSound() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(1500, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.06);
        
        gainNode.gain.setValueAtTime(0.18 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.06);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.06);
    }
    
    /**
     * Son "pof" - impact sourd et grave
     */
    playPofSound() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
    }
    
    /**
     * Son "pif" - impact médium et vif
     */
    playPifSound() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.07);
        
        gainNode.gain.setValueAtTime(0.19 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.07);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.07);
    }
    
    /**
     * Son de collision avec obstacle - "pingue" rebond
     */
    playObstacleSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(900, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.08);
        
        gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.08);
    }
    
    /**
     * Son ambiant - drone grave continu
     */
    playAmbientDrone() {
        if (!this.initialized) return;
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(40, this.audioContext.currentTime);
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(40.5, this.audioContext.currentTime); // Légèrement désaccordé
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08 * this.masterVolume, this.audioContext.currentTime + 2);
        
        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator1.start();
        oscillator2.start();
        
        return {
            oscillators: [oscillator1, oscillator2],
            gainNode,
            stop: () => {
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 3);
                setTimeout(() => {
                    oscillator1.stop();
                    oscillator2.stop();
                }, 3000);
            }
        };
    }
    
    /**
     * Son de boss - rugissement grave
     */
    playBossRoar() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(45, this.audioContext.currentTime + 0.5);
        oscillator.frequency.linearRampToValueAtTime(55, this.audioContext.currentTime + 1);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        filter.Q.setValueAtTime(2, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime + 0.8);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.2);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1.2);
    }
    
    /**
     * Son de mort - chute grave
     */
    playDeathSound() {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0.18 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }
    
    /**
     * Son "pouf" grave - Destruction de boss
     * Son très grave et explosif
     */
    playPoufSound() {
        if (!this.initialized) return;
        
        try {
            // Oscillateur principal très grave
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            const filter1 = this.audioContext.createBiquadFilter();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(60, this.audioContext.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.8);
            
            filter1.type = 'lowpass';
            filter1.frequency.setValueAtTime(200, this.audioContext.currentTime);
            
            gain1.gain.setValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            osc1.connect(filter1);
            filter1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            
            osc1.start();
            osc1.stop(this.audioContext.currentTime + 0.8);
            
            // Deuxième oscillateur pour l'épaisseur
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(40, this.audioContext.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(15, this.audioContext.currentTime + 0.7);
            
            gain2.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.7);
            
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);
            
            osc2.start();
            osc2.stop(this.audioContext.currentTime + 0.7);
            
        } catch (e) {
            console.error('Erreur son pouf:', e);
        }
    }
    
    /**
     * Son "pame" très grave - Destruction des boss de palier (dragon/serpent)
     * Son ultra grave et puissant avec longue résonance
     */
    playPameSound() {
        if (!this.initialized) return;
        
        try {
            // Oscillateur ultra grave principal
            const osc1 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            const filter1 = this.audioContext.createBiquadFilter();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(40, this.audioContext.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(15, this.audioContext.currentTime + 1.2);
            
            filter1.type = 'lowpass';
            filter1.frequency.setValueAtTime(150, this.audioContext.currentTime);
            
            gain1.gain.setValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.2);
            
            osc1.connect(filter1);
            filter1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            
            osc1.start();
            osc1.stop(this.audioContext.currentTime + 1.2);
            
            // Deuxième oscillateur encore plus grave pour la profondeur
            const osc2 = this.audioContext.createOscillator();
            const gain2 = this.audioContext.createGain();
            
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(25, this.audioContext.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(10, this.audioContext.currentTime + 1.0);
            
            gain2.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
            
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);
            
            osc2.start();
            osc2.stop(this.audioContext.currentTime + 1.0);
            
            // Troisième oscillateur pour la résonance
            const osc3 = this.audioContext.createOscillator();
            const gain3 = this.audioContext.createGain();
            const filter3 = this.audioContext.createBiquadFilter();
            
            osc3.type = 'sawtooth';
            osc3.frequency.setValueAtTime(30, this.audioContext.currentTime);
            osc3.frequency.exponentialRampToValueAtTime(12, this.audioContext.currentTime + 1.5);
            
            filter3.type = 'lowpass';
            filter3.frequency.setValueAtTime(100, this.audioContext.currentTime);
            filter3.Q.setValueAtTime(2, this.audioContext.currentTime);
            
            gain3.gain.setValueAtTime(0.18 * this.masterVolume, this.audioContext.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
            
            osc3.connect(filter3);
            filter3.connect(gain3);
            gain3.connect(this.audioContext.destination);
            
            osc3.start();
            osc3.stop(this.audioContext.currentTime + 1.5);
            
        } catch (e) {
            console.error('Erreur son pame:', e);
        }
    }
    
    /**
     * Son "fuzze" - Toucher le boss
     * Son fuzz avec distorsion
     */
    playFuzzeSound() {
        if (!this.initialized) return;
        
        try {
            // Oscillateur principal avec fréquence moyenne
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth'; // Onde en dents de scie pour effet fuzz
            osc.frequency.setValueAtTime(180, this.audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(120, this.audioContext.currentTime + 0.08);
            
            // Filtre passe-bande pour le caractère fuzz
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
            filter.Q.setValueAtTime(5, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.12 * this.masterVolume, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.08);
            
        } catch (e) {
            console.error('Erreur son fuzze:', e);
        }
    }
    
    /**
     * Ajuster le volume général
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    /**
     * Arrêter tous les sons
     */
    stopAll() {
        this.activeOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Déjà arrêté
            }
        });
        this.activeOscillators = [];
    }
}

// Export singleton
export const audioManager = new AudioManager();
