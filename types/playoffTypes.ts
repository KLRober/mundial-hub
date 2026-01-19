// Playoff Types for World Cup 2026 Elimination Phase

import type { WorldCupTeam } from '@/lib/worldCupData';

export type PlayoffRound = 'R32' | 'R16' | 'QF' | 'SF' | 'TP' | 'F';

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
    loser?: string | null; // team code of loser (for SF matches advancing to third place)
    nextMatchId: string | null; // ID of match in next round
    nextSlot: 1 | 2 | null; // Which slot (team1 or team2) in next match
    loserNextMatchId?: string | null; // For SF losers going to third place match
    loserNextSlot?: 1 | 2 | null;
}

export interface PlayoffBracket {
    r32: PlayoffMatch[];      // 16 matches (P73-P88)
    r16: PlayoffMatch[];      // 8 matches (P89-P96)
    qf: PlayoffMatch[];       // 4 matches (P97-P100)
    sf: PlayoffMatch[];       // 2 matches (P101-P102)
    thirdPlace: PlayoffMatch; // 1 match (P103 - Miami)
    final: PlayoffMatch;      // 1 match (P104 - New York/New Jersey)
}

export interface PlayoffPredictions {
    [matchId: string]: string; // matchId -> winner team code
}

export const ROUND_NAMES: Record<PlayoffRound, string> = {
    'R32': 'Dieciseisavos',
    'R16': 'Octavos de Final',
    'QF': 'Cuartos de Final',
    'SF': 'Semifinales',
    'TP': 'Tercer Puesto',
    'F': 'Final'
};

export const ROUND_ORDER: PlayoffRound[] = ['R32', 'R16', 'QF', 'SF', 'TP', 'F'];

