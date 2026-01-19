// Admin Points Processing Service
// Handles calculating and updating user points when admin finalizes matches

import { supabase } from '@/lib/supabase';

export interface MatchResult {
    matchId: string;
    matchType: 'group' | 'playoff';
    homeGoals?: number;
    awayGoals?: number;
    winnerCode?: string;
}

/**
 * Save match result to database
 */
export async function saveMatchResult(result: MatchResult): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('match_results')
        .upsert({
            match_id: result.matchId,
            match_type: result.matchType,
            home_goals: result.homeGoals ?? null,
            away_goals: result.awayGoals ?? null,
            winner_code: result.winnerCode ?? null,
            processed: false
        }, {
            onConflict: 'match_id'
        });

    if (error) {
        console.error('Error saving match result:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Process points for a group stage match
 * Compares real result with user predictions and awards points
 */
export async function processGroupMatchPoints(
    matchId: string,
    homeGoals: number,
    awayGoals: number
): Promise<{ success: boolean; usersUpdated: number; error?: string }> {
    try {
        // 1. Get all predictions for this match
        const { data: predictions, error: predError } = await supabase
            .from('predictions')
            .select('id, user_id, pred_local, pred_visitante')
            .eq('match_id', matchId);

        if (predError) {
            return { success: false, usersUpdated: 0, error: predError.message };
        }

        if (!predictions || predictions.length === 0) {
            // No predictions for this match, just save result
            await supabase
                .from('match_results')
                .upsert({
                    match_id: matchId,
                    match_type: 'group',
                    home_goals: homeGoals,
                    away_goals: awayGoals,
                    processed: true,
                    processed_at: new Date().toISOString()
                }, { onConflict: 'match_id' });

            return { success: true, usersUpdated: 0 };
        }

        // 2. Determine real result type
        const realResult = homeGoals > awayGoals ? 'home' : homeGoals < awayGoals ? 'away' : 'draw';

        // 3. Calculate points for each prediction
        const updates = predictions.map(pred => {
            const predResult = pred.pred_local > pred.pred_visitante ? 'home'
                : pred.pred_local < pred.pred_visitante ? 'away' : 'draw';

            let points = 0;

            // Exact score: 3 points
            if (pred.pred_local === homeGoals && pred.pred_visitante === awayGoals) {
                points = 3;
            }
            // Correct result: 1 point
            else if (predResult === realResult) {
                points = 1;
            }

            return {
                id: pred.id,
                user_id: pred.user_id,
                puntos_ganados: points
            };
        });

        // 4. Update predictions with points
        for (const update of updates) {
            await supabase
                .from('predictions')
                .update({ puntos_ganados: update.puntos_ganados })
                .eq('id', update.id);
        }

        // 5. Update user total points
        const userIds = [...new Set(updates.map(u => u.user_id))];
        for (const userId of userIds) {
            await updateUserTotalPoints(userId);
        }

        // 6. Mark match as processed
        await supabase
            .from('match_results')
            .upsert({
                match_id: matchId,
                match_type: 'group',
                home_goals: homeGoals,
                away_goals: awayGoals,
                processed: true,
                processed_at: new Date().toISOString()
            }, { onConflict: 'match_id' });

        return { success: true, usersUpdated: userIds.length };
    } catch (err: any) {
        console.error('Error processing group match:', err);
        return { success: false, usersUpdated: 0, error: err.message };
    }
}

/**
 * Process points for a playoff match
 * Awards 3 points for correct winner prediction
 */
export async function processPlayoffMatchPoints(
    matchId: string,
    winnerCode: string
): Promise<{ success: boolean; usersUpdated: number; error?: string }> {
    try {
        // 1. Get all playoff predictions for this match
        const { data: predictions, error: predError } = await supabase
            .from('playoff_predictions')
            .select('id, user_id, winner_code')
            .eq('match_id', matchId);

        if (predError) {
            return { success: false, usersUpdated: 0, error: predError.message };
        }

        if (!predictions || predictions.length === 0) {
            // No predictions, just save result
            await supabase
                .from('match_results')
                .upsert({
                    match_id: matchId,
                    match_type: 'playoff',
                    winner_code: winnerCode,
                    processed: true,
                    processed_at: new Date().toISOString()
                }, { onConflict: 'match_id' });

            return { success: true, usersUpdated: 0 };
        }

        // 2. Update user total points for correct predictions
        const correctUsers = predictions.filter(p => p.winner_code === winnerCode);

        for (const pred of correctUsers) {
            await updateUserTotalPoints(pred.user_id);
        }

        // 3. Mark match as processed
        await supabase
            .from('match_results')
            .upsert({
                match_id: matchId,
                match_type: 'playoff',
                winner_code: winnerCode,
                processed: true,
                processed_at: new Date().toISOString()
            }, { onConflict: 'match_id' });

        return { success: true, usersUpdated: correctUsers.length };
    } catch (err: any) {
        console.error('Error processing playoff match:', err);
        return { success: false, usersUpdated: 0, error: err.message };
    }
}

/**
 * Reset a match result
 * Deletes result and resets points to avoid duplicates or errors
 */
export async function resetMatchResult(
    matchId: string,
    matchType: 'group' | 'playoff'
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Delete from match_results
        const { error: deleteError } = await supabase
            .from('match_results')
            .delete()
            .eq('match_id', matchId);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        // 2. Reset points in predictions
        let userIds: string[] = [];

        if (matchType === 'group') {
            const { data: predictions } = await supabase
                .from('predictions')
                .select('user_id')
                .eq('match_id', matchId);

            if (predictions) {
                userIds = [...new Set(predictions.map(p => p.user_id))];

                await supabase
                    .from('predictions')
                    .update({ puntos_ganados: null })
                    .eq('match_id', matchId);
            }
        } else {
            const { data: predictions } = await supabase
                .from('playoff_predictions')
                .select('user_id')
                .eq('match_id', matchId);

            if (predictions) {
                userIds = [...new Set(predictions.map(p => p.user_id))];
                // No need to reset individual column for playoff predictions as they don't store points directly
                // Points are calculated dynamically or summed up
            }
        }

        // 3. Recalculate totals for all affected users
        for (const userId of userIds) {
            await updateUserTotalPoints(userId);
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error resetting match:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Update a user's total points based on all their processed predictions
 */
async function updateUserTotalPoints(userId: string): Promise<void> {
    // Sum of group stage points
    const { data: groupPoints } = await supabase
        .from('predictions')
        .select('puntos_ganados')
        .eq('user_id', userId)
        .not('puntos_ganados', 'is', null);

    const groupTotal = groupPoints?.reduce((sum, p) => sum + (p.puntos_ganados || 0), 0) || 0;

    // Sum of playoff points (3 per correct)
    const { data: playoffPreds } = await supabase
        .from('playoff_predictions')
        .select('match_id, winner_code')
        .eq('user_id', userId);

    let playoffTotal = 0;
    if (playoffPreds && playoffPreds.length > 0) {
        for (const pred of playoffPreds) {
            const { data: result } = await supabase
                .from('match_results')
                .select('winner_code, processed')
                .eq('match_id', pred.match_id)
                .eq('processed', true)
                .single();

            if (result && result.winner_code === pred.winner_code) {
                playoffTotal += 3;
            }
        }
    }

    // Update profile
    await supabase
        .from('profiles')
        .update({ puntos_totales: groupTotal + playoffTotal })
        .eq('id', userId);
}

/**
 * Get all processed match results
 */
export async function getMatchResults(): Promise<MatchResult[]> {
    const { data, error } = await supabase
        .from('match_results')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching match results:', error);
        return [];
    }

    return data.map(r => ({
        matchId: r.match_id,
        matchType: r.match_type,
        homeGoals: r.home_goals,
        awayGoals: r.away_goals,
        winnerCode: r.winner_code
    }));
}

/**
 * Check if a match has been processed
 */
export async function isMatchProcessed(matchId: string): Promise<boolean> {
    const { data } = await supabase
        .from('match_results')
        .select('processed')
        .eq('match_id', matchId)
        .single();

    return data?.processed ?? false;
}
