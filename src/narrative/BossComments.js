// ============================================
// COMMENTAIRES IRONIQUES DU MOUTON POUR CHAQUE BOSS
// Avec onomatopées et réactions
// ============================================

export const BossComments = {
    // Baleine Fukushima
    whale: {
        appearance: [
            "Wahhh... une baleine radioactive ! 😱",
            "Nooon... Fukushima est venu me chercher ! 💀",
            "C'est une dinguerie ce truc ! 🤯"
        ],
        defeat: [
            "Retourne à l'océan, grosse ! 😎",
            "Plus jamais de sushi pour moi... 🤢"
        ],
        onomatopoeia: ["SPLASH!", "GLOUP!", "BLOUUUB!"]
    },

    // Kraken
    pacman: {
        appearance: [
            "Un Kraken avec une fusée ?! 😵",
            "Mais qui a armé cette bestiole ?! 🤨",
            "Tentacules + lasers = mauvaise idée ! 😰"
        ],
        defeat: [
            "Retourne jouer aux jeux vidéos, le calamar ! 🎮",
            "Tu fais moins le malin maintenant ! 😏"
        ],
        onomatopoeia: ["BZZZZT!", "WHOOSH!", "SLAP!"]
    },

    // Dragon de feu
    dragon: {
        appearance: [
            "Un dragon ?! Dans le PARADIS ?! 🔥",
            "Y'a vraiment un problème de sécurité ici... 😑",
            "WAHHH un dragon de feu ! Cours mouton, cours ! 🏃"
        ],
        defeat: [
            "Retourne dans ton donjon, lézard ! 🦎",
            "Dragon grillé, bien cuit ! 🍖"
        ],
        onomatopoeia: ["ROOAAR!", "WHOOOF!", "CRAAASH!"]
    },

    // Serpent venimeux
    serpent: {
        appearance: [
            "Un serpent géant... Évidemment. 🐍",
            "Non mais c'est l'arche de Noé ou quoi ?! 😤",
            "Ssssalut toi... 😰"
        ],
        defeat: [
            "Va mordre quelqu'un d'autre ! 😤",
            "Serpent aplati, mission accomplie ! ✅"
        ],
        onomatopoeia: ["SSSSSSS!", "SNAP!", "HISSS!"]
    },

    // OVNI
    ufo: {
        appearance: [
            "DES ALIENS MAINTENANT ?! 👽",
            "Mais qui gère ce paradis ?! 🤬",
            "E.T. téléphone... personne ! 📞"
        ],
        defeat: [
            "Retourne sur ta planète, le martien ! 🚀",
            "Area 51 t'attend ! 👋"
        ],
        onomatopoeia: ["VZZZZZ!", "PEW PEW!", "BEEP BOOP!"]
    },

    // Requin cybernétique
    shark: {
        appearance: [
            "Un requin cyborg ?! C'est du délire ! 🦈",
            "Terminator version poisson ! 🤖",
            "Nooon... pas les dents, pas les dents ! 😱"
        ],
        defeat: [
            "Requin frit aux circuits ! 🍤",
            "Jaws : Game Over ! 🎬"
        ],
        onomatopoeia: ["CHOMP!", "BZZT BZZT!", "SPLASH!"]
    },

    // Robot électrique
    robot: {
        appearance: [
            "Un robot domestique qui veut me tuer ?! 🤖",
            "Mon aspirateur s'est rebellé ! 😵",
            "Wahhh... ses yeux sont complètement fous ! 👀"
        ],
        defeat: [
            "Retour à l'usine pour toi ! 🏭",
            "Redémarrage forcé réussi ! 💻"
        ],
        onomatopoeia: ["BZZZZT!", "BEEP!", "KRRRRK!"]
    },

    // Boss de palier - Serpent géant
    stageSerpent: {
        appearance: [
            "MAMAN !!! 😱😱😱",
            "MAMAAAN ! C'est quoi ce monstre ?! 🐍💀",
            "NON NON NON ! MAMAN À L'AIDE ! 😭"
        ],
        defeat: [
            "OUAIS ! Même les gros tombent ! 💪",
            "Champion du monde ! 🏆"
        ],
        onomatopoeia: ["SSSSSSS!", "BOOM!", "CRASH!"]
    },

    // Boss de palier - Dragon géant
    stageDragon: {
        appearance: [
            "MAMAN !!! 😱😱😱",
            "MAMAAAN ! Un dragon géant ! 🐉🔥",
            "MAMAN JE VEUX RENTRER ! 😭💀"
        ],
        defeat: [
            "Dragon XXL : VAINCU ! 😎",
            "Plus grand = plus de laine à brûler ! 🔥"
        ],
        onomatopoeia: ["ROOOAAAAR!", "FWOOOOSH!", "BOOM!"]
    },

    // Commentaires génériques
    generic: {
        lowHealth: [
            "Aïe aïe aïe... ça pique ! 🤕",
            "Je tiens plus très longtemps... 😰",
            "Besoin d'un médecin ! 🏥"
        ],
        powerUp: [
            "Oh yeah ! Power-up ! ⚡",
            "C'est parti mon kiki ! 😎",
            "On va leur montrer ! 💪"
        ],
        nearDeath: [
            "NON NON NON ! Pas maintenant ! 😱",
            "Accroches-toi, petit mouton ! 🐑",
            "Juste... encore... un peu... 💀"
        ]
    }
};

// Sélectionner un commentaire aléatoire
export function getRandomComment(bossId, type = 'appearance') {
    const boss = BossComments[bossId];
    if (!boss || !boss[type]) {
        return "..."; // Défaut
    }
    const comments = boss[type];
    return comments[Math.floor(Math.random() * comments.length)];
}

// Obtenir une onomatopée
export function getOnomatopoeia(bossId) {
    const boss = BossComments[bossId];
    if (!boss || !boss.onomatopoeia) {
        return "BOOM!";
    }
    const sounds = boss.onomatopoeia;
    return sounds[Math.floor(Math.random() * sounds.length)];
}
