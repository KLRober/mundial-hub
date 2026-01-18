// Playoff Logic for World Cup 2026 Elimination Phase
// Handles qualification from groups and bracket generation

import {
    GROUPS,
    getTeamsByGroup,
    generateGroupMatches,
    type WorldCupTeam
} from './worldCupData';
import { calculateStandings } from './calculateStandings';
import type { GroupPredictions, TeamStanding } from '@/types/groupStandings';
import type {
    QualifiedTeam,
    PlayoffMatch,
    PlayoffBracket,
    PlayoffPredictions
} from '@/types/playoffTypes';

/**
 * Get all group standings based on predictions
 */
export function getAllGroupStandings(predictions: GroupPredictions): Map<string, TeamStanding[]> {
    const standings = new Map<string, TeamStanding[]>();

    GROUPS.forEach(group => {
        const teams = getTeamsByGroup(group);
        const matches = generateGroupMatches(group);
        const groupStandings = calculateStandings(teams, matches, predictions);
        standings.set(group, groupStandings);
    });

    return standings;
}

/**
 * Get the top 2 teams from each group (24 teams total)
 */
export function getTop2FromEachGroup(allStandings: Map<string, TeamStanding[]>): QualifiedTeam[] {
    const qualified: QualifiedTeam[] = [];

    GROUPS.forEach(group => {
        const standings = allStandings.get(group);
        if (!standings) return;

        // Get 1st and 2nd place
        standings.slice(0, 2).forEach((standing, index) => {
            qualified.push({
                team: standing.team,
                position: (index + 1) as 1 | 2,
                group: standing.team.group,
                points: standing.points,
                goalDiff: standing.goalDiff,
                goalsFor: standing.goalsFor,
            });
        });
    });

    return qualified;
}

/**
 * Get the 8 best third-place teams
 * Sorted by: Points > Goal Difference > Goals For
 */
export function getBestThirds(allStandings: Map<string, TeamStanding[]>): QualifiedTeam[] {
    const thirds: QualifiedTeam[] = [];

    GROUPS.forEach(group => {
        const standings = allStandings.get(group);
        if (!standings || standings.length < 3) return;

        const third = standings[2];
        thirds.push({
            team: third.team,
            position: 3,
            group: third.team.group,
            points: third.points,
            goalDiff: third.goalDiff,
            goalsFor: third.goalsFor,
        });
    });

    // Sort by points, then goal diff, then goals for
    thirds.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
    });

    // Return top 8
    return thirds.slice(0, 8);
}

/**
 * Get all 32 qualified teams for the playoff phase
 */
export function getQualifiedTeams(predictions: GroupPredictions): QualifiedTeam[] {
    const allStandings = getAllGroupStandings(predictions);
    const top2 = getTop2FromEachGroup(allStandings);
    const bestThirds = getBestThirds(allStandings);

    return [...top2, ...bestThirds];
}

/**
 * Generate the initial R32 bracket based on qualified teams
 * Uses a simplified bracket structure for this version
 */
export function generateR32Bracket(qualified: QualifiedTeam[]): PlayoffMatch[] {
    const matches: PlayoffMatch[] = [];

    // Separate by position
    const firsts = qualified.filter(q => q.position === 1);
    const seconds = qualified.filter(q => q.position === 2);
    const thirds = qualified.filter(q => q.position === 3);

    // Create 16 R32 matches
    // Simplified pairing: 1st places vs 2nd/3rd places from different groups
    for (let i = 0; i < 16; i++) {
        let team1: QualifiedTeam | null = null;
        let team2: QualifiedTeam | null = null;

        if (i < 12) {
            // First 12 matches: 1st vs 2nd from different groups
            team1 = firsts[i] || null;
            // Pair with a second from a different group
            const secondIndex = (i + 6) % 12;
            team2 = seconds[secondIndex] || null;
        } else {
            // Last 4 matches: Remaining seconds vs best thirds
            const remainingSecondIndex = i - 12;
            team1 = seconds[remainingSecondIndex] || null;
            team2 = thirds[i - 8] || null;
        }

        matches.push({
            id: `R32-${i + 1}`,
            round: 'R32',
            position: i + 1,
            team1,
            team2,
            winner: null,
            nextMatchId: `R16-${Math.floor(i / 2) + 1}`,
            nextSlot: ((i % 2) + 1) as 1 | 2,
        });
    }

    return matches;
}

/**
 * Generate empty matches for subsequent rounds
 */
export function generateEmptyRound(
    roundName: 'R16' | 'QF' | 'SF' | 'F',
    count: number,
    nextRound: 'R16' | 'QF' | 'SF' | 'F' | null
): PlayoffMatch[] {
    const matches: PlayoffMatch[] = [];

    for (let i = 0; i < count; i++) {
        matches.push({
            id: `${roundName}-${i + 1}`,
            round: roundName,
            position: i + 1,
            team1: null,
            team2: null,
            winner: null,
            nextMatchId: nextRound ? `${nextRound}-${Math.floor(i / 2) + 1}` : null,
            nextSlot: nextRound ? (((i % 2) + 1) as 1 | 2) : null,
        });
    }

    return matches;
}

/**
 * Generate the complete playoff bracket structure
 */
export function generatePlayoffBracket(predictions: GroupPredictions): PlayoffBracket {
    const qualified = getQualifiedTeams(predictions);

    return {
        r32: generateR32Bracket(qualified),
        r16: generateEmptyRound('R16', 8, 'QF'),
        qf: generateEmptyRound('QF', 4, 'SF'),
        sf: generateEmptyRound('SF', 2, 'F'),
        final: {
            id: 'F-1',
            round: 'F',
            position: 1,
            team1: null,
            team2: null,
            winner: null,
            nextMatchId: null,
            nextSlot: null,
        },
    };
}

/**
 * Apply playoff predictions to advance teams through the bracket
 */
export function applyPlayoffPredictions(
    bracket: PlayoffBracket,
    predictions: PlayoffPredictions
): PlayoffBracket {
    const newBracket = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;
    const allMatches = [
        ...newBracket.r32,
        ...newBracket.r16,
        ...newBracket.qf,
        ...newBracket.sf,
        newBracket.final,
    ];

    // Process each prediction
    Object.entries(predictions).forEach(([matchId, winnerCode]) => {
        const match = allMatches.find(m => m.id === matchId);
        if (!match) return;

        match.winner = winnerCode;

        // Advance winner to next match
        if (match.nextMatchId && match.nextSlot) {
            const nextMatch = allMatches.find(m => m.id === match.nextMatchId);
            if (nextMatch) {
                const winnerTeam = match.team1?.team.code === winnerCode ? match.team1 : match.team2;
                if (winnerTeam) {
                    if (match.nextSlot === 1) {
                        nextMatch.team1 = winnerTeam;
                    } else {
                        nextMatch.team2 = winnerTeam;
                    }
                }
            }
        }
    });

    return newBracket;
}

/**
 * Get matches by round from bracket
 */
export function getMatchesByRound(bracket: PlayoffBracket, round: 'R32' | 'R16' | 'QF' | 'SF' | 'F'): PlayoffMatch[] {
    switch (round) {
        case 'R32': return bracket.r32;
        case 'R16': return bracket.r16;
        case 'QF': return bracket.qf;
        case 'SF': return bracket.sf;
        case 'F': return [bracket.final];
    }
}
