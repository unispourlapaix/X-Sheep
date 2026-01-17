# 📱 Optimisations Mobile Paysage

## Vue d'ensemble

Le jeu X-Sheep est optimisé pour offrir la meilleure expérience possible sur mobile en mode paysage (landscape), qui est l'orientation principale du jeu.

## 🎯 Objectifs

1. **Plein écran immersif** : Utilisation maximale de l'espace disponible
2. **Interface responsive** : Adaptation automatique des éléments UI
3. **Performance optimale** : Facteur d'échelle dynamique
4. **Contrôles tactiles** : Prévention du zoom et du défilement indésirables

## 🔧 Implémentation Technique

### 1. Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```
- `viewport-fit=cover` : Utilise toute la zone d'affichage (notch inclus)
- `user-scalable=no` : Désactive le zoom par pincement
- `maximum-scale=1.0` : Empêche le zoom accidentel

### 2. ResponsiveHelper Utility (`src/utils/ResponsiveHelper.js`)

**Détection mobile paysage :**
```javascript
isMobileLandscape() {
    return window.innerWidth <= 900 && 
           window.innerWidth > window.innerHeight;
}
```

**Facteur d'échelle dynamique :**
```javascript
getScaleFactor() {
    // 900px = 1.0, 600px = 0.8, 400px = 0.6
    const width = window.innerWidth;
    return Math.max(0.6, Math.min(1.0, width / 900));
}
```

**Méthodes d'adaptation :**
- `getFontSize(baseSize)` : Tailles de police adaptatives
- `getUISize(baseSize)` : Éléments UI (boutons, icônes)
- `getMargin(baseMargin)` : Espacements et marges
- `getCanvasSize()` : Dimensions du canvas selon l'appareil

### 3. Canvas Adaptatif (`src/core/Game.js`)

**Configuration automatique :**
```javascript
setupCanvas() {
    const isMobileLandscape = window.innerWidth <= 900 && 
                               window.innerWidth > window.innerHeight;
    
    if (isMobileLandscape) {
        // Plein écran
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Mise à jour GameConfig
        GameConfig.CANVAS_WIDTH = window.innerWidth;
        GameConfig.CANVAS_HEIGHT = window.innerHeight;
        GameConfig.PLAYER.GROUND_Y = window.innerHeight - 130;
    }
}
```

**Gestion du redimensionnement :**
```javascript
handleResize() {
    // Adaptation en temps réel lors de la rotation
}
```

### 4. Media Queries CSS

**3 Breakpoints principaux :**

#### 1. Tablettes paysage (≤ 900px)
```css
@media screen and (max-width: 900px) and (orientation: landscape) {
    .menu-container { width: 95vw; height: 90vh; }
    .mode-card { width: 45%; }
    #game-canvas { width: 100vw !important; }
}
```

#### 2. Smartphones paysage (≤ 700px)
```css
@media screen and (max-width: 700px) and (orientation: landscape) {
    .menu-container { width: 98vw; height: 95vh; }
    .logo-title h1 { font-size: 24px; }
}
```

#### 3. Petits écrans (hauteur ≤ 450px)
```css
@media screen and (max-height: 450px) and (orientation: landscape) {
    .menu-container { height: 98vh; padding: 8px; }
    .mode-icon { font-size: 30px; }
}
```

### 5. Éléments UI Adaptatifs

**Renderer.js - Éléments mis à jour :**
- ✅ Barre de vie (cœurs)
- ✅ Jauge de carburant
- ✅ Panneau LED du score
- ✅ Labels et textes
- ✅ Tailles d'icônes
- ✅ Marges et espacements

**Exemple - Barre de santé :**
```javascript
drawHealthBar() {
    const heartSize = ResponsiveHelper.getUISize(25);
    const spacing = ResponsiveHelper.getMargin(5);
    const startX = ResponsiveHelper.getMargin(20);
    const startY = ResponsiveHelper.getMargin(20);
    // ... reste du code
}
```

