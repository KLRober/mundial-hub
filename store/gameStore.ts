import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, DailyProgress, GameResult } from '@/types/game';

interface GameStore {
    // Current game state
    currentGame: GameState | null;

    // Daily progress tracking
    dailyProgress: DailyProgress;

    // Actions
    startGame: (gameId: string, timeLimit: number) => void;
    updateScore: (points: number) => void;
    decrementTime: () => void;
    loseLife: () => void;
    endGame: () => GameResult | null;
    resetDailyProgress: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

const initialDailyProgress: DailyProgress = {
    date: getToday(),
    gamesPlayed: [],
    totalPointsEarned: 0,
    dailyStreak: 0,
};

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            currentGame: null,
            dailyProgress: initialDailyProgress,

            startGame: (gameId: string, timeLimit: number) => {
                set({
                    currentGame: {
                        isPlaying: true,
                        currentScore: 0,
                        highScore: 0,
                        timeRemaining: timeLimit,
                        lives: 3,
                    },
                });
            },

            updateScore: (points: number) => {
                set((state) => ({
                    currentGame: state.currentGame
                        ? {
                            ...state.currentGame,
                            currentScore: state.currentGame.currentScore + points,
                        }
                        : null,
                }));
            },

            decrementTime: () => {
                set((state) => ({
                    currentGame: state.currentGame
                        ? {
                            ...state.currentGame,
                            timeRemaining: Math.max(0, state.currentGame.timeRemaining - 1),
                        }
                        : null,
                }));
            },

            loseLife: () => {
                set((state) => ({
                    currentGame: state.currentGame
                        ? {
                            ...state.currentGame,
                            lives: Math.max(0, state.currentGame.lives - 1),
                        }
                        : null,
                }));
            },

            endGame: () => {
                const { currentGame, dailyProgress } = get();
                if (!currentGame) return null;

                const result: GameResult = {
                    gameId: 'current',
                    score: currentGame.currentScore,
                    pointsEarned: currentGame.currentScore,
                    completedAt: new Date().toISOString(),
                    isNewHighScore: currentGame.currentScore > currentGame.highScore,
                };

                // Update daily progress
                const today = getToday();
                const isNewDay = dailyProgress.date !== today;

                set({
                    currentGame: null,
                    dailyProgress: isNewDay
                        ? {
                            date: today,
                            gamesPlayed: [result.gameId],
                            totalPointsEarned: result.pointsEarned,
                            dailyStreak: 1,
                        }
                        : {
                            ...dailyProgress,
                            gamesPlayed: [...dailyProgress.gamesPlayed, result.gameId],
                            totalPointsEarned: dailyProgress.totalPointsEarned + result.pointsEarned,
                        },
                });

                return result;
            },

            resetDailyProgress: () => {
                set({ dailyProgress: initialDailyProgress });
            },
        }),
        {
            name: 'mundial-hub-game-store',
        }
    )
);
