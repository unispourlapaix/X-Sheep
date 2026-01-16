// ScoreManager.js - Gestion avancée du scoring
export class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.highScores = this.loadHighScores();
    }
    
    addPoints(points, multiplier = 1.0) {
        this.currentScore += Math.floor(points * multiplier);
    }
    
    loadHighScores() {
        const saved = localStorage.getItem('moutonCourageLeaderboard');
        return saved ? JSON.parse(saved) : [];
    }
    
    saveHighScore(score, name = 'Anonymous') {
        const entry = {
            score: score,
            name: name,
            date: new Date().toISOString()
        };
        
        this.highScores.push(entry);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Top 10
        
        localStorage.setItem('moutonCourageLeaderboard', JSON.stringify(this.highScores));
    }
    
    getLeaderboard() {
        return this.highScores;
    }
}
