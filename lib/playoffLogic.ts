// Playoff Logic for World Cup 2026 Elimination Phase
// Follows FIFA Official Bracket Structure for 48-team format
// 32 qualified teams: 12 group winners + 12 runners-up + 8 best third-place

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
 * FIFA Official R32 Bracket Structure
 * Defines which groups face each other in Round of 32
 */
interface R32MatchConfig {
    matchId: string;
    team1Source: { position: 1 | 2 | 3; group?: string; thirdPoolIndex?: number };
    team2Source: { position: 1 | 2 | 3; group?: string; thirdPoolIndex?: number };
    nextMatchId: string;
    nextSlot: 1 | 2;
}

// Official FIFA R32 bracket structure for 48-team World Cup
// Groups: A, B, C, D, E, F, G, H, I, J, K, L
// Winners of A, B, C, E, F, G, I, J, L face best thirds
// Winners of D, H, K face runners-up
// Remaining runners-up face each other
const FIFA_R32_STRUCTURE: R32MatchConfig[] = [
    // Left bracket - Top half
    { matchId: 'R32-1', team1Source: { position: 1, group: 'A' }, team2Source: { position: 3, thirdPoolIndex: 0 }, nextMatchId: 'R16-1', nextSlot: 1 },
    { matchId: 'R32-2', team1Source: { position: 2, group: 'C' }, team2Source: { position: 2, group: 'D' }, nextMatchId: 'R16-1', nextSlot: 2 },
    { matchId: 'R32-3', team1Source: { position: 1, group: 'B' }, team2Source: { position: 3, thirdPoolIndex: 1 }, nextMatchId: 'R16-2', nextSlot: 1 },
    { matchId: 'R32-4', team1Source: { position: 2, group: 'A' }, team2Source: { position: 2, group: 'B' }, nextMatchId: 'R16-2', nextSlot: 2 },

    // Left bracket - Bottom half
    { matchId: 'R32-5', team1Source: { position: 1, group: 'C' }, team2Source: { position: 3, thirdPoolIndex: 2 }, nextMatchId: 'R16-3', nextSlot: 1 },
    { matchId: 'R32-6', team1Source: { position: 2, group: 'E' }, team2Source: { position: 2, group: 'F' }, nextMatchId: 'R16-3', nextSlot: 2 },
    { matchId: 'R32-7', team1Source: { position: 1, group: 'D' }, team2Source: { position: 2, group: 'G' }, nextMatchId: 'R16-4', nextSlot: 1 },
    { matchId: 'R32-8', team1Source: { position: 1, group: 'E' }, team2Source: { position: 3, thirdPoolIndex: 3 }, nextMatchId: 'R16-4', nextSlot: 2 },

    // Right bracket - Top half
    { matchId: 'R32-9', team1Source: { position: 1, group: 'F' }, team2Source: { position: 3, thirdPoolIndex: 4 }, nextMatchId: 'R16-5', nextSlot: 1 },
    { matchId: 'R32-10', team1Source: { position: 2, group: 'I' }, team2Source: { position: 2, group: 'J' }, nextMatchId: 'R16-5', nextSlot: 2 },
    { matchId: 'R32-11', team1Source: { position: 1, group: 'G' }, team2Source: { position: 3, thirdPoolIndex: 5 }, nextMatchId: 'R16-6', nextSlot: 1 },
    { matchId: 'R32-12', team1Source: { position: 2, group: 'H' }, team2Source: { position: 2, group: 'K' }, nextMatchId: 'R16-6', nextSlot: 2 },

    // Right bracket - Bottom half
    { matchId: 'R32-13', team1Source: { position: 1, group: 'H' }, team2Source: { position: 2, group: 'L' }, nextMatchId: 'R16-7', nextSlot: 1 },
    { matchId: 'R32-14', team1Source: { position: 1, group: 'I' }, team2Source: { position: 3, thirdPoolIndex: 6 }, nextMatchId: 'R16-7', nextSlot: 2 },
    { matchId: 'R32-15', team1Source: { position: 1, group: 'J' }, team2Source: { position: 3, thirdPoolIndex: 7 }, nextMatchId: 'R16-8', nextSlot: 1 },
    { matchId: 'R32-16', team1Source: { position: 1, group: 'K' }, team2Source: { position: 1, group: 'L' }, nextMatchId: 'R16-8', nextSlot: 2 },
];

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
 * Get the group winners (12 teams - 1st place from each group)
 */
