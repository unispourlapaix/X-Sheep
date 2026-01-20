# 💾 Système de Sauvegarde des Scores

## Stratégie de Sauvegarde

Les scores sont maintenant sauvegardés automatiquement selon 3 déclencheurs :

### 1. ⏱️ Sauvegarde Automatique (Toutes les 2 minutes)
- **Timer** : `setInterval` de 120 000 ms (2 minutes)
- **Activation** : Dès le démarrage du jeu avec `start()`
- **Désactivation** : À l'arrêt du jeu (game over, victoire, restart)
- **Méthode** : `autoSaveScore()` dans `Game.js`

### 2. 🏁 Sauvegarde à la Fin de Chaque Niveau
Sauvegardes déclenchées lors des transitions de niveau :

#### Fin Niveau 1 → Niveau 2
- **Quand** : Après 3 secondes de délai avant le passage
- **Méthode** : `saveCurrentScore()` appelée dans le `setTimeout` avant `startLevel2()`
- **Log** : "💾 Score sauvegardé à la fin du niveau 1"

#### Fin Niveau 2 → Niveau 3
- **Quand** : Après 3 secondes de délai avant le passage
- **Méthode** : `saveCurrentScore()` appelée dans le `setTimeout` avant `startLevel3()`
- **Log** : "💾 Score sauvegardé à la fin du niveau 2"

#### Fin Niveau 3 (Victoire)
- **Quand** : Dès l'entrée dans `showLevel3Victory()`
- **Méthode** : `stopAutoSave()` puis `scoreManager.addAdventureScore(this.score)`
- **Particularité** : Cumule le score avec les précédents runs
- **Log** : "💾 Score aventure final sauvegardé: X | Total: Y"

### 3. 💀 Sauvegarde au Game Over
- **Quand** : Au début de `gameOver()` dans `Game.js`
- **Méthode** : `stopAutoSave()` puis `saveCurrentScore()`
- **Mode Infini** : Sauvegarde aussi dans `EndlessMode.showGameOver()`
- **Log** : "💾 Score sauvegardé au game over"

## Différenciation des Modes

### Mode Aventure (`adventure`)
- **Clé localStorage** : `xsheep_lastAdventureScore` (score actuel de la session)
- **Clé cumulative** : `xsheep_adventureScore` (total de tous les runs)
- **Sauvegarde** : Score actuel + cumul au niveau 3 terminé
- **Affichage** : Sous la carte "AVENTURE" dans le menu

### Mode Infini (`endless`)
- **Clé localStorage** : `xsheep_maxScore`
- **Sauvegarde** : Uniquement si nouveau record
- **Affichage** : Sous la carte "INFINI" dans le menu
- **Particularité** : Aussi sauvegardé dans `EndlessMode.showGameOver()`

## Méthodes Clés

### `saveCurrentScore()` - Sauvegarde intelligente selon le mode
```javascript
saveCurrentScore() {
    const scoreManager = new ScoreManager();
    
    if (this.mode === 'adventure') {
        // Sauvegarde simple du score actuel
        localStorage.setItem('xsheep_lastAdventureScore', this.score.toString());
        console.log('💾 Score aventure sauvegardé:', this.score);
    } else if (this.mode === 'endless') {
        // Sauvegarde si record battu
        const currentMax = scoreManager.loadMaxScore();
        if (this.score > currentMax) {
            scoreManager.saveMaxScore(this.score);
            console.log('💾 Nouveau record infini sauvegardé:', this.score);
        }
    }
}
```

### `startAutoSave()` - Démarrage du timer
```javascript
startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
        this.autoSaveScore();
    }, this.AUTO_SAVE_DELAY);
    console.log('💾 Sauvegarde automatique activée (toutes les 2min)');
}
```

### `stopAutoSave()` - Arrêt du timer
```javascript
stopAutoSave() {
    if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
        console.log('⏹️ Sauvegarde automatique arrêtée');
    }
}
```

## Rafraîchissement de l'Affichage

### Menu System
- **Callback** : `onShow()` ajouté au constructeur de `MenuSystem`
- **Appel** : Lors de `MenuSystem.show()`
- **Action** : Rafraîchit les scores via `refreshScores()` dans `main.js`

### Main.js
```javascript
// Callback configuré lors de l'initialisation
this.menu = new MenuSystem({
    onModeSelected: (mode) => this.startGame(mode),
    onShow: () => this.refreshScores()
});
```

## Logs de Debug

Tous les événements de sauvegarde sont loggés avec des emojis distincts :

- 💾 `"Sauvegarde automatique activée (toutes les 2min)"`
- ⏹️ `"Sauvegarde automatique arrêtée"`
- 💾 `"Sauvegarde automatique effectuée"`
- 💾 `"Score sauvegardé à la fin du niveau X"`
- 💾 `"Score aventure final sauvegardé: X | Total: Y"`
- 💾 `"Score sauvegardé au game over"`
- 💾 `"Nouveau record infini sauvegardé: X"`
- 📊 `"Score Infini: X | Record: Y"` (si pas de record)
- 🔄 `"Scores rafraîchis"` (lors du retour au menu)
- 📊 `"Score Infini affiché: X"`
- 📊 `"Score Aventure affiché: Y"`

## Test de Cohérence

Utiliser [test-scores.html](test-scores.html) pour :
- ✅ Tester manuellement les sauvegardes
- ✅ Vérifier la cohérence localStorage
- ✅ Simuler des scores et valider l'affichage
- ✅ Observer l'état en temps réel

## Fichiers Modifiés

1. **src/core/Game.js** - Logique principale de sauvegarde
2. **src/endless/EndlessMode.js** - Logs game over
3. **src/endless/ScoreManager.js** - Logs détaillés des opérations
4. **src/main.js** - Rafraîchissement et logs affichage
5. **src/ui/MenuSystem.js** - Callback onShow
6. **test-scores.html** - Page de test (nouveau)

## Clés localStorage Utilisées

| Clé | Usage | Type |
|-----|-------|------|
| `xsheep_maxScore` | Record mode Infini | number |
| `xsheep_adventureScore` | Cumul mode Aventure | number |
| `xsheep_lastAdventureScore` | Score session Aventure | number |
| `xsheep_currentLevel` | Niveau actuel (1, 2, 3) | number |
| `xsheep_totalXP` | XP total | number |

---

**Date** : 20 janvier 2026  
**Objectif** : Assurer la persistance des scores avec sauvegardes fréquentes et fiables
