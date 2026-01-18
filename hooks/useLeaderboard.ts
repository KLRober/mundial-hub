import useSWR from 'swr';
import { getLeaderboard, getUserRank } from '@/services/leaderboard';
import type { LeaderboardEntry } from '@/types/database';

export function useLeaderboard(limit: number = 10) {
    const { data, error, isLoading, mutate } = useSWR<LeaderboardEntry[]>(
        `leaderboard?limit=${limit}`,
        () => getLeaderboard(limit),
        {
            refreshInterval: 300000, // Refresh every 5 minutes
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    return {
        leaderboard: data ?? [],
        isLoading,
        isError: !!error,
        error,
        refresh: mutate,
    };
}

export function useUserRank(userId: string | null) {
    const { data, error, isLoading } = useSWR<LeaderboardEntry | null>(
        userId ? `leaderboard/user/${userId}` : null,
        () => (userId ? getUserRank(userId) : null),
        {
            refreshInterval: 300000,
            revalidateOnFocus: true,
        }
    );

    return {
        userRank: data,
        isLoading,
        isError: !!error,
        error,
    };
}
