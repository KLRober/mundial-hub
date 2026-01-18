import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/types/database';

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, puntos_totales')
        .order('puntos_totales', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    // Transform into LeaderboardEntry
    return (data || []).map((profile: any, index: number) => ({
        rank: index + 1,
        user: {
            id: profile.id,
            username: profile.username || 'Anon',
            avatar_url: profile.avatar_url,
        },
        total_points: profile.puntos_totales || 0,
        correct_predictions: 0, // Need to join/count predictions for real data
        current_streak: 0, // Streak calculation would require more complex query
    }));
}

export async function getUserRank(userId: string): Promise<LeaderboardEntry | null> {
    // For single user rank, normally we'd do a more complex query or use window functions in SQL
    // Simplified fetch for now

    // First get the user profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) return null;

    // Then get count of people with more points to determine rank
    const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('puntos_totales', profile.puntos_totales || 0);

    const rank = (count || 0) + 1;

    return {
        rank,
        user: {
            id: profile.id,
            username: profile.username || 'Anon',
            avatar_url: profile.avatar_url,
        },
        total_points: profile.puntos_totales || 0,
        correct_predictions: 0,
        current_streak: 0,
    };
}
