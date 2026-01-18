import type { LeaderboardEntry } from '@/types/database';

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
    {
        rank: 1,
        user: { id: 'u1', username: 'FutbolMaster', avatar_url: null },
        total_points: 2450,
        correct_predictions: 28,
        current_streak: 7,
    },
    {
        rank: 2,
        user: { id: 'u2', username: 'GoalHunter', avatar_url: null },
        total_points: 2200,
        correct_predictions: 25,
        current_streak: 5,
    },
    {
        rank: 3,
        user: { id: 'u3', username: 'ElCrack10', avatar_url: null },
        total_points: 1980,
        correct_predictions: 22,
        current_streak: 3,
    },
    {
        rank: 4,
        user: { id: 'u4', username: 'MundialPro', avatar_url: null },
        total_points: 1850,
        correct_predictions: 20,
        current_streak: 4,
    },
    {
        rank: 5,
        user: { id: 'u5', username: 'LaDorada26', avatar_url: null },
        total_points: 1720,
        correct_predictions: 19,
        current_streak: 2,
    },
];

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockLeaderboard.slice(0, limit);
}

export async function getUserRank(userId: string): Promise<LeaderboardEntry | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockLeaderboard.find((entry) => entry.user.id === userId) || null;
}
