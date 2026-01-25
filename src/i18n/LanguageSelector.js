// LanguageSelector.js - Sélecteur de langue
import { i18n } from './I18nManager.js';

export class LanguageSelector {
    constructor() {
        this.container = null;
        this.isOpen = false;
        this.createUI();
    }

    createUI() {
        // Bouton flottant pour ouvrir le sélecteur - ajouté au groupe de contrôles
        this.button = document.createElement('div');
        this.button.id = 'lang-selector-btn';
        this.button.style.cssText = `
            cursor: pointer;
            text-align: center;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #FFD700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            transition: all 0.3s;
        `;
        
        const currentLang = i18n.getAvailableLanguages().find(l => l.code === i18n.currentLang);
        this.button.textContent = currentLang?.flag || '🌍';
        this.button.title = i18n.t('menu.controls.language.change');
        
        this.button.addEventListener('click', () => this.toggle());
        
        // Ajouter au groupe de contrôles plutôt qu'au body
        const controlsGroup = document.getElementById('controls-group');
        if (controlsGroup) {
            controlsGroup.appendChild(this.button);
        } else {
            // Fallback si le groupe n'existe pas
            document.body.appendChild(this.button);
        }

        // Panel des langues - s'ouvre juste en dessous du groupe de boutons
        this.panel = document.createElement('div');
        this.panel.id = 'lang-selector-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 140px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            border: 3px solid #FFD700;
            border-radius: 15px;
            padding: 15px;
            display: none;
            max-height: 70vh;
            overflow-y: auto;
            z-index: 101;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            width: 250px;
        `;

        // Titre
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
            color: #333;
            border-bottom: 2px solid #FFD700;
            padding-bottom: 10px;
        `;
        title.textContent = i18n.t('menu.controls.language.panelTitle');
        this.panel.appendChild(title);

        // Liste des langues
        const languages = i18n.getAvailableLanguages();
        
        // Séparer LTR et RTL
        const ltrLangs = languages.filter(l => l.dir === 'ltr');
        const rtlLangs = languages.filter(l => l.dir === 'rtl');

        // Section LTR
        const ltrSection = this.createLanguageSection(i18n.t('menu.controls.language.ltrSection'), ltrLangs);
        this.panel.appendChild(ltrSection);

        // Section RTL
        if (rtlLangs.length > 0) {
            const rtlSection = this.createLanguageSection(i18n.t('menu.controls.language.rtlSection'), rtlLangs);
            this.panel.appendChild(rtlSection);
        }

        document.body.appendChild(this.panel);

        // Fermer en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && !this.button.contains(e.target)) {
                this.close();
            }
        });
    }

    createLanguageSection(sectionTitle, languages) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 15px;
        `;

        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 12px;
            color: #888;
            margin-bottom: 8px;
            font-weight: bold;
        `;
        title.textContent = sectionTitle;
        section.appendChild(title);

        languages.forEach(lang => {
            const langBtn = document.createElement('div');
            langBtn.style.cssText = `
                padding: 10px;
                margin: 5px 0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                background: ${lang.code === i18n.currentLang ? '#FFD700' : 'rgba(240, 240, 240, 0.8)'};
                border: 2px solid ${lang.code === i18n.currentLang ? '#DAA520' : 'transparent'};
                display: flex;
                align-items: center;
                gap: 10px;
            `;

            const flag = document.createElement('span');
            flag.style.fontSize = '24px';
            flag.textContent = lang.flag;

            const name = document.createElement('span');
            name.style.cssText = `
                flex: 1;
                font-size: 14px;
                font-weight: ${lang.code === i18n.currentLang ? 'bold' : 'normal'};
                color: #333;
            `;
            name.textContent = lang.name;

            if (lang.code === i18n.currentLang) {
                const check = document.createElement('span');
                check.textContent = '✓';
                check.style.cssText = `
                    color: #333;
                    font-weight: bold;
                    font-size: 18px;
                `;
                langBtn.appendChild(check);
            }

            langBtn.appendChild(flag);
            langBtn.appendChild(name);

            langBtn.addEventListener('mouseenter', () => {
                if (lang.code !== i18n.currentLang) {
                    langBtn.style.background = 'rgba(255, 215, 0, 0.3)';
                    langBtn.style.transform = 'scale(1.05)';
                }
            });

            langBtn.addEventListener('mouseleave', () => {
                if (lang.code !== i18n.currentLang) {
                    langBtn.style.background = 'rgba(240, 240, 240, 0.8)';
                    langBtn.style.transform = 'scale(1)';
                }
            });

            langBtn.addEventListener('click', async () => {
                await this.selectLanguage(lang.code);
            });

            section.appendChild(langBtn);
        });

        return section;
    }

    async selectLanguage(code) {
        if (code === i18n.currentLang) {
            this.close();
            return;
        }

        console.log(`🌍 Changement de langue: ${code}`);
        await i18n.changeLanguage(code);
        
        // Mettre à jour le bouton
        const lang = i18n.getAvailableLanguages().find(l => l.code === code);
        this.button.textContent = lang?.flag || '🌍';

        // Recharger la page pour appliquer les traductions
        window.location.reload();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.panel.style.display = 'block';
        this.isOpen = true;
    }

    close() {
        this.panel.style.display = 'none';
        this.isOpen = false;
    }

    hide() {
        if (this.button) this.button.style.display = 'none';
        if (this.panel) this.panel.style.display = 'none';
    }

    show() {
        if (this.button) this.button.style.display = 'flex';
    }

    destroy() {
        if (this.button) this.button.remove();
        if (this.panel) this.panel.remove();
    }
}