export function getGroupWinners(allStandings: Map<string, TeamStanding[]>): QualifiedTeam[] {
    const winners: QualifiedTeam[] = [];

    GROUPS.forEach(group => {
        const standings = allStandings.get(group);
        if (!standings || standings.length < 1) return;

        const winner = standings[0];
        winners.push({
            team: winner.team,
            position: 1,
            group: winner.team.group,
            points: winner.points,
            goalDiff: winner.goalDiff,
            goalsFor: winner.goalsFor,
            originLabel: `1° Grupo ${group}`,
        });
    });

    return winners;
}

/**
 * Get the runners-up (12 teams - 2nd place from each group)
 */
export function getRunnersUp(allStandings: Map<string, TeamStanding[]>): QualifiedTeam[] {
    const runnersUp: QualifiedTeam[] = [];

    GROUPS.forEach(group => {
        const standings = allStandings.get(group);
        if (!standings || standings.length < 2) return;

        const second = standings[1];
        runnersUp.push({
            team: second.team,
            position: 2,
            group: second.team.group,
            points: second.points,
            goalDiff: second.goalDiff,
            goalsFor: second.goalsFor,
            originLabel: `2° Grupo ${group}`,
        });
    });

    return runnersUp;
}

/**
 * Get the 8 best third-place teams from 12 groups
 * Sorted by: 1) Points, 2) Goal Difference, 3) Goals For
 */
export function getBestThirds(allStandings: Map<string, TeamStanding[]>): QualifiedTeam[] {
    const allThirds: QualifiedTeam[] = [];

    GROUPS.forEach(group => {
        const standings = allStandings.get(group);
        if (!standings || standings.length < 3) return;

        const third = standings[2];
        allThirds.push({
            team: third.team,
            position: 3,
            group: third.team.group,
            points: third.points,
            goalDiff: third.goalDiff,
            goalsFor: third.goalsFor,
            originLabel: `Mejor 3°`, // Will be updated after ranking
        });
    });

    // Sort by points (desc), then goal difference (desc), then goals for (desc)
    allThirds.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        // Tiebreaker: alphabetical by group
        return a.group.localeCompare(b.group);
    });

    // Take top 8 and add ranking info to label
    const bestEight = allThirds.slice(0, 8);
    bestEight.forEach((team, index) => {
        team.originLabel = `Mejor 3° (#${index + 1})`;
    });

    return bestEight;
}

/**
 * Get all 32 qualified teams for the playoff phase
 */
export function getQualifiedTeams(predictions: GroupPredictions): QualifiedTeam[] {
    const allStandings = getAllGroupStandings(predictions);
    const winners = getGroupWinners(allStandings);
    const runnersUp = getRunnersUp(allStandings);
    const bestThirds = getBestThirds(allStandings);

    return [...winners, ...runnersUp, ...bestThirds];
}

/**
 * Find a qualified team by position and group
 */
function findQualifiedTeam(
    qualified: QualifiedTeam[],
    position: 1 | 2 | 3,
    group?: string,
    thirdPoolIndex?: number,
    bestThirds?: QualifiedTeam[]
): QualifiedTeam | null {
    if (position === 3 && thirdPoolIndex !== undefined && bestThirds) {
        // Get from ranked best thirds pool
        return bestThirds[thirdPoolIndex] || null;
    }

    if (group) {
        return qualified.find(q => q.position === position && q.group === group) || null;
    }

    return null;
}

/**
 * Generate the R32 bracket based on qualified teams following FIFA official structure
 */
