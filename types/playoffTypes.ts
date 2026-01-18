// Playoff Types for World Cup 2026 Elimination Phase

import type { WorldCupTeam } from '@/lib/worldCupData';

export type PlayoffRound = 'R32' | 'R16' | 'QF' | 'SF' | 'F';

export interface QualifiedTeam {
    team: WorldCupTeam;
    position: 1 | 2 | 3;
    group: string;
    points: number;
    goalDiff: number;
    goalsFor: number;
    originLabel: string; // "1° Grupo A", "2° Grupo B", "Mejor 3°"
}

export interface PlayoffMatch {
    id: string;
    round: PlayoffRound;
    position: number; // Position within the round (1-16 for R32, 1-8 for R16, etc.)
    team1: QualifiedTeam | null;
    team2: QualifiedTeam | null;
    winner: string | null; // team code of winner
    nextMatchId: string | null; // ID of match in next round
    nextSlot: 1 | 2 | null; // Which slot (team1 or team2) in next match
}

export interface PlayoffBracket {
    r32: PlayoffMatch[]; // 16 matches
    r16: PlayoffMatch[]; // 8 matches
    qf: PlayoffMatch[];  // 4 matches
    sf: PlayoffMatch[];  // 2 matches
    final: PlayoffMatch; // 1 match
}

export interface PlayoffPredictions {
    [matchId: string]: string; // matchId -> winner team code
}

export const ROUND_NAMES: Record<PlayoffRound, string> = {
    'R32': 'Dieciseisavos',
    'R16': 'Octavos de Final',
    'QF': 'Cuartos de Final',
    'SF': 'Semifinales',
    'F': 'Final'
};

export const ROUND_ORDER: PlayoffRound[] = ['R32', 'R16', 'QF', 'SF', 'F'];
