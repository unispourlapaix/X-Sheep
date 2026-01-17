# 🔧 Guide de Test Service Worker

## Problème Résolu

**Erreur initiale :**
```
❌ Erreur Service Worker: TypeError: ServiceWorker script at http://localhost:3000/sw.js 
for scope http://localhost:3000/ encountered an error during installation.
```

## Solution Implémentée

### 1. **Détection Automatique de l'Environnement**

Le Service Worker détecte maintenant automatiquement s'il est en localhost ou en production :

```javascript
// sw.js
const isProduction = self.location.hostname !== 'localhost' && 
                     self.location.hostname !== '127.0.0.1';
const BASE_PATH = isProduction ? '/X-Sheep' : '';
```

### 2. **Enregistrement Dynamique**

Le chemin du Service Worker s'adapte automatiquement :

```javascript
// index.html
const swPath = window.location.pathname.includes('/X-Sheep/') 
    ? '/X-Sheep/sw.js' 
    : '/sw.js';
navigator.serviceWorker.register(swPath);
```

### 3. **Manifests Séparés**

- **Production** : `/manifest.json` (avec chemins `/X-Sheep/...`)
- **Développement** : `/manifest-dev.json` (avec chemins `/...`)

Le bon manifest est chargé automatiquement selon l'environnement.

## 🧪 Comment Tester

### Test en Localhost

1. **Démarrer le serveur :**
   ```bash
   npm run dev
   ```

2. **Ouvrir dans le navigateur :**
   ```
   http://localhost:3000/X-Sheep/
   ```

3. **Ouvrir la console développeur (F12)**

4. **Vérifier les messages :**
   ```
   ✅ Service Worker enregistré: http://localhost:3000/
   [SW] Installation...
   [SW] Cache ouvert
   [SW] Activation...
   ```

5. **Vérifier dans l'onglet "Application" > "Service Workers" :**
   - Status : "activated and is running"
   - Source : `/sw.js`
   - Scope : `http://localhost:3000/`

### Test en Production (GitHub Pages)

1. **Accéder au site :**
   ```
   https://unispourlapaix.github.io/X-Sheep/
   ```

2. **Ouvrir la console :**
   ```
   ✅ Service Worker enregistré: https://unispourlapaix.github.io/X-Sheep/
   ```

3. **Vérifier le Service Worker :**
   - Source : `/X-Sheep/sw.js`
   - Scope : `https://unispourlapaix.github.io/X-Sheep/`

### Test Offline

1. **Charger le jeu normalement**
2. **Ouvrir DevTools > Application > Service Workers**
3. **Cocher "Offline"**
4. **Recharger la page (F5)**
5. **Le jeu doit se charger depuis le cache**

Console attendue :
```
[SW] Chargement depuis cache: /X-Sheep/index.html
[SW] Chargement depuis cache: /X-Sheep/src/main.js
...
```

## 🔍 Débogage

### Effacer le Service Worker

Si vous avez des problèmes, effacez complètement le SW :

1. **DevTools > Application > Service Workers**
2. **Cliquer "Unregister"**
3. **Application > Clear storage > Clear site data**
4. **Recharger la page (Ctrl+Shift+R)**

### Vérifier le Cache

1. **DevTools > Application > Cache Storage**
2. **Ouvrir "x-sheep-v1.0.1"**
3. **Vérifier les fichiers mis en cache**

### Version du Cache

Si vous modifiez le Service Worker, pensez à changer la version :

```javascript
// sw.js
const CACHE_NAME = 'x-sheep-v1.0.2'; // Incrémenter
```

## 📊 Différences Localhost vs Production

| Aspect | Localhost | Production |
|--------|-----------|------------|
| **SW Path** | `/sw.js` | `/X-Sheep/sw.js` |
| **Manifest** | `/manifest-dev.json` | `/manifest.json` |
| **Base Path** | `/` | `/X-Sheep/` |
| **Icons** | `/icon-512x512.png` | `/X-Sheep/icon-512x512.png` |
| **Scope** | `http://localhost:3000/` | `https://.../X-Sheep/` |

## ✅ Checklist de Vérification

- [ ] SW s'enregistre sans erreur
- [ ] Cache se remplit progressivement
- [ ] Le jeu fonctionne offline
- [ ] Pas d'erreurs 404 dans la console
- [ ] Manifest se charge correctement
- [ ] Les icônes s'affichent
- [ ] L'installation PWA est proposée

## 🚀 Déploiement

Les changements sont automatiquement déployés via GitHub Actions :

1. **Commit & Push** : Modifications envoyées sur `main`
2. **GitHub Actions** : Build automatique avec Vite
3. **Pages** : Déploiement sur `gh-pages` branch
4. **Live** : Disponible sur https://unispourlapaix.github.io/X-Sheep/

Délai de déploiement : ~2-3 minutes

## 💡 Astuces

### Hard Refresh
Pour forcer le rechargement sans cache :
- **Windows/Linux** : `Ctrl + Shift + R`
- **Mac** : `Cmd + Shift + R`

### Tester en Mode Incognito
Utile pour tester l'installation PWA fraîche sans cache existant.

### Simuler Connexion Lente
DevTools > Network > Throttling > Slow 3G

### Logs Détaillés du SW
```javascript
// Ajouter dans sw.js pour plus de logs
console.log('[SW] Fetch:', event.request.url);
```

## 🐛 Problèmes Connus

### "Manifest not found"
**Cause** : Mauvais chemin du manifest  
**Solution** : Vérifier que le script de détection s'exécute avant le chargement

### "Cache API unavailable"
**Cause** : HTTP non sécurisé (hors localhost)  
**Solution** : Utiliser HTTPS ou localhost uniquement

### "SW Update Loop"
**Cause** : Changement constant du cache name  
**Solution** : Ne changer la version qu'après tests complets

---

**Dernière mise à jour** : 17 janvier 2026  
**Version SW** : 1.0.1  
**Status** : ✅ Fonctionnel localhost & production
