// Español - Traductions espagnoles
// TODO: Compléter toutes les traductions
export default {
    meta: {
        language: 'Español',
        code: 'es',
        flag: '🇪🇸'
    },
    
    menu: {
        title: 'X-Sheep is back',
        subtitle: 'La Esperanza en Acción',
        createdBy: 'Creado con 💖 por',
        author: 'Emmanuel Payet',
        
        modes: {
            adventure: {
                title: 'AVENTURA',
                description: [
                    'Atraviesa las pruebas de la vida.',
                    'Mensajes narrativos profundos.',
                    'Alcanza la Puerta del Paraíso.'
                ],
                stats: {
                    chapters: 'Capítulos',
                    minutes: 'Minutos',
                    hope: 'Esperanza'
                }
            },
            endless: {
                title: 'INFINITO',
                description: [
                    'Supervivencia sin fin.',
                    'Puntuación y combos máximos.',
                    '¡Bate todos los récords!'
                ],
                stats: {
                    waves: 'Olas',
                    duration: 'Duración',
                    record: 'Récord'
                }
            }
        },
        
        score: 'Puntuación',
        graphics: {
            title: 'Elegir estilo gráfico',
            normal: 'Normal',
            pixelArt: 'Pixel Art'
        }
    },
    
    game: {
        levels: {
            level1: 'NIVEL 1: Las Pruebas de la Vida',
            level2: 'NIVEL 2: Los 7 Pecados Capitales',
            level3: 'NIVEL 3: Navegación y Sabiduría'
        },
        
        buttons: {
            retry: 'Reintentar',
            menu: 'Menú Principal',
            continue: 'Continuar',
            close: 'Cerrar',
            trophies: 'Ver Todos los Mensajes (Trofeos)'
        },
        
        gameOver: {
            title: 'GAME OVER',
            reachedLevel: 'Nivel Alcanzado',
            score: 'Puntuación',
            obstaclesAvoided: 'Obstáculos Evitados'
        },
        
        victory: {
            title: '¡VICTORIA!',
            levelCompleted: '¡Nivel Completado!',
            congratulations: '¡Felicitaciones! Perseveraste y superaste todos los obstáculos. La paciencia y la determinación son las claves del éxito. ¿Listo para el siguiente nivel?'
        },
        
        hud: {
            lives: 'Vidas',
            score: 'Puntuación',
            level: 'Nivel',
            combo: 'Combo',
            wisdom: 'Sabiduría'
        }
    },
    
    trophies: {
        title: 'COLECCIÓN DE TROFEOS',
        subtitle: 'Mensajes de coraje y esperanza',
        unlocked: 'Desbloqueado',
        locked: 'Bloqueado',
        share: 'Compartir',
        categories: {
            life: 'Pruebas de la Vida',
            existential: 'Amenazas Existenciales',
            richness: 'Pecados de Riqueza',
            mid: 'Peligros Intermedios',
            fun: 'Momentos Divertidos',
            special: 'Trofeos Especiales'
        }
    },
    
    // Les messages narratifs doivent être traduits (utilisant le français comme fallback pour l'instant)
    narrative: {
        wheelchair: {
            text: "¿Esta silla de ruedas? Yo también vivo con una discapacidad... ¡Pero mira, todavía puedo volar con mis sueños! Tu cuerpo puede estar limitado, pero tu espíritu es libre. Dios te dio alas que nadie puede romper. 💪✨",
            hope: "No estás definido por tus limitaciones"
        },
        // TODO: Compléter les autres traductions narratives
    },
    
    notifications: {
        levelTransition: 'Pasando al siguiente nivel...',
        trophyUnlocked: '¡Trofeo Desbloqueado!',
        powerUpCollected: '¡Power-up Recogido!',
        lifeRestored: '¡Vida Restaurada!'
    }
};
