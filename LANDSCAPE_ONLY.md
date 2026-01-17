# 📱 Mode Paysage Uniquement - Configuration

## Objectif

Le jeu X-Sheep est conçu **exclusivement pour le mode paysage (landscape)**. En mode portrait, le jeu et le menu conservent leur taille desktop standard sans adaptation responsive.

## 🎯 Comportement

### Mode Paysage (Landscape)
✅ **Adaptation responsive active**
- Canvas plein écran
- Menu adapté à la taille de l'écran
- UI responsive (cœurs, carburant, score)
- Touch optimisé
- Pas de zoom

### Mode Portrait (Portrait)
✅ **Configuration desktop fixe**
- Menu : 900px × 600px (taille fixe)
- Canvas : 800px × 500px (taille fixe)
- Scroll activé si nécessaire
- Pas d'adaptation responsive
- Message invitant à tourner l'appareil

## 🔧 Implémentation Technique

### CSS - menu.css

```css
/* Mode Portrait - Garder taille desktop */
@media screen and (orientation: portrait) {
    .menu-container {
        width: 900px;
        height: 600px;
        min-width: 900px;
        min-height: 600px;
    }
    
    body {
        overflow: auto;
    }
}

/* Optimisation Mobile Paysage UNIQUEMENT */
@media screen and (max-width: 900px) and (orientation: landscape) {
    /* Adaptations responsive ici */
}
```

### CSS - game.css

```css
/* Mode Portrait - Garder configuration desktop */
@media screen and (orientation: portrait) {
    #game-canvas {
        width: 800px !important;
        height: 500px !important;
        border: 3px solid #FFF;
        border-radius: 15px;
    }
}

/* Optimisation Mobile Paysage UNIQUEMENT */
@media screen and (max-width: 900px) and (orientation: landscape) {
    #game-canvas {
        width: 100vw !important;
        height: 100vh !important;
        /* Plein écran */
    }
}
```

### CSS - main.css

```css
/* Mode Portrait - Comportement par défaut */
@media screen and (orientation: portrait) {
    body {
        overflow: auto;
        position: relative;
    }
}

/* Optimisation Mobile Paysage UNIQUEMENT */
@media screen and (max-width: 900px) and (orientation: landscape) {
    body {
        overflow: hidden;
        touch-action: none;
    }
}
```

### JavaScript - ResponsiveHelper.js

```javascript
static isMobileLandscape() {
    return window.innerWidth <= 900 && 
           window.innerWidth > window.innerHeight; // ✅ Vérifie paysage
}
```

### JavaScript - Game.js

```javascript
setupCanvas() {
    const isMobileLandscape = window.innerWidth <= 900 && 
                               window.innerWidth > window.innerHeight;
    
    if (isMobileLandscape) {
        // Plein écran
    } else {
        // Configuration standard
    }
}
```

## 📊 Comparaison des Modes

| Aspect | Portrait | Paysage Mobile | Desktop |
|--------|----------|----------------|---------|
| **Menu** | 900×600px fixe | 95vw×90vh | 900×600px |
| **Canvas** | 800×500px fixe | 100vw×100vh | 800×500px |
| **UI Scale** | 1.0 | 0.6-1.0 | 1.0 |
| **Touch** | Normal | Optimisé | N/A |
| **Scroll** | Activé | Désactivé | Désactivé |
| **Zoom** | Autorisé | Bloqué | N/A |

## 🎮 Expérience Utilisateur

### En Portrait
- Le jeu s'affiche en taille fixe desktop
- Un message pourrait être ajouté pour inviter à tourner l'appareil
- Le scroll est possible si l'écran est trop petit
- Interface non optimisée mais utilisable

### En Paysage
- Expérience optimale et immersive
- Plein écran automatique
- UI adaptée dynamiquement
- Contrôles tactiles précis
- Pas d'éléments de navigation du navigateur visibles

## ✅ Avantages

### 1. **Performance**
- Pas de calculs responsive inutiles en portrait
- Code simplifié avec condition claire

### 2. **Expérience Cohérente**
- Comportement prévisible
- Orientation clairement définie

### 3. **Développement**
- Un seul mode responsive à maintenir
- Tests simplifiés

### 4. **UX**
- Encourage l'utilisation en paysage (mode optimal)
- Pas de layout cassé en portrait

## 🧪 Tests

### Vérification Portrait
1. Ouvrir sur mobile en mode portrait
2. Vérifier que le menu fait 900×600px
3. Vérifier que le canvas fait 800×500px
4. Vérifier que le scroll fonctionne
5. Pas d'adaptation responsive

### Vérification Paysage
1. Ouvrir sur mobile en mode paysage
2. Vérifier que le menu prend 95% de l'écran
3. Vérifier que le canvas est en plein écran
4. Vérifier que l'UI est scalée
5. Vérifier que le touch fonctionne
6. Vérifier qu'on ne peut pas zoomer

## 🔮 Améliorations Futures

### Message de Rotation
Ajouter un overlay en mode portrait invitant à tourner l'appareil :

```html
<div id="rotate-message" class="rotate-message">
    <div class="rotate-icon">📱↻</div>
    <p>Tournez votre appareil en mode paysage</p>
    <p>pour une meilleure expérience</p>
</div>
```

```css
.rotate-message {
    display: none;
}

@media screen and (orientation: portrait) and (max-width: 900px) {
    .rotate-message {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.9);
        color: white;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .rotate-icon {
        font-size: 80px;
        animation: rotate 2s infinite;
    }
}
```

### Lock Screen Orientation
Utiliser l'API Screen Orientation pour forcer le paysage :

```javascript
if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(err => {
        console.log('Impossible de verrouiller l\'orientation:', err);
    });
}
```

## 📝 Notes

- **PWA Manifest** : `"orientation": "landscape-primary"` déjà configuré
- **Viewport** : `viewport-fit=cover` pour utiliser tout l'écran
- **Service Worker** : Fonctionne dans tous les modes
- **Performance** : Aucun impact, mode paysage optimal

---

**Status** : ✅ Implémenté  
**Version** : 1.0  
**Date** : 17 janvier 2026  
**Déployé** : https://unispourlapaix.github.io/X-Sheep/
