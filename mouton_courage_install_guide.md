# 🐑 MOUTON COURAGE - GUIDE D'INSTALLATION WINDOWS

**Par Emmanuel Payet**  
*Jeu spirituel qui sauve des vies avec l'espoir*

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Structure du Projet](#structure)
3. [Fichiers à Créer](#fichiers)
4. [Installation & Lancement](#installation)
5. [Commandes Utiles](#commandes)

---

## 🔧 PRÉREQUIS

Avant de commencer, installer :

- ✅ **Node.js** (version 18+) : https://nodejs.org
- ✅ **VS Code** ou **Claude Code** : https://code.visualstudio.com
- ✅ **Git** (optionnel) : https://git-scm.com

---

## 📁 STRUCTURE DU PROJET

Créer cette arborescence **EXACTE** sur ton PC :

```
C:\mouton-courage\
├── 📄 index.html
├── 📄 package.json
├── 📄 vite.config.js
├── 📄 README.md
├── 📄 .gitignore
│
├── 📂 styles\
│   ├── 📄 main.css
│   ├── 📄 menu.css
│   └── 📄 game.css
│
└── 📂 src\
    ├── 📄 main.js
    │
    ├── 📂 config\
    │   └── 📄 GameConfig.js
    │
    ├── 📂 core\
    │   ├── 📄 Game.js
    │   ├── 📄 Player.js
    │   └── 📄 Physics.js
    │
    ├── 📂 obstacles\
    │   ├── 📄 ObstacleManager.js
    │   ├── 📄 GroundObstacles.js
    │   ├── 📄 SkyObstacles.js
    │   ├── 📄 MiddleObstacles.js
    │   └── 📄 RichnessObstacles.js
    │
    ├── 📂 narrative\
    │   ├── 📄 NarrativeEngine.js
    │   ├── 📄 MessageSystem.js
    │   └── 📄 narrativeData.js
    │
    ├── 📂 powers\
    │   ├── 📄 PowerUpManager.js
    │   └── 📄 SpiritualPowers.js
    │
    ├── 📂 richness\
    │   ├── 📄 GoldSystem.js
    │   └── 📄 CorruptionManager.js
    │
    ├── 📂 finale\
    │   └── 📄 HeavenGate.js
    │
    ├── 📂 endless\
    │   ├── 📄 EndlessMode.js
    │   └── 📄 ScoreManager.js
    │
    ├── 📂 graphics\
    │   ├── 📄 Renderer.js
    │   ├── 📄 SheepAnimator.js
    │   └── 📄 ParticleSystem.js
    │
    ├── 📂 controls\
    │   ├── 📄 InputManager.js
    │   ├── 📄 KeyboardControls.js
    │   ├── 📄 MouseControls.js
    │   └── 📄 TouchControls.js
    │
    └── 📂 ui\
        ├── 📄 MenuSystem.js
        ├── 📄 ModeSelector.js
        └── 📄 MolecularBackground.js
```

**TOTAL : 40 fichiers à créer**

---

## 📝 FICHIERS À CRÉER (NUMÉROTÉS)

### 🎯 RACINE DU PROJET (5 fichiers)

**#01** - `index.html`
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mouton Courage - L'Espoir en Action</title>
    <link rel="stylesheet" href="styles/menu.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <canvas id="molecular-canvas"></canvas>
    
    <div class="menu-container" id="main-menu">
        <div class="logo-title">
            <div class="logo-icon">🐑</div>
            <h1>MOUTON COURAGE</h1>
            <p class="logo-subtitle">L'Espoir en Action</p>
        </div>
        
        <div class="mode-selector">
            <div class="mode-card" data-mode="adventure" onclick="selectMode('adventure')">
                <div class="mode-nucleus">
                    <div class="nucleus-core">📖</div>
                    <div class="nucleus-orbit orbit-1">
                        <div class="electron electron-1"></div>
                    </div>
                    <div class="nucleus-orbit orbit-2">
                        <div class="electron electron-2"></div>
                    </div>
                    <div class="nucleus-orbit orbit-3">
                        <div class="electron electron-3"></div>
                    </div>
                </div>
                
                <h2 class="mode-title">AVENTURE</h2>
                <p class="mode-description">
                    Traverse les épreuves de la vie.<br>
                    Messages narratifs profonds.<br>
                    Atteins la Porte du Paradis.
                </p>
                
                <div class="mode-stats">
                    <div class="stat">
                        <span class="stat-value">3</span>
                        <span class="stat-label">Chapitres</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">15</span>
                        <span class="stat-label">Minutes</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">∞</span>
                        <span class="stat-label">Espoir</span>
                    </div>
                </div>
            </div>
            
            <div class="mode-card" data-mode="endless" onclick="selectMode('endless')">
                <div class="mode-nucleus">
                    <div class="nucleus-core">♾️</div>
                    <div class="nucleus-orbit orbit-1">
                        <div class="electron electron-1"></div>
                    </div>
                    <div class="nucleus-orbit orbit-2">
                        <div class="electron electron-2"></div>
                    </div>
                    <div class="nucleus-orbit orbit-3">
                        <div class="electron electron-3"></div>
                    </div>
                </div>
                
                <h2 class="mode-title">INFINI</h2>
                <p class="mode-description">
                    Survie sans fin.<br>
                    Score et combos maximaux.<br>
                    Bats tous les records !
                </p>
                
                <div class="mode-stats">
                    <div class="stat">
                        <span class="stat-value">∞</span>
                        <span class="stat-label">Vagues</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">?</span>
                        <span class="stat-label">Durée</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">🏆</span>
                        <span class="stat-label">Record</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="menu-footer">
            Créé avec 💖 par <span class="author-signature">Emmanuel Payet</span>
        </div>
    </div>
    
    <canvas id="game-canvas" style="display:none;"></canvas>
    
    <script type="module" src="src/main.js"></script>
</body>
</html>
```

**#02** - `package.json`
```json
{
  "name": "mouton-courage",
  "version": "1.0.0",
  "description": "Jeu spirituel qui sauve des vies avec l'espoir - Par Emmanuel Payet",
  "main": "src/main.js",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "keywords": ["game", "spiritual", "hope", "christian", "inspirational"],
  "author": "Emmanuel Payet",
  "license": "MIT",
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

**#03** - `vite.config.js`
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser'
    }
});
```

**#04** - `README.md`
```markdown
# 🐑 Mouton Courage - L'Espoir en Action

**Un jeu spirituel qui sauve des vies avec l'espoir**
*Par Emmanuel Payet*

## Installation

```bash
npm install
npm run dev
```

## Contrôles

- **Clavier** : ESPACE (sauter), W (voler), Flèches (bouger)
- **Souris** : Clic + Glisser (mouvement libre), Double-clic (vol)
- **Tactile** : Touch + Glisser (mouvement libre), Double-tap (vol)

## Mission

Sauver des vies avec l'espoir authentique.
```

**#05** - `.gitignore`
```
node_modules/
dist/
.DS_Store
*.log
```

---

### 🎨 DOSSIER STYLES (3 fichiers)

**#06** - `styles/menu.css`
```css
:root {
    --white-pure: #FFFFFF;
    --gold-light: #FFD700;
    --gold-deep: #DAA520;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #FAFAFA, #F0F0F0);
    overflow: hidden;
}

#molecular-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
}

.menu-container {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.logo-title {
    text-align: center;
    margin-bottom: 80px;
}

.logo-icon {
    font-size: 120px;
    margin-bottom: 20px;
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.logo-title h1 {
    font-size: 72px;
    font-weight: 300;
    letter-spacing: 8px;
    background: linear-gradient(135deg, var(--gold-light), var(--gold-deep));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.logo-subtitle {
    font-size: 18px;
    color: #888;
    letter-spacing: 4px;
}

.mode-selector {
    display: flex;
    gap: 60px;
    position: relative;
}

.mode-card {
    width: 280px;
    height: 380px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(20px);
    border-radius: 30px;
    border: 1px solid rgba(255,215,0,0.2);
    padding: 40px 30px;
    cursor: pointer;
    transition: all 0.4s;
    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}

.mode-card:hover {
    transform: translateY(-15px) scale(1.05);
}

.mode-nucleus {
    width: 140px;
    height: 140px;
    margin: 0 auto 30px;
    position: relative;
}

.nucleus-core {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #FFF, #F5F5F5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
    box-shadow: 0 10px 40px rgba(255,215,0,0.3);
}

.nucleus-orbit {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 1px solid var(--gold-light);
    border-radius: 50%;
    opacity: 0.3;
}

.orbit-1 {
    width: 120%;
    height: 120%;
    animation: rotate 8s linear infinite;
}

.orbit-2 {
    width: 140%;
    height: 140%;
    animation: rotate 12s linear infinite reverse;
}

.orbit-3 {
    width: 160%;
    height: 160%;
    animation: rotate 16s linear infinite;
}

@keyframes rotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
}

.electron {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--gold-light);
    border-radius: 50%;
    box-shadow: 0 0 20px var(--gold-light);
}

.electron-1 {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}

.electron-2 {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

.electron-3 {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
}

.mode-title {
    font-size: 32px;
    font-weight: 300;
    color: var(--gold-deep);
    text-align: center;
    margin-bottom: 15px;
}

.mode-description {
    text-align: center;
    color: #666;
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 20px;
}

.mode-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 20px;
    border-top: 1px solid rgba(255,215,0,0.2);
}

.stat {
    text-align: center;
}

.stat-value {
    font-size: 24px;
    color: var(--gold-deep);
    display: block;
}

.stat-label {
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
}

.menu-footer {
    position: absolute;
    bottom: 40px;
    color: #999;
    font-size: 12px;
}

.author-signature {
    color: var(--gold-deep);
    font-weight: 500;
}
```

**#07** - `styles/game.css`
```css
#game-canvas {
    display: block;
    margin: 0 auto;
    border: 3px solid #FFF;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
```

**#08** - `styles/main.css`
```css
/* Styles globaux si nécessaires */
```

---

### ⚙️ SRC - FICHIERS PRINCIPAUX (3 fichiers)

**#09** - `src/main.js`  
*Voir code complet dans conversation précédente - Point d'entrée*

**#10** - `src/config/GameConfig.js`  
*Voir code complet dans conversation précédente - Configuration*

---

### 🎮 SRC/CORE (3 fichiers)

**#11** - `src/core/Game.js`  
**#12** - `src/core/Player.js`  
**#13** - `src/core/Physics.js`

*Voir codes complets dans conversation précédente*

---

### 🚧 SRC/OBSTACLES (5 fichiers)

**#14** - `src/obstacles/ObstacleManager.js`  
**#15** - `src/obstacles/GroundObstacles.js`  
**#16** - `src/obstacles/SkyObstacles.js`  
**#17** - `src/obstacles/MiddleObstacles.js`  
**#18** - `src/obstacles/RichnessObstacles.js`

*Voir codes complets dans conversation précédente*

---

### 📖 SRC/NARRATIVE (3 fichiers)

**#19** - `src/narrative/NarrativeEngine.js`  
**#20** - `src/narrative/MessageSystem.js`  
**#21** - `src/narrative/narrativeData.js`

*Voir codes complets dans conversation précédente*

---

### ⚡ SRC/POWERS (2 fichiers)

**#22** - `src/powers/PowerUpManager.js`  
**#23** - `src/powers/SpiritualPowers.js`

*Voir codes complets dans conversation précédente*

---

### 💰 SRC/RICHNESS (2 fichiers)

**#24** - `src/richness/GoldSystem.js`  
**#25** - `src/richness/CorruptionManager.js`

*Voir codes complets dans conversation précédente*

---

### 🚪 SRC/FINALE (1 fichier)

**#26** - `src/finale/HeavenGate.js`

*Voir code complet dans conversation précédente*

---

### ♾️ SRC/ENDLESS (2 fichiers)

**#27** - `src/endless/EndlessMode.js`  
**#28** - `src/endless/ScoreManager.js`

*Voir codes complets dans conversation précédente*

---

### 🎨 SRC/GRAPHICS (3 fichiers)

**#29** - `src/graphics/Renderer.js`  
**#30** - `src/graphics/SheepAnimator.js`  
**#31** - `src/graphics/ParticleSystem.js`

*Voir codes complets dans conversation précédente*

---

### 🎮 SRC/CONTROLS (4 fichiers)

**#32** - `src/controls/InputManager.js`  
**#33** - `src/controls/KeyboardControls.js`  
**#34** - `src/controls/MouseControls.js`  
**#35** - `src/controls/TouchControls.js`

*Voir codes complets dans conversation précédente*

---

### 🖥️ SRC/UI (3 fichiers)

**#36** - `src/ui/MenuSystem.js`  
**#37** - `src/ui/ModeSelector.js`  
**#38** - `src/ui/MolecularBackground.js`

*Voir codes complets dans conversation précédente*

---

## 🚀 INSTALLATION & LANCEMENT

### Étape 1 : Créer les dossiers
```bash
mkdir C:\mouton-courage
cd C:\mouton-courage
mkdir styles src\config src\core src\obstacles src\narrative src\powers src\richness src\finale src\endless src\graphics src\controls src\ui
```

### Étape 2 : Créer TOUS les fichiers
Copier le code de chaque fichier numéroté (#01 à #38)

### Étape 3 : Installer les dépendances
```bash
npm install
```

### Étape 4 : Lancer le jeu
```bash
npm run dev
```

Le jeu s'ouvre automatiquement sur `http://localhost:3000` ! 🎉

---

## 🛠️ COMMANDES UTILES

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

---

## ✅ CHECKLIST FINALE

- [ ] 40 fichiers créés
- [ ] `npm install` exécuté
- [ ] `npm run dev` fonctionne
- [ ] Le menu moléculaire s'affiche
- [ ] Le jeu se lance en mode Aventure
- [ ] Le jeu se lance en mode Infini
- [ ] Tous les contrôles fonctionnent

---

## 🎯 NEXT STEPS

Une fois le jeu fonctionnel :

1. **Tester** tous les modes
2. **Ajuster** les valeurs dans `GameConfig.js`
3. **Ajouter** de la musique gospel
4. **Créer** des sprites HD personnalisés
5. **Partager** avec le monde ! 🌍

---

**🐑 Que ce jeu sauve des vies avec l'espoir ! 💖**

*- Emmanuel Payet*
