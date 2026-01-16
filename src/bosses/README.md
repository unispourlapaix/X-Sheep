# Modules Boss - X-Sheep

Dossier contenant les modules spécialisés pour chaque boss du mode infini.

## Architecture

Chaque boss complexe possède son propre module avec toute sa logique d'animation géométrique.

### SerpentBoss.js (ID: E-manuel)

**Boss serpent venimeux ultime** avec 12 segments animés.

#### Caractéristiques :
- **12 segments** avec tailles progressives (tête: 200px → queue: 30px)
- **Écailles octogonales** noires avec centres jaune-vert toxiques
- **Bandes d'avertissement** jaunes tous les 3 segments
- **Yeux verts lumineux** avec pupilles fendues verticales + clignement
- **Langue fourchue rouge** qui s'étend/rétracte avec crochets blancs
- **Crocs venimeux** blancs avec gouttes de venin animées
- **Sonnette dorée** sur la queue avec 3 anneaux vibrants
- **Contours lumineux** jaune-vert pulsants
- **Animation ondulante** fluide sur tout le corps

#### Couleurs :
- Vert sombre: `#1a4d1a` (base)
- Vert très sombre: `#0d260d` (alterné)
- Jaune-vert toxique: `#CCFF00` (avertissement)
- Noir: `#000000` (écailles, marques)
- Vert lumineux: `#00ff41` (yeux, venin)
- Rouge: `#ff0000` (langue)
- Or: `#FFD700` (sonnette, crochets)

#### Optimisations :
- **Cache octogonal** pré-calculé (points réutilisés)
- **Pré-calcul** des animations dans `update()`
- **Maximum 5 écailles** par segment
- **Phases de mouvement** synchronisées

#### Utilisation :

```javascript
import SerpentBoss from '../bosses/SerpentBoss.js';

// Création
this.serpentBoss = new SerpentBoss();

// Update (chaque frame)
this.serpentBoss.update(gameTime, boss);

// Render
this.serpentBoss.render(ctx, boss);
```

#### Intégration dans EndlessMode.js :

Le serpent remplace le rendu standard pour le boss `dragon` :

```javascript
if (this.currentBoss.id === 'dragon') {
    this.serpentBoss.update(this.game.gameTime, this.currentBoss);
    this.serpentBoss.render(ctx, this.currentBoss);
} else {
    this.visualBoss.render(ctx, this.currentBoss);
}
```

### DragonBoss.js (ID: E-manuel)

**Dragon de feu** avec 12 segments animés.

#### Caractéristiques :
- **12 segments** avec tailles progressives (tête: 200px → queue: 30px)
- **Ailes battantes** sur segments 2 et 4 avec membranes et os
- **Pattes griffues** sur segments 3, 6, 9 (3 griffes par patte)
- **Écailles triangulaires** rouge-orange et noires
- **Cornes noires** sur la tête avec anneaux décoratifs
- **Yeux dorés** avec pupilles fendues verticales + clignement
- **Langue fourchue rouge** qui s'étend/rétracte
- **Crocs dorés** avec gradient et reflets brillants
- **Particules de flammes** sortant de la bouche (gradient or→rouge)
- **Contours lumineux** orange-rouge pulsants

#### Couleurs :
- Rouge sombre: `#8B0000` (base)
- Noir: `#000000` (alterné, griffes, cornes)
- Orange-rouge: `#FF4500` (contours feu, écailles)
- Or: `#FFD700` (yeux, crocs)
- Rouge: `#ff0000` (langue)
- Orange flamme: `#FF6600` (particules)
- Gris foncé: `#333333` (griffes)

#### Optimisations :
- **Cache triangulaire** pré-calculé (points réutilisés)
- **Pré-calcul** des animations dans `update()`
- **Maximum 6 écailles** par segment
- **Gestion des particules** avec limite de vie

#### Utilisation :

```javascript
import DragonBoss from '../bosses/DragonBoss.js';

// Création
this.dragonBoss = new DragonBoss();

// Update (chaque frame)
this.dragonBoss.update(gameTime, boss);

// Render
this.dragonBoss.render(ctx, boss);
```

#### Intégration dans EndlessMode.js :

Le dragon remplace le rendu standard pour le boss `dragon` :

```javascript
if (this.currentBoss.id === 'dragon') {
    this.dragonBoss.render(ctx, this.currentBoss);
} else if (this.currentBoss.id === 'whale') {
    this.serpentBoss.render(ctx, this.currentBoss);
} else {
    this.visualBoss.render(ctx, this.currentBoss);
}
```

## Futurs Modules Boss

D'autres boss pourront avoir leurs propres modules :
- `KrakenBoss.js` - Pieuvre alien futuriste (actuellement dans VisualBoss)
- `UFOBoss.js` - OVNI avec faisceau tracteur
- `SharkBoss.js` - Requin mécanique
- `RobotBoss.js` - Robot géant

## Performance

Les modules boss sont optimisés pour :
- **60 FPS** constant
- **Pré-calculs** dans update()
- **Cache de géométrie** pour formes répétées
- **Nombre limité** d'éléments visuels par frame
