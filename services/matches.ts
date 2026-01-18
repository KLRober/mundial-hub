import { supabase } from '@/lib/supabase';
import type { Match } from '@/types/database';

export async function getTodayMatches(): Promise<Match[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('fecha', today)
        .order('match_time', { ascending: true });

    if (error) {
        console.error('Error fetching matches:', error);
        return [];
    }

    return (data || []).map(mapSupabaseMatch);
}

export async function getMatchById(id: string): Promise<Match | null> {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching match:', error);
        return null;
    }

    return data ? mapSupabaseMatch(data) : null;
}

export async function getUpcomingMatches(): Promise<Match[]> {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('estado', 'scheduled')
        .order('fecha', { ascending: true })
        .limit(10);

    if (error) {
        console.error('Error fetching upcoming matches:', error);
        return [];
    }

    return (data || []).map(mapSupabaseMatch);
}

// Helper to map Supabase raw data to frontend Match type
function mapSupabaseMatch(raw: any): Match {
    // Note: This mapping assumes the Supabase 'matches' table structure 
    // aligns somewhat with our Match interface, or we perform necessary transforms here.
    // For now, mapping simplified for the example. Real world might need 
    // joining with a 'teams' table if 'equipo_local' is just an ID.
    // Based on user request, match has 'equipo_local' text, which is simple.

    return {
        id: raw.id,
        home_team: {
            id: raw.equipo_local.substring(0, 3).toLowerCase(), // placeholder ID generation
            name: raw.equipo_local,
            code: raw.equipo_local.substring(0, 3).toUpperCase(),
            flag_url: '', // We might need a helper to get flags or store them in DB
            group: raw.group_name
        },
        away_team: {
            id: raw.equipo_visitante.substring(0, 3).toLowerCase(),
            name: raw.equipo_visitante,
            code: raw.equipo_visitante.substring(0, 3).toUpperCase(),
            flag_url: '',
            group: raw.group_name
        },
        home_score: raw.goles_local,
        away_score: raw.goles_visitante,
        match_date: raw.fecha.split('T')[0],
        match_time: new Date(raw.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        venue: raw.venue,
        city: raw.city,
        stage: 'group', // simplified
        status: raw.estado as 'scheduled' | 'live' | 'finished',
        group: raw.group_name
    };
}
