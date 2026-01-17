/**
 * Configuration de la console pour production
 * Désactive les logs en production (GitHub Pages)
 */

// Détecter si on est en production
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// Désactiver les logs en production
if (isProduction) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Garder console.warn et console.error pour le débogage critique
}

export const isDev = !isProduction;
