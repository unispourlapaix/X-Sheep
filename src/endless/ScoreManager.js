// ScoreManager.js - Gestion avancée du scoring
export class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.highScores = this.loadHighScores();
        this.maxScore = this.loadMaxScore();
        this.totalXP = this.loadTotalXP();
    }
    
    addPoints(points, multiplier = 1.0) {
        this.currentScore += Math.floor(points * multiplier);
        
        // Mettre à jour le score max si dépassé
        if (this.currentScore > this.maxScore) {
            this.maxScore = this.currentScore;
            this.saveMaxScore(this.maxScore);
        }
    }
    
    addXP(xp) {
        this.totalXP += xp;
        this.saveTotalXP(this.totalXP);
    }
    
    loadMaxScore() {
        const saved = localStorage.getItem('xsheep_maxScore');
        return saved ? parseInt(saved) : 0;
    }
    
    saveMaxScore(score) {
        localStorage.setItem('xsheep_maxScore', score.toString());
    }
    
    loadTotalXP() {
        const saved = localStorage.getItem('xsheep_totalXP');
        return saved ? parseInt(saved) : 0;
    }
    
    saveTotalXP(xp) {
        localStorage.setItem('xsheep_totalXP', xp.toString());
    }
    
    getMaxScore() {
        return this.maxScore;
    }
    
    getTotalXP() {
        return this.totalXP;
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
