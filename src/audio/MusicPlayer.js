/**
 * MusicPlayer - Système de lecture de musique MP3 robuste
 * Utilise un double buffer pour éviter les coupures et NS_BINDING_ABORTED
 */

export class MusicPlayer {
    constructor() {
        // Détection du base path pour GitHub Pages
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        this.basePath = pathSegments.length > 0 && pathSegments[0] !== 'index.html' ? `/${pathSegments[0]}/` : '/';
        
        // Liste des pistes de musique
        this.tracks = [
            'Ilsuffitpas.mp3',
            'LavoixducielmurmurelAmour.mp3',
            'Jojo-notre-beau-Petit-mouton.mp3',
            'DansQuelMondeOnVit.mp3',
            'Nabandonnejamais.mp3',
            'forteresses_de_peur_xT.mp3'
        ];
        
        // Double buffer : deux éléments Audio pour transitions fluides
        this.audioA = null;
        this.audioB = null;
        this.currentAudio = null;
        this.nextAudio = null;
        
        // État
        this.currentTrackIndex = 0;
        this.volume = 0.5;
        this.isPlaying = false;
        this.isFading = false;
        
        // Gestion des erreurs
        this.retryCount = 0;
        this.maxRetries = 3;
        this.loadTimeout = 10000; // 10 secondes timeout
    }
    
    /**
     * Initialiser le lecteur de musique
     */
    init() {
        if (this.audioA) return; // Déjà initialisé
        
        // Créer les deux buffers audio
        this.audioA = this.createAudioElement();
        this.audioB = this.createAudioElement();
        
        // Commencer avec le buffer A
        this.currentAudio = this.audioA;
        this.nextAudio = this.audioB;
        
        console.log('🎵 MusicPlayer initialisé avec double buffer');
    }
    
    /**
     * Créer un élément Audio configuré
     */
    createAudioElement() {
        const audio = new Audio();
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // Gestion des événements
        audio.addEventListener('error', (e) => this.handleError(e, audio));
        audio.addEventListener('canplaythrough', () => {
            console.log('✅ Piste chargée et prête:', audio.src.split('/').pop());
        });
        
        return audio;
    }
    
    /**
     * Démarrer la lecture
     */
    async start() {
        this.init();
        
        if (this.isPlaying) {
            console.log('🎵 Musique déjà en cours');
            return;
        }
        
        this.isPlaying = true;
        await this.playTrack(this.currentTrackIndex);
    }
    
    /**
     * Jouer une piste spécifique
     */
    async playTrack(index) {
        if (!this.currentAudio) return;
        
        const trackName = this.tracks[index];
        const trackUrl = `${this.basePath}music/${trackName}`;
        
        console.log(`🎵 Chargement: ${trackName}`);
        
        try {
            // Arrêter l'audio actuel proprement
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            
            // Charger la nouvelle piste
            this.currentAudio.src = trackUrl;
            this.currentAudio.load();
            
            // Attendre que la piste soit prête avec timeout
            await this.waitForCanPlay(this.currentAudio);
            
            // Lancer la lecture
            await this.currentAudio.play();
            
            console.log(`✅ Lecture: ${trackName}`);
            
            // Précharger la piste suivante
            this.preloadNextTrack();
            
            // Écouter la fin de la piste
            this.currentAudio.onended = () => this.handleTrackEnd();
            
            this.retryCount = 0; // Reset retry count on success
            
        } catch (error) {
            console.error(`❌ Erreur lecture ${trackName}:`, error.message);
            await this.handlePlaybackError(index);
        }
    }
    
