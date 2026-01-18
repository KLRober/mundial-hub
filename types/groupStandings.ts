// Group Standings Types for World Cup Simulator

import type { WorldCupTeam } from '@/lib/worldCupData';

export interface TeamStanding {
    team: WorldCupTeam;
    played: number;      // PJ - Partidos Jugados
    won: number;         // PG - Partidos Ganados
    drawn: number;       // PE - Partidos Empatados
    lost: number;        // PP - Partidos Perdidos
    goalsFor: number;    // GF - Goles a Favor
    goalsAgainst: number; // GC - Goles en Contra
    goalDiff: number;    // DG - Diferencia de Goles
    points: number;      // PTS - Puntos
    position: number;    // Posición en la tabla (1-4)
    previousPosition?: number; // Para animar cambios
}

export interface GroupStandingsData {
    group: string;
    teams: TeamStanding[];
}

export interface MatchPrediction {
    matchId: string;
    homeGoals: number | null;
    awayGoals: number | null;
}

export interface GroupPredictions {
    [matchId: string]: {
        home: number;
        away: number;
    };
}
