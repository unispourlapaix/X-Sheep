# 🌍 Système d'Internationalisation (i18n) - X-Sheep

## Langues supportées

### LTR (Left-to-Right)
- 🇫🇷 **Français** (fr) - Langue par défaut ✅ COMPLET
- 🇬🇧 **English** (en) ✅ COMPLET
- 🇪🇸 **Español** (es) 🚧 EN COURS
- 🇩🇪 **Deutsch** (de) ⏳ À TRADUIRE
- 🇮🇹 **Italiano** (it) ⏳ À TRADUIRE
- 🇵🇹 **Português** (pt) ⏳ À TRADUIRE
- 🇷🇺 **Русский** (ru) ⏳ À TRADUIRE
- 🇺🇦 **Українська** (uk) ⏳ À TRADUIRE
- 🇨🇳 **中文** (zh) ⏳ À TRADUIRE
- 🇯🇵 **日本語** (jp) ⏳ À TRADUIRE
- 🇰🇷 **한국어** (ko) ⏳ À TRADUIRE
- 🇨🇩 **Lingala** (rc) ⏳ À TRADUIRE

### RTL (Right-to-Left)
- 🇸🇦 **العربية** (ar) - Arabe 🚧 EN COURS
- 🇮🇱 **עברית** (he) - Hébreu ⏳ À TRADUIRE

## Architecture

### Fichiers principaux
```
src/i18n/
├── I18nManager.js              # Gestionnaire principal
├── LanguageSelector.js         # Sélecteur de langue UI
└── translations/
    ├── fr.js                   # Français (référence complète)
    ├── en.js                   # Anglais (complet)
    ├── es.js                   # Espagnol (en cours)
    ├── ar.js                   # Arabe avec RTL (en cours)
    ├── de.js, it.js, pt.js...  # Autres (stubs)
    └── stubs.js                # Exports des stubs
```

### Classes principales

#### I18nManager
Gestionnaire centralisé des traductions :
- Charge dynamiquement les fichiers de langue
- Gère la direction du texte (LTR/RTL)
- Stocke la langue choisie dans localStorage
- Fournit la méthode `t(key)` pour traduire

#### LanguageSelector
Sélecteur UI avec :
- Bouton flottant affichant le drapeau de la langue active
- Panel déroulant avec toutes les langues disponibles
- Séparation visuelle LTR/RTL
- Indication de la langue active avec ✓
- Rechargement automatique lors du changement

## Utilisation

### Dans le code JavaScript

```javascript
import { i18n } from './i18n/I18nManager.js';

// Attendre l'initialisation
await i18n.init();

// Obtenir une traduction
const title = i18n.t('menu.title');
const hopeMessage = i18n.t('narrative.wheelchair.hope');

// Vérifier si RTL
if (i18n.isRTL()) {
    // Adapter l'interface
}

// Changer de langue
await i18n.changeLanguage('ar');
```

### Dans le HTML

Les traductions sont appliquées automatiquement au chargement via `applyTranslations()` dans `main.js`.

### Structure d'un fichier de traduction

```javascript
export default {
    meta: {
        language: 'Français',
        code: 'fr',
        flag: '🇫🇷',
        dir: 'ltr' // ou 'rtl' pour arabe/hébreu
    },
    
    menu: {
        title: 'X-Sheep is back',
        subtitle: "L'Espoir en Action",
        // ...
    },
    
    game: {
        levels: { /* ... */ },
        buttons: { /* ... */ },
        // ...
    },
    
    narrative: {
        wheelchair: {
            text: "Message complet...",
            hope: "Message d'espoir"
        },
        // ... tous les obstacles
    }
};
```

## Support RTL

Les langues RTL (arabe, hébreu) ont :
- `dir: 'rtl'` dans leur métadonnées
- Inversion automatique de `document.dir`
- CSS adapté avec `[dir="rtl"]` dans `menu.css`
- Positionnement des boutons inversé

## Comment ajouter une nouvelle traduction

### 1. Copier le fichier de référence
```bash
cp src/i18n/translations/fr.js src/i18n/translations/xx.js
```

### 2. Modifier les métadonnées
```javascript
meta: {
    language: 'Nom de la langue',
    code: 'xx',
    flag: '🇽🇽',
    dir: 'ltr' // ou 'rtl'
}
```

### 3. Traduire tous les textes
- `menu.*` - Interface du menu
- `game.*` - Interface en jeu
- `trophies.*` - Système de trophées
- `narrative.*` - Tous les messages narratifs (36+ obstacles)
- `notifications.*` - Notifications en jeu

### 4. Tester
- Lancer le jeu
- Cliquer sur le sélecteur de langue (drapeau en haut à droite)
- Sélectionner votre langue
- Vérifier tous les écrans

## Priorités de traduction

### Phase 1 (Critique - Interface)
- ✅ Menu principal
- ✅ Boutons (Réessayer, Menu, Continuer...)
- ✅ Game Over / Victory
- ✅ HUD (Vies, Score, Niveau...)

### Phase 2 (Important - Contenu)
- 🚧 Messages narratifs des 8 obstacles de la vie
- 🚧 Messages des 7 obstacles du ciel
- 🚧 Messages des 6 péchés de richesse
- 🚧 Messages des obstacles fun
- 🚧 Trophées spéciaux

### Phase 3 (Bonus)
- ⏳ Commentaires des boss
- ⏳ Notifications détaillées
- ⏳ Dialogue final

## Notes techniques

- Les traductions sont chargées dynamiquement (code splitting)
- Fallback automatique sur le français en cas d'erreur
- Le français reste la référence complète
- Les stubs utilisent le français par défaut
- Rechargement de la page nécessaire pour changer de langue (évite les bugs de state)

## Contribution

Pour contribuer une traduction :
1. Fork le projet
2. Créer/compléter un fichier de langue dans `src/i18n/translations/`
3. Tester localement
4. Soumettre une Pull Request avec :
   - Le code de langue
   - Votre nom dans les contributors
   - Screenshot de la traduction en action

## Contributors

- 🇫🇷 Emmanuel Payet (Français - Original)
- 🇬🇧 [Votre nom] (English)
- 🇸🇦 [Votre nom] (العربية)
- ...

---

**Note** : Les messages spirituels et philosophiques doivent être traduits avec soin pour préserver leur sens profond et leur impact émotionnel. N'hésitez pas à adapter culturellement tout en restant fidèle au message d'espoir et de résilience.