    /**
     * Attendre que l'audio soit prêt à jouer
     */
    waitForCanPlay(audio) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout chargement audio'));
            }, this.loadTimeout);
            
            const onCanPlay = () => {
                clearTimeout(timeout);
                audio.removeEventListener('canplaythrough', onCanPlay);
                audio.removeEventListener('error', onError);
                resolve();
            };
            
            const onError = (e) => {
                clearTimeout(timeout);
                audio.removeEventListener('canplaythrough', onCanPlay);
                audio.removeEventListener('error', onError);
                reject(new Error(`Erreur chargement: ${e.message || 'Unknown'}`));
            };
            
            // Si déjà prêt
            if (audio.readyState >= 3) {
                clearTimeout(timeout);
                resolve();
                return;
            }
            
            audio.addEventListener('canplaythrough', onCanPlay, { once: true });
            audio.addEventListener('error', onError, { once: true });
        });
    }
    
    /**
     * Précharger la piste suivante en arrière-plan
     */
    preloadNextTrack() {
        const nextIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        const nextTrackName = this.tracks[nextIndex];
        const nextTrackUrl = `${this.basePath}music/${nextTrackName}`;
        
        // Utiliser le buffer inactif pour précharger
        this.nextAudio.src = nextTrackUrl;
        this.nextAudio.load();
        
        console.log(`🔄 Préchargement: ${nextTrackName}`);
    }
    
    /**
     * Gérer la fin d'une piste
     */
    async handleTrackEnd() {
        if (!this.isPlaying) return;
        
        // Passer à la piste suivante
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        
        // Échanger les buffers
        const temp = this.currentAudio;
        this.currentAudio = this.nextAudio;
        this.nextAudio = temp;
        
        // Si la piste suivante est déjà chargée, la jouer directement
        if (this.currentAudio.readyState >= 3 && this.currentAudio.src.includes(this.tracks[this.currentTrackIndex])) {
            console.log('🎵 Transition vers piste préchargée');
            try {
                this.currentAudio.currentTime = 0;
                await this.currentAudio.play();
                this.currentAudio.onended = () => this.handleTrackEnd();
                this.preloadNextTrack();
            } catch (error) {
                console.error('Erreur transition:', error);
                await this.playTrack(this.currentTrackIndex);
            }
        } else {
            // Sinon charger normalement
            await this.playTrack(this.currentTrackIndex);
        }
    }
    
    /**
     * Gérer les erreurs de lecture
     */
    async handlePlaybackError(index) {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Tentative ${this.retryCount}/${this.maxRetries}...`);
            
            // Attendre un peu avant de réessayer
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.playTrack(index);
        } else {
            console.error('❌ Échec après plusieurs tentatives, passer à la piste suivante');
            this.retryCount = 0;
            this.currentTrackIndex = (index + 1) % this.tracks.length;
            await this.playTrack(this.currentTrackIndex);
        }
    }
    
    /**
     * Gérer les erreurs de chargement
     */
    handleError(event, audio) {
        const error = audio.error;
        if (error) {
            console.error('❌ Erreur audio:', {
                code: error.code,
                message: error.message,
                src: audio.src
            });
        }
    }
    
    /**
     * Mettre en pause
     */
    pause() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.isPlaying = false;
            console.log('⏸️ Musique en pause');
        }
    }
    
    /**
     * Reprendre la lecture
     */
    async resume() {
        if (this.currentAudio && !this.isPlaying) {
            try {
                await this.currentAudio.play();
                this.isPlaying = true;
                console.log('▶️ Musique reprise');
            } catch (error) {
                console.error('Erreur reprise:', error);
            }
        }
    }
    
    /**
     * Arrêter complètement
     */
    stop() {
        this.isPlaying = false;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        
        if (this.nextAudio) {
            this.nextAudio.pause();
            this.nextAudio.currentTime = 0;
        }
        
        console.log('⏹️ Musique arrêtée');
    }
    
    /**
     * Changer le volume (0 à 1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.audioA) this.audioA.volume = this.volume;
        if (this.audioB) this.audioB.volume = this.volume;
        
        console.log(`🔊 Volume: ${Math.round(this.volume * 100)}%`);
    }
    
    /**
     * Passer à la piste suivante manuellement
     */
    async skipToNext() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        await this.playTrack(this.currentTrackIndex);
    }
    
    /**
     * Passer à la piste précédente
     */
    async skipToPrevious() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        await this.playTrack(this.currentTrackIndex);
    }
    
    /**
     * Obtenir le nom de la piste en cours
     */
    getCurrentTrackName() {
        return this.tracks[this.currentTrackIndex];
    }
    
    /**
     * Nettoyer les ressources
     */
    destroy() {
        this.stop();
        
        if (this.audioA) {
            this.audioA.src = '';
            this.audioA = null;
        }
        
        if (this.audioB) {
            this.audioB.src = '';
            this.audioB = null;
        }
        
        console.log('🗑️ MusicPlayer détruit');
    }
}
