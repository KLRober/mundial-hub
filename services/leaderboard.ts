import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/types/database';

// Cache key for storing rankings to calculate trends
const RANKING_CACHE_KEY = 'mundial-hub-ranking-cache';

interface RankingCache {
    timestamp: number;
    rankings: { [userId: string]: number }; // userId -> rank
}

function getCachedRankings(): RankingCache | null {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(RANKING_CACHE_KEY);
        if (!cached) return null;
        return JSON.parse(cached);
    } catch {
        return null;
    }
}

function setCachedRankings(rankings: { [userId: string]: number }): void {
    if (typeof window === 'undefined') return;
    try {
        const cache: RankingCache = {
            timestamp: Date.now(),
            rankings
        };
        localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // Ignore storage errors
    }
}

function calculateTrend(
    userId: string,
    currentRank: number,
    previousRankings: { [userId: string]: number } | null
): 'up' | 'down' | 'same' | null {
    if (!previousRankings || !(userId in previousRankings)) {
        return null; // No previous data
    }
    const previousRank = previousRankings[userId];
    if (currentRank < previousRank) return 'up';   // Lower rank = better
    if (currentRank > previousRank) return 'down'; // Higher rank = worse
    return 'same';
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    // Fetch profiles with their prediction stats using a raw RPC call or aggregated query
    // Since Supabase doesn't easily support subqueries in select, we'll do two queries

    // First, get profiles ordered by points
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, puntos_totales')
        .order('puntos_totales', { ascending: false })
        .limit(limit);

    if (profilesError || !profiles) {
        console.error('Error fetching leaderboard:', profilesError);
        return [];
    }

    // Get prediction stats for all users in the leaderboard
    const userIds = profiles.map(p => p.id);

    const { data: predictionsData, error: predictionsError } = await supabase
        .from('predictions')
        .select('user_id, puntos_ganados')
        .in('user_id', userIds)
        .not('puntos_ganados', 'is', null);

    // Calculate stats per user
    const userStats: { [id: string]: { plenos: number; ganadores: number } } = {};

    if (!predictionsError && predictionsData) {
        for (const pred of predictionsData) {
            if (!userStats[pred.user_id]) {
                userStats[pred.user_id] = { plenos: 0, ganadores: 0 };
            }
            if (pred.puntos_ganados === 3) {
                userStats[pred.user_id].plenos++;
            } else if (pred.puntos_ganados === 1) {
                userStats[pred.user_id].ganadores++;
            }
        }
    }

    // Sort profiles by points, then by plenos as tiebreaker
    const sortedProfiles = [...profiles].sort((a, b) => {
        const pointsDiff = (b.puntos_totales || 0) - (a.puntos_totales || 0);
        if (pointsDiff !== 0) return pointsDiff;

        // Tiebreaker: more plenos = better
        const aPlenos = userStats[a.id]?.plenos || 0;
        const bPlenos = userStats[b.id]?.plenos || 0;
        return bPlenos - aPlenos;
    });

    // Get previous rankings for trend calculation
    const cachedData = getCachedRankings();
    const previousRankings = cachedData?.rankings || null;

    // Build the leaderboard entries
    const entries: LeaderboardEntry[] = sortedProfiles.map((profile, index) => {
        const rank = index + 1;
        const stats = userStats[profile.id] || { plenos: 0, ganadores: 0 };

        return {
            rank,
            user: {
                id: profile.id,
                username: profile.username || 'Anon',
                avatar_url: profile.avatar_url,
            },
            total_points: profile.puntos_totales || 0,
            correct_predictions: stats.plenos + stats.ganadores,
            current_streak: 0, // Streak calculation would require more complex query
            plenos: stats.plenos,
            ganadores_acertados: stats.ganadores,
            trend: calculateTrend(profile.id, rank, previousRankings),
        };
    });

    // Update cache with current rankings (for next comparison)
    const newRankings: { [userId: string]: number } = {};
    for (const entry of entries) {
        newRankings[entry.user.id] = entry.rank;
    }
    setCachedRankings(newRankings);

    return entries;
}

export async function getUserRank(userId: string): Promise<LeaderboardEntry | null> {
    // First get the user profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) return null;

    // Get user's prediction stats
    const { data: predictions } = await supabase
        .from('predictions')
        .select('puntos_ganados')
        .eq('user_id', userId)
        .not('puntos_ganados', 'is', null);

    let plenos = 0;
    let ganadores = 0;

    if (predictions) {
        for (const pred of predictions) {
            if (pred.puntos_ganados === 3) plenos++;
            else if (pred.puntos_ganados === 1) ganadores++;
        }
    }

    // Get count of people with more points (or same points but more plenos) to determine rank
    const { count: betterCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('puntos_totales', profile.puntos_totales || 0);

    const rank = (betterCount || 0) + 1;

    // Check previous ranking for trend
    const cachedData = getCachedRankings();
    const trend = calculateTrend(userId, rank, cachedData?.rankings || null);

    return {
        rank,
        user: {
            id: profile.id,
            username: profile.username || 'Anon',
            avatar_url: profile.avatar_url,
        },
        total_points: profile.puntos_totales || 0,
        correct_predictions: plenos + ganadores,
        current_streak: 0,
        plenos,
        ganadores_acertados: ganadores,
        trend,
    };
}
