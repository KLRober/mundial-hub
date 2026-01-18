import { supabase } from '@/lib/supabase';
import type { PlayoffPredictions } from '@/types/playoffTypes';

/**
 * Get user's playoff predictions from Supabase
 */
export async function getPlayoffPredictions(userId: string): Promise<PlayoffPredictions> {
    const { data, error } = await supabase
        .from('playoff_predictions')
        .select('match_id, winner_code')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching playoff predictions:', error);
        return {};
    }

    // Convert to PlayoffPredictions map
    const predictions: PlayoffPredictions = {};
    data.forEach((row: any) => {
        predictions[row.match_id] = row.winner_code;
    });

    return predictions;
}

/**
 * Save playoff predictions to Supabase
 */
export async function savePlayoffPredictions(
    userId: string,
    predictions: PlayoffPredictions
): Promise<{ success: boolean; error?: string }> {
    // Convert map to array of objects for upsert
    const predictionsArray = Object.entries(predictions).map(([matchId, winnerCode]) => ({
        user_id: userId,
        match_id: matchId,
        winner_code: winnerCode,
        updated_at: new Date().toISOString(),
    }));

    if (predictionsArray.length === 0) return { success: true };

    const { error } = await supabase
        .from('playoff_predictions')
        .upsert(predictionsArray, {
            onConflict: 'user_id,match_id',
        });

    if (error) {
        console.error('Error saving playoff predictions:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
