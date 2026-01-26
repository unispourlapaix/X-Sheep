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
        
        // Son de fusée continu
        this.rocketSound = null;
        
        // Musique de fond
        this.backgroundMusic = null;
        this.musicVolume = 0.5;
        this.currentTrack = null;
        const base = import.meta.env.BASE_URL;
        this.musicTracks = [
            `${base}music/Ilsuffitpas.mp3`,
            `${base}music/LavoixducielmurmurelAmour.mp3`,
            `${base}music/Jojo-notre-beau-Petit-mouton.mp3`,
            `${base}music/DansQuelMondeOnVit.mp3`,
            `${base}music/Nabandonnejamais.mp3`,
            `${base}music/forteresses_de_peur_xT.mp3`
        ];
        this.currentTrackIndex = 0;
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
            
            // Ne plus démarrer automatiquement la musique ici
            // La musique sera démarrée au début de chaque niveau
        } catch (e) {
            console.error('Erreur initialisation audio:', e);
        }
    }
    
    /**
     * Démarrer la musique de fond en autoplay
     */
    startBackgroundMusic() {
        // Si la musique existe déjà et n'est pas en pause, la reprendre
        if (this.backgroundMusic) {
            if (this.backgroundMusic.paused) {
                this.backgroundMusic.play().catch(err => {
                    console.log('⚠️ Erreur reprise musique:', err.message);
                });
                console.log('🎵 Musique reprise');
            }
            return; // Déjà en cours
        }
        
        this.backgroundMusic = new Audio();
        this.backgroundMusic.volume = this.musicVolume;
        this.backgroundMusic.loop = false; // On gère manuellement pour changer de piste
        
        // Charger et jouer la première piste
        this.playNextTrack();
        
        // Écouter la fin de la piste pour passer à la suivante
        this.backgroundMusic.addEventListener('ended', () => {
            this.playNextTrack();
        });
        
        console.log('🎵 Musique de fond démarrée en autoplay');
    }
    
    /**
     * Jouer la piste suivante
     */
    playNextTrack() {
        if (!this.backgroundMusic) return;
        
        this.currentTrack = this.musicTracks[this.currentTrackIndex];
        this.backgroundMusic.src = this.currentTrack;
        
        // Tenter de jouer (peut échouer si pas d'interaction utilisateur)
        this.backgroundMusic.play().catch(err => {
            console.log('⚠️ Autoplay bloqué, en attente interaction utilisateur:', err.message);
        });
        
        console.log(`🎵 Lecture: ${this.currentTrack}`);
        
        // Passer à la piste suivante (boucle)
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicTracks.length;
    }
    
    /**
     * Mettre en pause la musique
     */
    pauseMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }
    
    /**
     * Reprendre la musique
     */
    resumeMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.play().catch(err => {
                console.log('Erreur reprise musique:', err);
            });
        }
    }
    
    /**
     * Changer le volume de la musique (0 à 1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
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
     * Son de fusée continu - bruit blanc filtré "fizezzeu"
     * Retourne un objet avec méthode stop()
     */
    startRocketSound() {
        if (!this.initialized) return null;
        if (this.rocketSound) return this.rocketSound; // Déjà en cours
        
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
        
        // Filtre passe-bande pour le son "fizezzeu"
        const bandpassFilter = this.audioContext.createBiquadFilter();
        bandpassFilter.type = 'bandpass';
        bandpassFilter.frequency.setValueAtTime(150, this.audioContext.currentTime);
        bandpassFilter.Q.setValueAtTime(2.0, this.audioContext.currentTime);
        
        // Filtre passe-bas pour adoucir
        const lowpassFilter = this.audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.setValueAtTime(400, this.audioContext.currentTime);
        
        // Oscillateur supplémentaire pour variation "zeu zeu"
        const modulator = this.audioContext.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(3, this.audioContext.currentTime); // Oscillation lente
        
        const modulatorGain = this.audioContext.createGain();
        modulatorGain.gain.setValueAtTime(30, this.audioContext.currentTime);
        
        modulator.connect(modulatorGain);
        modulatorGain.connect(bandpassFilter.frequency);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime + 0.2);
        
        // Connexions
        whiteNoise.connect(bandpassFilter);
        bandpassFilter.connect(lowpassFilter);
        lowpassFilter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        whiteNoise.start();
        modulator.start();
        
        this.rocketSound = {
            source: whiteNoise,
            modulator: modulator,
            gainNode,
            stop: () => {
                if (!this.rocketSound) return;
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
                setTimeout(() => {
                    try {
                        whiteNoise.stop();
                        modulator.stop();
                    } catch(e) {}
                    this.rocketSound = null;
                }, 300);
            }
        };
        
        return this.rocketSound;
    }
    
    /**
     * Arrêter le son de fusée
     */
    stopRocketSound() {
        if (this.rocketSound) {
            this.rocketSound.stop();
        }
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
     * Son d'arme anti-boss - puissant et métallique "CLANG"
     */
    playWeaponSound() {
        if (!this.initialized) return;
        
        const currentTime = this.audioContext.currentTime;
        
        // Oscillateur principal - son métallique grave
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(200, currentTime);
        osc1.frequency.exponentialRampToValueAtTime(150, currentTime + 0.3);
        
        // Oscillateur secondaire - harmonique métallique
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(400, currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, currentTime + 0.3);
        
        // Bruit pour l'impact métallique
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        // Filtre pour le bruit métallique
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2000, currentTime);
        noiseFilter.Q.setValueAtTime(5, currentTime);
        
        // Gains séparés
        const gain1 = this.audioContext.createGain();
        gain1.gain.setValueAtTime(0.2 * this.masterVolume, currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        
        const gain2 = this.audioContext.createGain();
        gain2.gain.setValueAtTime(0.15 * this.masterVolume, currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3 * this.masterVolume, currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
        
        // Connexions
        osc1.connect(gain1);
        osc2.connect(gain2);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        
        gain1.connect(this.audioContext.destination);
        gain2.connect(this.audioContext.destination);
        noiseGain.connect(this.audioContext.destination);
        
        // Démarrage
        osc1.start(currentTime);
        osc2.start(currentTime);
        noise.start(currentTime);
        
        osc1.stop(currentTime + 0.3);
        osc2.stop(currentTime + 0.3);
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
     * Son de tourbillon (whirlpool) - aspiration tournante
     */
    playWhirlpoolSound() {
        if (!this.initialized) return;
        
        try {
            // Bruit filtré tournant
            const noise = this.audioContext.createBufferSource();
            const bufferSize = this.audioContext.sampleRate * 2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            noise.loop = true;
            
            // Filtre bandpass avec modulation
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(150, this.audioContext.currentTime);
            filter.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 1.5);
            filter.Q.value = 3;
            
            // LFO pour effet tournant
            const lfo = this.audioContext.createOscillator();
            lfo.frequency.value = 5;
            const lfoGain = this.audioContext.createGain();
            lfoGain.gain.value = 200;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime + 2);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            noise.start();
            lfo.start();
            noise.stop(this.audioContext.currentTime + 2);
            lfo.stop(this.audioContext.currentTime + 2);
        } catch (e) {
            console.error('Error playing whirlpool sound:', e);
        }
    }

    /**
     * Son d'attaque de requin - surgissement menaçant
     */
    playSharkAttackSound() {
        if (!this.initialized) return;
        
        try {
            // Oscillateur grave menaçant
            const osc1 = this.audioContext.createOscillator();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(40, this.audioContext.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.3);
            osc1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.8);
            
            // Deuxième oscillateur désaccordé
            const osc2 = this.audioContext.createOscillator();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(42, this.audioContext.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(83, this.audioContext.currentTime + 0.3);
            osc2.frequency.exponentialRampToValueAtTime(52, this.audioContext.currentTime + 0.8);
            
            // Noise burst pour l'attaque
            const noise = this.audioContext.createBufferSource();
            const bufferSize = this.audioContext.sampleRate * 0.2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            
            const noiseFilter = this.audioContext.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 300;
            noiseFilter.Q.value = 2;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime + 0.3);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            gainNode.connect(this.audioContext.destination);
            
            osc1.start();
            osc2.start();
            noise.start();
            osc1.stop(this.audioContext.currentTime + 0.8);
            osc2.stop(this.audioContext.currentTime + 0.8);
        } catch (e) {
            console.error('Error playing shark attack sound:', e);
        }
    }

    /**
     * Son d'éclaboussure - splash impact eau
     */
    playSplashSound() {
        if (!this.initialized) return;
        
        try {
            // Noise white court
            const noise = this.audioContext.createBufferSource();
            const bufferSize = this.audioContext.sampleRate * 0.3;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            
            // Filtre highpass pour l'eau
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 1000;
            filter.Q.value = 1;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            noise.start();
        } catch (e) {
            console.error('Error playing splash sound:', e);
        }
    }

    /**
     * Son de vague - ondulation mer
     */
    playWaveSound() {
        if (!this.initialized) return;
        
        try {
            // Oscillateur grave pour le volume d'eau
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, this.audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.25);
            osc.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
            
            // Noise filtré pour le mouvement d'eau
            const noise = this.audioContext.createBufferSource();
            const bufferSize = this.audioContext.sampleRate * 0.5;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            
            const noiseFilter = this.audioContext.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 400;
            noiseFilter.Q.value = 2;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            osc.connect(gainNode);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            gainNode.connect(this.audioContext.destination);
            noiseGain.connect(this.audioContext.destination);
            
            osc.start();
            noise.start();
            osc.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.error('Error playing wave sound:', e);
        }
    }

    /**
     * Son du Léviathan - rugissement de boss marin
     */
    playLeviathanRoarSound() {
        if (!this.initialized) return;
        
        try {
            // Deux oscillateurs graves désaccordés
            const osc1 = this.audioContext.createOscillator();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(30, this.audioContext.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
            osc1.frequency.exponentialRampToValueAtTime(35, this.audioContext.currentTime + 1.5);
            
            const osc2 = this.audioContext.createOscillator();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(45, this.audioContext.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(65, this.audioContext.currentTime + 0.5);
            osc2.frequency.exponentialRampToValueAtTime(48, this.audioContext.currentTime + 1.5);
            
            // Noise pour le côté monstrueux
            const noise = this.audioContext.createBufferSource();
            const bufferSize = this.audioContext.sampleRate * 1.5;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            
            const noiseFilter = this.audioContext.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(200, this.audioContext.currentTime);
            noiseFilter.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.7);
            noiseFilter.frequency.linearRampToValueAtTime(300, this.audioContext.currentTime + 1.5);
            noiseFilter.Q.value = 3;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
            noiseGain.gain.linearRampToValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime + 0.5);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.35 * this.masterVolume, this.audioContext.currentTime + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            gainNode.connect(this.audioContext.destination);
            noiseGain.connect(this.audioContext.destination);
            
            osc1.start();
            osc2.start();
            noise.start();
            osc1.stop(this.audioContext.currentTime + 1.5);
            osc2.stop(this.audioContext.currentTime + 1.5);
        } catch (e) {
            console.error('Error playing leviathan roar sound:', e);
        }
    }

    /**
     * Son de bulle qui éclate (pop) - doux et relaxant
     */
    playBubblePopSound() {
        if (!this.initialized) return;
        
        try {
            // Fréquence aléatoire pour varier les pops
            const baseFreq = 300 + Math.random() * 400;
            
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, this.audioContext.currentTime + 0.08);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.08 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.08);
        } catch (e) {
            console.error('Error playing bubble pop sound:', e);
        }
    }

    /**
     * Son de menu hover - doux et apaisant
     */
    playMenuHoverSound() {
        if (!this.initialized) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.05 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.error('Error playing menu hover sound:', e);
        }
    }

    /**
     * Son de sélection menu - chaleureux et apaisant
     */
    playMenuSelectSound() {
        if (!this.initialized) return;
        
        try {
            // Accord doux (do-mi-sol)
            const osc1 = this.audioContext.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.value = 523.25; // Do
            
            const osc2 = this.audioContext.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = 659.25; // Mi
            
            const osc3 = this.audioContext.createOscillator();
            osc3.type = 'sine';
            osc3.frequency.value = 783.99; // Sol
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.12 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            osc3.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc1.start();
            osc2.start();
            osc3.start();
            osc1.stop(this.audioContext.currentTime + 0.4);
            osc2.stop(this.audioContext.currentTime + 0.4);
            osc3.stop(this.audioContext.currentTime + 0.4);
        } catch (e) {
            console.error('Error playing menu select sound:', e);
        }
    }

    /**
     * Son "TOOKS" - signature sonore fun et enjouée
     */
    playTooksSound() {
        if (!this.initialized) return;
        
        try {
            // Son "TOO" - grave et rond
            const osc1 = this.audioContext.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(300, this.audioContext.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(250, this.audioContext.currentTime + 0.15);
            
            const gain1 = this.audioContext.createGain();
            gain1.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            // Son "KS" - aigu et pétillant
            const osc2 = this.audioContext.createOscillator();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.12);
            osc2.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.18);
            
            const gain2 = this.audioContext.createGain();
            gain2.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
            
            // Noise pour le "KS"
            const noise = this.audioContext.createBufferSource();
            const bufferSize = this.audioContext.sampleRate * 0.1;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            noise.buffer = buffer;
            
            const noiseFilter = this.audioContext.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 3000;
            
            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.12 * this.masterVolume, this.audioContext.currentTime + 0.15);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
            
            osc1.connect(gain1);
            gain1.connect(this.audioContext.destination);
            
            osc2.connect(gain2);
            gain2.connect(this.audioContext.destination);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            
            osc1.start();
            osc1.stop(this.audioContext.currentTime + 0.15);
            
            osc2.start(this.audioContext.currentTime + 0.12);
            osc2.stop(this.audioContext.currentTime + 0.25);
            
            noise.start(this.audioContext.currentTime + 0.15);
        } catch (e) {
            console.error('Error playing tooks sound:', e);
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
     * Son "chipe" - petit son aigu et rapide pour overlay
     */
    playChipeSound() {
        if (!this.initialized) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1400, this.audioContext.currentTime + 0.08);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.12 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.08);
        } catch (e) {
            console.error('Error playing chipe sound:', e);
        }
    }

    /**
     * Son "chioua" - petit son doux pour hover overlay
     */
    playChiouaSound() {
        if (!this.initialized) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(500, this.audioContext.currentTime + 0.05);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.08 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.05);
        } catch (e) {
            console.error('Error playing chioua sound:', e);
        }
    }

    /**
     * Son "click thouu" - son doux et descendant pour réglage graphique
     */
    playClickThouSound() {
        if (!this.initialized) return;
        
        try {
            // Oscillateur principal descendant
            const osc1 = this.audioContext.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(600, this.audioContext.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
            
            // Deuxième oscillateur pour enrichir
            const osc2 = this.audioContext.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(400, this.audioContext.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc1.start();
            osc2.start();
            osc1.stop(this.audioContext.currentTime + 0.3);
            osc2.stop(this.audioContext.currentTime + 0.3);
        } catch (e) {
            console.error('Error playing click thouu sound:', e);
        }
    }

    /**
     * Petit morceau musical 8bit pour réglage graphique
     * pit, pit pit, piteu pit, bong bong pit, pit pit, pit, tout toute tou..
     */
    play8BitGraphicsJingle() {
        if (!this.initialized) return;
        
        try {
            const now = this.audioContext.currentTime;
            const tempo = 0.15; // Durée d'une note en secondes
            
            // Séquence de notes: pit, pit pit, piteu pit, bong bong pit, pit pit, pit, tout toute tou
            const melody = [
                { freq: 880, time: 0, duration: tempo * 0.8 },           // pit
                { freq: 880, time: tempo * 1, duration: tempo * 0.8 },   // pit
                { freq: 880, time: tempo * 1.5, duration: tempo * 0.8 }, // pit
                { freq: 1047, time: tempo * 2.5, duration: tempo * 0.6 },// piteu
                { freq: 880, time: tempo * 3, duration: tempo * 0.8 },   // pit
                { freq: 523, time: tempo * 4, duration: tempo },         // bong
                { freq: 523, time: tempo * 5, duration: tempo },         // bong
                { freq: 880, time: tempo * 6, duration: tempo * 0.8 },   // pit
                { freq: 880, time: tempo * 6.5, duration: tempo * 0.8 }, // pit
                { freq: 880, time: tempo * 7, duration: tempo * 0.8 },   // pit
                { freq: 880, time: tempo * 7.5, duration: tempo * 0.8 }, // pit
                { freq: 698, time: tempo * 8.5, duration: tempo },       // tout
                { freq: 784, time: tempo * 9.5, duration: tempo * 0.8 }, // toute
                { freq: 659, time: tempo * 10.5, duration: tempo * 1.5 } // tou..
            ];
            
            // Basse (accompagnement simple)
            const bass = [
                { freq: 220, time: 0, duration: tempo * 2 },
                { freq: 196, time: tempo * 2, duration: tempo * 2 },
                { freq: 165, time: tempo * 4, duration: tempo * 2 },
                { freq: 220, time: tempo * 6, duration: tempo * 2 },
                { freq: 196, time: tempo * 8, duration: tempo * 2 },
                { freq: 165, time: tempo * 10, duration: tempo * 2 }
            ];
            
            // Jouer la mélodie
            melody.forEach(note => {
                const osc = this.audioContext.createOscillator();
                osc.type = 'square'; // Son 8bit
                osc.frequency.value = note.freq;
                
                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0, now + note.time);
                gain.gain.linearRampToValueAtTime(0.12 * this.masterVolume, now + note.time + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.start(now + note.time);
                osc.stop(now + note.time + note.duration);
            });
            
            // Jouer la basse
            bass.forEach(note => {
                const osc = this.audioContext.createOscillator();
                osc.type = 'triangle'; // Basse plus douce
                osc.frequency.value = note.freq;
                
                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0, now + note.time);
                gain.gain.linearRampToValueAtTime(0.08 * this.masterVolume, now + note.time + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.start(now + note.time);
                osc.stop(now + note.time + note.duration);
            });
        } catch (e) {
            console.error('Error playing 8bit jingle:', e);
        }
    }

    /**
     * Son "toke" - click sec et net pour boutons
     */
    playTokeSound() {
        if (!this.initialized) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.06);
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.06);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.06);
        } catch (e) {
            console.error('Error playing toke sound:', e);
        }
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