export function generateR32Bracket(qualified: QualifiedTeam[]): PlayoffMatch[] {
    const matches: PlayoffMatch[] = [];

    // Separate teams by position
    const winners = qualified.filter(q => q.position === 1);
    const runnersUp = qualified.filter(q => q.position === 2);
    const bestThirds = qualified.filter(q => q.position === 3);

    // Generate matches following FIFA structure
    FIFA_R32_STRUCTURE.forEach((config, index) => {
        const team1 = findQualifiedTeam(
            qualified,
            config.team1Source.position,
            config.team1Source.group,
            config.team1Source.thirdPoolIndex,
            bestThirds
        );

        const team2 = findQualifiedTeam(
            qualified,
            config.team2Source.position,
            config.team2Source.group,
            config.team2Source.thirdPoolIndex,
            bestThirds
        );

        matches.push({
            id: config.matchId,
            round: 'R32',
            position: index + 1,
            team1,
            team2,
            winner: null,
            nextMatchId: config.nextMatchId,
            nextSlot: config.nextSlot,
        });
    });

    return matches;
}

/**
 * Generate empty matches for subsequent rounds with correct bracket structure
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
 * Cleans invalid predictions automatically
 */
export function applyPlayoffPredictions(
    bracket: PlayoffBracket,
    predictions: PlayoffPredictions
): PlayoffBracket {
    const newBracket = JSON.parse(JSON.stringify(bracket)) as PlayoffBracket;

    // Get all matches in order for processing
    const allMatches = [
        ...newBracket.r32,
        ...newBracket.r16,
        ...newBracket.qf,
        ...newBracket.sf,
        newBracket.final,
    ];

    // Create a map for quick lookup
    const matchMap = new Map<string, PlayoffMatch>();
    allMatches.forEach(m => matchMap.set(m.id, m));

    // Process predictions in round order
    const roundOrder = ['R32', 'R16', 'QF', 'SF', 'F'];

    roundOrder.forEach(round => {
        const roundMatches = allMatches.filter(m => m.round === round);

        roundMatches.forEach(match => {
            const winnerCode = predictions[match.id];

            // Skip if no prediction or teams aren't set
            if (!winnerCode || !match.team1 || !match.team2) {
                match.winner = null;
                return;
            }

            // Validate winner is one of the teams
            const isValidWinner =
                match.team1.team.code === winnerCode ||
                match.team2.team.code === winnerCode;

            if (!isValidWinner) {
                match.winner = null;
                return;
            }

            match.winner = winnerCode;

            // Advance winner to next match
            if (match.nextMatchId && match.nextSlot) {
                const nextMatch = matchMap.get(match.nextMatchId);
                if (nextMatch) {
                    const winnerTeam = match.team1.team.code === winnerCode
                        ? match.team1
                        : match.team2;

                    if (match.nextSlot === 1) {
                        nextMatch.team1 = winnerTeam;
                    } else {
                        nextMatch.team2 = winnerTeam;
                    }
                }
            }
        });
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

/**
 * Get the team codes of all currently qualified teams
 * Useful for detecting when qualified teams change
 */
export function getQualifiedTeamCodes(predictions: GroupPredictions): string[] {
    const qualified = getQualifiedTeams(predictions);
    return qualified.map(q => q.team.code).sort();
}

/**
 * Clean invalid playoff predictions when group standings change
 * Returns predictions that are still valid
 */
export function cleanInvalidPlayoffPredictions(
    playoffPredictions: PlayoffPredictions,
    currentBracket: PlayoffBracket
): PlayoffPredictions {
    const validPredictions: PlayoffPredictions = {};

    const allMatches = [
        ...currentBracket.r32,
        ...currentBracket.r16,
        ...currentBracket.qf,
        ...currentBracket.sf,
        currentBracket.final,
    ];

    Object.entries(playoffPredictions).forEach(([matchId, winnerCode]) => {
        const match = allMatches.find(m => m.id === matchId);
        if (!match) return;

        // For R32, check if winner is still one of the qualified teams
        if (match.round === 'R32') {
            const isValidTeam =
                (match.team1 && match.team1.team.code === winnerCode) ||
                (match.team2 && match.team2.team.code === winnerCode);

            if (isValidTeam) {
                validPredictions[matchId] = winnerCode;
            }
        }
        // For later rounds, predictions are invalidated if dependent R32 changed
        // These will be rebuilt when user re-selects winners
    });

    return validPredictions;
}
