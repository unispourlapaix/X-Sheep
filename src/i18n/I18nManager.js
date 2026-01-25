// I18nManager.js - Gestionnaire d'internationalisation
export class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('xsheep_lang') || 'fr';
        this.translations = {};
        this.rtlLanguages = ['ar', 'he'];
        this.onLanguageChange = null;
    }

    /**
     * Initialiser avec les traductions
     */
    async init() {
        await this.loadTranslations(this.currentLang);
        this.applyDirection();
    }

    /**
     * Charger les traductions d'une langue
     */
    async loadTranslations(lang) {
        try {
            // Essayer de charger la langue spécifique
            let module;
            try {
                module = await import(`./translations/${lang}.js`);
            } catch (e) {
                console.warn(`⚠️ Langue ${lang} non trouvée, fallback sur français`);
                module = await import(`./translations/fr.js`);
            }
            
            this.translations = module.default || module;
            console.log(`🌍 Traductions chargées: ${lang}`);
        } catch (e) {
            console.error(`Erreur chargement langue ${lang}:`, e);
            // Fallback sur le français en cas d'erreur
            if (lang !== 'fr') {
                try {
                    const module = await import(`./translations/fr.js`);
                    this.translations = module.default;
                } catch (fallbackError) {
                    console.error('Impossible de charger même le français:', fallbackError);
                }
            }
        }
    }

    /**
     * Changer de langue
     */
    async changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('xsheep_lang', lang);
        await this.loadTranslations(lang);
        this.applyDirection();
        
        if (this.onLanguageChange) {
            this.onLanguageChange(lang);
        }
    }

    /**
     * Obtenir une traduction
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            value = value?.[k];
            if (!value) {
                console.warn(`Traduction manquante: ${key}`);
                return key;
            }
        }
        
        return value;
    }

    /**
     * Appliquer la direction du texte (LTR/RTL)
     */
    applyDirection() {
        const isRTL = this.rtlLanguages.includes(this.currentLang);
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLang;
    }

    /**
     * Vérifier si la langue actuelle est RTL
     */
    isRTL() {
        return this.rtlLanguages.includes(this.currentLang);
    }

    /**
     * Obtenir la liste des langues disponibles
     */
    getAvailableLanguages() {
        return [
            { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
            { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
            { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
            { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
            { code: 'uk', name: 'Українська', flag: '🇺🇦', dir: 'ltr' },
            { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
            { code: 'jp', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
            { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
            { code: 'rc', name: 'Lingala', flag: '🇨🇩', dir: 'ltr' },
            { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
            { code: 'he', name: 'עברית', flag: '🇮🇱', dir: 'rtl' }
        ];
    }
}

// Instance globale
export const i18n = new I18nManager();
