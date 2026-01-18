import useSWR from 'swr';
import { getTodayMatches, getMatchById } from '@/services/matches';
import type { Match } from '@/types/database';

export function useMatches() {
    const { data, error, isLoading, mutate } = useSWR<Match[]>(
        'matches/today',
        getTodayMatches,
        {
            refreshInterval: 60000, // Refresh every minute for live scores
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    return {
        matches: data ?? [],
        isLoading,
        isError: !!error,
        error,
        refresh: mutate,
    };
}

export function useMatch(matchId: string | null) {
    const { data, error, isLoading, mutate } = useSWR<Match | null>(
        matchId ? `matches/${matchId}` : null,
        () => (matchId ? getMatchById(matchId) : null),
        {
            refreshInterval: 30000, // Refresh every 30s for live match
            revalidateOnFocus: true,
        }
    );

    return {
        match: data,
        isLoading,
        isError: !!error,
        error,
        refresh: mutate,
    };
}
