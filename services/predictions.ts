// Predictions Service - Supabase integration for user predictions

import { supabase } from '@/lib/supabase';
import type { GroupPredictions } from '@/types/groupStandings';

export interface StoredPrediction {
    id: string;
    user_id: string;
    match_id: string;
    pred_local: number;
    pred_visitante: number;
    puntos_ganados: number | null;
    created_at: string;
}

/**
 * Load all predictions for a user
 */
export async function getUserPredictions(userId: string): Promise<GroupPredictions> {
    const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error loading predictions:', error);
        return {};
    }

    // Convert to GroupPredictions format
    const predictions: GroupPredictions = {};
    data?.forEach((pred: StoredPrediction) => {
        predictions[pred.match_id] = {
            home: pred.pred_local,
            away: pred.pred_visitante,
        };
    });

    return predictions;
}

/**
 * Save multiple predictions in batch
 * Uses upsert to update existing or insert new predictions
 */
export async function savePredictions(
    userId: string,
    predictions: GroupPredictions
): Promise<{ success: boolean; error?: string }> {
    // Convert to array format for upsert
    const predictionsArray = Object.entries(predictions).map(([matchId, pred]) => ({
        user_id: userId,
        match_id: matchId,
        pred_local: pred.home,
        pred_visitante: pred.away,
    }));

    if (predictionsArray.length === 0) {
        return { success: true };
    }

    const { error } = await supabase
        .from('predictions')
        .upsert(predictionsArray, {
            onConflict: 'user_id,match_id',
        });

    if (error) {
        console.error('Error saving predictions:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Save a single prediction
 */
export async function saveSinglePrediction(
    userId: string,
    matchId: string,
    homeGoals: number,
    awayGoals: number
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('predictions')
        .upsert({
            user_id: userId,
            match_id: matchId,
            pred_local: homeGoals,
            pred_visitante: awayGoals,
        }, {
            onConflict: 'user_id,match_id',
        });

    if (error) {
        console.error('Error saving prediction:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
