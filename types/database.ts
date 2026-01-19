// Database Types for Mundial Hub

export interface User {
    id: string;
    email: string;
    username: string;
    avatar_url: string | null;
    total_points: number;
    current_streak: number;
    created_at: string;
    updated_at: string;
}

export interface Team {
    id: string;
    name: string;
    code: string; // ISO 3166-1 alpha-3
    flag_url: string;
    group: string;
}

export interface Match {
    id: string;
    home_team: Team;
    away_team: Team;
    home_score: number | null;
    away_score: number | null;
    match_date: string;
    match_time: string;
    venue: string;
    city: string;
    stage: 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final';
    status: 'scheduled' | 'live' | 'finished' | 'postponed';
    group: string | null;
}

export interface Prediction {
    id: string;
    user_id: string;
    match_id: string;
    home_score: number;
    away_score: number;
    points_earned: number | null;
    created_at: string;
    updated_at: string;
}

export interface LeaderboardEntry {
    rank: number;
    user: Pick<User, 'id' | 'username' | 'avatar_url'>;
    total_points: number;
    correct_predictions: number;
    current_streak: number;
    plenos: number;              // Exact score predictions (3 pts each)
    ganadores_acertados: number; // Winner-only predictions (1 pt each)
    trend: 'up' | 'down' | 'same' | null; // Position change indicator
}
