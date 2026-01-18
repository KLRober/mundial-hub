// Game Types for Mundial Hub Minigames

export interface GameState {
    isPlaying: boolean;
    currentScore: number;
    highScore: number;
    timeRemaining: number;
    lives: number;
}

export interface DailyProgress {
    date: string;
    gamesPlayed: string[];
    totalPointsEarned: number;
    dailyStreak: number;
}

export interface MiniGame {
    id: string;
    name: string;
    description: string;
    icon: string;
    maxPoints: number;
    timeLimit: number; // in seconds
    isAvailable: boolean;
    cooldownEndsAt: string | null;
}

export interface GameResult {
    gameId: string;
    score: number;
    pointsEarned: number;
    completedAt: string;
    isNewHighScore: boolean;
}