**Exemple - Panneau LED :**
```javascript
drawLEDPanel() {
    const panelHeight = ResponsiveHelper.getUISize(60);
    this.ctx.font = `bold ${ResponsiveHelper.getFontSize(14)}px monospace`;
    // ... reste du code
}
```

### 6. Menu Responsive

**Mode sélecteur adaptatif :**
- Desktop : Cartes empilées verticalement
- Mobile paysage : Cartes côte à côte horizontalement
- Tailles de police réduites progressivement
- Icons et stats adaptés à l'espace disponible

### 7. Touch Interactions

**Prévention des comportements indésirables :**
```css
@media screen and (max-width: 900px) and (orientation: landscape) {
    body {
        touch-action: none; /* Empêche zoom et défilement */
    }
    
    #game-canvas {
        touch-action: none;
    }
}
```

**Taille minimale des éléments tactiles :**
```css
input, button, select, textarea {
    font-size: 16px !important; /* Empêche le zoom auto sur iOS */
}
```

## 📊 Facteurs d'Échelle

| Largeur d'écran | Facteur | Application |
|-----------------|---------|-------------|
| ≥ 900px | 1.0 | Taille normale |
| 700px | 0.78 | Réduction modérée |
| 600px | 0.67 | Réduction importante |
| 400px | 0.6 (min) | Réduction maximale |

## 🎮 Gameplay Adapté

**Ajustements dynamiques :**
- Position du sol (`GROUND_Y`) adaptée à la hauteur d'écran
- Canvas prend tout l'écran disponible
- Pas de bordures ni marges en mode mobile
- UI compacte mais lisible

## 🧪 Tests Recommandés

### Appareils à tester :
1. **iPhone SE (375x667)** - Petit écran
2. **iPhone 13 Pro (390x844)** - Standard moderne
3. **iPad Mini (768x1024)** - Tablette compacte
4. **iPad Pro (1024x1366)** - Grande tablette
5. **Galaxy S21 (360x800)** - Android standard

### Scénarios de test :
- ✅ Rotation de portrait vers paysage
- ✅ Redimensionnement de la fenêtre
- ✅ Zoom accidentel (doit être bloqué)
- ✅ Défilement tactile (doit être désactivé en jeu)
- ✅ Lisibilité du score et carburant
- ✅ Taille des boutons tactiles

## 🚀 Performance

**Optimisations appliquées :**
- Calculs de scale mis en cache
- Media queries efficaces (orientation + taille)
- Pas de re-rendering inutile
- Facteur d'échelle calculé une fois par frame

## 📝 Notes de Développement

### Pour ajouter un nouvel élément UI :

1. **Utiliser ResponsiveHelper pour les dimensions :**
```javascript
const size = ResponsiveHelper.getUISize(baseSize);
const fontSize = ResponsiveHelper.getFontSize(baseFontSize);
const margin = ResponsiveHelper.getMargin(baseMargin);
```

2. **Tester sur mobile réel**, pas seulement l'émulateur

3. **Vérifier les 3 breakpoints** (900px, 700px, 450px)

### Maintenance :

- **ResponsiveHelper.js** : Point unique de configuration responsive
- **Media queries** : Séparées par fichier CSS (menu, game, main)
- **Canvas** : Géré dans Game.js avec event listener resize

## 🎯 Résultat Final

✅ **Expérience immersive** : Plein écran sans distractions  
✅ **Interface adaptive** : Lisible sur tous les écrans  
✅ **Performance optimale** : 60 FPS maintenu  
✅ **Contrôles précis** : Touch optimisé, pas de zoom accidentel  
✅ **PWA ready** : Installation et utilisation hors ligne  

---

**Testé avec succès sur :**
- Chrome Mobile DevTools (émulation)
- Safari iOS
- Chrome Android
- Navigateurs PWA standalone

Pour plus d'informations : https://unispourlapaix.github.io/X-Sheep/
