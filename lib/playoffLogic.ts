// Playoff Logic for World Cup 2026 Elimination Phase
// Follows FIFA Official Bracket Structure for 48-team format (Matches P73-P104)
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
 * Match IDs follow FIFA official numbering (P73-P88)
 */
interface R32MatchConfig {
    matchId: string;           // Official FIFA match ID (P73-P88)
    team1Source: { position: 1 | 2; group: string } | { position: 3; thirdPlacePool: string[] };
    team2Source: { position: 1 | 2; group: string } | { position: 3; thirdPlacePool: string[] };
    nextMatchId: string;       // Destination in R16 (P89-P96)
    nextSlot: 1 | 2;
}

/**
 * Official FIFA R32 bracket structure for 48-team World Cup 2026
 * Each match specifies its source teams and where the winner advances
 */
const FIFA_R32_STRUCTURE: R32MatchConfig[] = [
    // P73: 2°A vs 2°B → P90 slot 1
    { matchId: 'P73', team1Source: { position: 2, group: 'A' }, team2Source: { position: 2, group: 'B' }, nextMatchId: 'P90', nextSlot: 1 },
    // P74: 1°E vs Mejor 3° (A/B/C/D/F) → P89 slot 1
    { matchId: 'P74', team1Source: { position: 1, group: 'E' }, team2Source: { position: 3, thirdPlacePool: ['A', 'B', 'C', 'D', 'F'] }, nextMatchId: 'P89', nextSlot: 1 },
    // P75: 1°F vs 2°C → P90 slot 2
    { matchId: 'P75', team1Source: { position: 1, group: 'F' }, team2Source: { position: 2, group: 'C' }, nextMatchId: 'P90', nextSlot: 2 },
    // P76: 1°C vs 2°F → P91 slot 1
    { matchId: 'P76', team1Source: { position: 1, group: 'C' }, team2Source: { position: 2, group: 'F' }, nextMatchId: 'P91', nextSlot: 1 },
    // P77: 1°I vs Mejor 3° (C/D/F/G/H) → P89 slot 2
    { matchId: 'P77', team1Source: { position: 1, group: 'I' }, team2Source: { position: 3, thirdPlacePool: ['C', 'D', 'F', 'G', 'H'] }, nextMatchId: 'P89', nextSlot: 2 },
    // P78: 2°E vs 2°I → P91 slot 2
    { matchId: 'P78', team1Source: { position: 2, group: 'E' }, team2Source: { position: 2, group: 'I' }, nextMatchId: 'P91', nextSlot: 2 },
    // P79: 1°A vs Mejor 3° (C/E/F/H/I) → P92 slot 1
    { matchId: 'P79', team1Source: { position: 1, group: 'A' }, team2Source: { position: 3, thirdPlacePool: ['C', 'E', 'F', 'H', 'I'] }, nextMatchId: 'P92', nextSlot: 1 },
    // P80: 1°L vs Mejor 3° (E/H/I/J/K) → P92 slot 2
    { matchId: 'P80', team1Source: { position: 1, group: 'L' }, team2Source: { position: 3, thirdPlacePool: ['E', 'H', 'I', 'J', 'K'] }, nextMatchId: 'P92', nextSlot: 2 },
    // P81: 1°D vs Mejor 3° (B/E/F/I/J) → P94 slot 1
    { matchId: 'P81', team1Source: { position: 1, group: 'D' }, team2Source: { position: 3, thirdPlacePool: ['B', 'E', 'F', 'I', 'J'] }, nextMatchId: 'P94', nextSlot: 1 },
    // P82: 1°G vs Mejor 3° (A/E/H/I/J) → P94 slot 2
    { matchId: 'P82', team1Source: { position: 1, group: 'G' }, team2Source: { position: 3, thirdPlacePool: ['A', 'E', 'H', 'I', 'J'] }, nextMatchId: 'P94', nextSlot: 2 },
    // P83: 2°K vs 2°L → P93 slot 1
    { matchId: 'P83', team1Source: { position: 2, group: 'K' }, team2Source: { position: 2, group: 'L' }, nextMatchId: 'P93', nextSlot: 1 },
    // P84: 1°H vs 2°J → P93 slot 2
    { matchId: 'P84', team1Source: { position: 1, group: 'H' }, team2Source: { position: 2, group: 'J' }, nextMatchId: 'P93', nextSlot: 2 },
    // P85: 1°B vs Mejor 3° (E/F/G/I/J) → P96 slot 1
    { matchId: 'P85', team1Source: { position: 1, group: 'B' }, team2Source: { position: 3, thirdPlacePool: ['E', 'F', 'G', 'I', 'J'] }, nextMatchId: 'P96', nextSlot: 1 },
    // P86: 1°J vs 2°H → P95 slot 1
    { matchId: 'P86', team1Source: { position: 1, group: 'J' }, team2Source: { position: 2, group: 'H' }, nextMatchId: 'P95', nextSlot: 1 },
    // P87: 1°K vs Mejor 3° (D/E/I/J/L) → P96 slot 2
    { matchId: 'P87', team1Source: { position: 1, group: 'K' }, team2Source: { position: 3, thirdPlacePool: ['D', 'E', 'I', 'J', 'L'] }, nextMatchId: 'P96', nextSlot: 2 },
    // P88: 2°D vs 2°G → P95 slot 2
    { matchId: 'P88', team1Source: { position: 2, group: 'D' }, team2Source: { position: 2, group: 'G' }, nextMatchId: 'P95', nextSlot: 2 },
];

/**
 * R16 Structure (P89-P96)
 * Winners from R32 advance here
 */
interface LaterRoundConfig {
    matchId: string;
    sourceMatch1: string;
    sourceMatch2: string;
    nextMatchId: string | null;
    nextSlot: 1 | 2 | null;
    loserNextMatchId?: string;  // For SF losers going to third place
    loserNextSlot?: 1 | 2;
}

const FIFA_R16_STRUCTURE: LaterRoundConfig[] = [
    // P89: G. P74 vs G. P77 → P97 slot 1
    { matchId: 'P89', sourceMatch1: 'P74', sourceMatch2: 'P77', nextMatchId: 'P97', nextSlot: 1 },
    // P90: G. P73 vs G. P75 → P97 slot 2
    { matchId: 'P90', sourceMatch1: 'P73', sourceMatch2: 'P75', nextMatchId: 'P97', nextSlot: 2 },
    // P91: G. P76 vs G. P78 → P99 slot 1
    { matchId: 'P91', sourceMatch1: 'P76', sourceMatch2: 'P78', nextMatchId: 'P99', nextSlot: 1 },
    // P92: G. P79 vs G. P80 → P99 slot 2
    { matchId: 'P92', sourceMatch1: 'P79', sourceMatch2: 'P80', nextMatchId: 'P99', nextSlot: 2 },
    // P93: G. P83 vs G. P84 → P98 slot 1
    { matchId: 'P93', sourceMatch1: 'P83', sourceMatch2: 'P84', nextMatchId: 'P98', nextSlot: 1 },
    // P94: G. P81 vs G. P82 → P98 slot 2
    { matchId: 'P94', sourceMatch1: 'P81', sourceMatch2: 'P82', nextMatchId: 'P98', nextSlot: 2 },
    // P95: G. P86 vs G. P88 → P100 slot 1
    { matchId: 'P95', sourceMatch1: 'P86', sourceMatch2: 'P88', nextMatchId: 'P100', nextSlot: 1 },
    // P96: G. P85 vs G. P87 → P100 slot 2
    { matchId: 'P96', sourceMatch1: 'P85', sourceMatch2: 'P87', nextMatchId: 'P100', nextSlot: 2 },
];

const FIFA_QF_STRUCTURE: LaterRoundConfig[] = [
    // P97: G. P89 vs G. P90 → P101 slot 1
    { matchId: 'P97', sourceMatch1: 'P89', sourceMatch2: 'P90', nextMatchId: 'P101', nextSlot: 1 },
    // P98: G. P93 vs G. P94 → P101 slot 2
    { matchId: 'P98', sourceMatch1: 'P93', sourceMatch2: 'P94', nextMatchId: 'P101', nextSlot: 2 },
    // P99: G. P91 vs G. P92 → P102 slot 1
    { matchId: 'P99', sourceMatch1: 'P91', sourceMatch2: 'P92', nextMatchId: 'P102', nextSlot: 1 },
    // P100: G. P95 vs G. P96 → P102 slot 2
    { matchId: 'P100', sourceMatch1: 'P95', sourceMatch2: 'P96', nextMatchId: 'P102', nextSlot: 2 },
];

const FIFA_SF_STRUCTURE: LaterRoundConfig[] = [
    // P101: G. P97 vs G. P98 → P104 slot 1, Loser → P103 slot 1
    { matchId: 'P101', sourceMatch1: 'P97', sourceMatch2: 'P98', nextMatchId: 'P104', nextSlot: 1, loserNextMatchId: 'P103', loserNextSlot: 1 },
    // P102: G. P99 vs G. P100 → P104 slot 2, Loser → P103 slot 2
    { matchId: 'P102', sourceMatch1: 'P99', sourceMatch2: 'P100', nextMatchId: 'P104', nextSlot: 2, loserNextMatchId: 'P103', loserNextSlot: 2 },
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
 * Assign third-place teams to R32 matches following anti-repetition rules
 * A third-place team cannot face the 1st-place team from their own group
 */
function assignThirdPlaceTeams(
    bestThirds: QualifiedTeam[],
    r32Matches: { matchId: string; firstPlaceGroup?: string; thirdPlacePool: string[] }[]
): Map<string, QualifiedTeam> {
    const assignments = new Map<string, QualifiedTeam>();
    const usedThirds = new Set<string>();

    // Sort matches by pool size (smallest first for more constrained assignments)
    const sortedMatches = [...r32Matches].sort((a, b) => a.thirdPlacePool.length - b.thirdPlacePool.length);

    for (const match of sortedMatches) {
        // Find best available third that:
        // 1. Is from a group in the pool
        // 2. Is NOT from the same group as the 1st place team they'd face
        // 3. Hasn't been used yet
        const eligibleThirds = bestThirds.filter(t =>
            match.thirdPlacePool.includes(t.group) &&
            t.group !== match.firstPlaceGroup &&
            !usedThirds.has(t.group)
        );

        // Sort by ranking (already sorted by points, etc. so first is best)
        if (eligibleThirds.length > 0) {
            const selected = eligibleThirds[0];
            assignments.set(match.matchId, selected);
            usedThirds.add(selected.group);
        }
    }

    return assignments;
}

/**
 * Find a qualified team by position and group
 */
function findQualifiedTeam(
    qualified: QualifiedTeam[],
    source: { position: 1 | 2; group: string } | { position: 3; thirdPlacePool: string[] },
    thirdPlaceAssignments?: Map<string, QualifiedTeam>,
    matchId?: string
): QualifiedTeam | null {
    if ('thirdPlacePool' in source) {
        // This is a third-place slot
        if (thirdPlaceAssignments && matchId) {
            return thirdPlaceAssignments.get(matchId) || null;
        }
        return null;
    }

    // Regular 1st or 2nd place from specific group
    return qualified.find(q => q.position === source.position && q.group === source.group) || null;
}

/**
 * Generate the R32 bracket based on qualified teams following FIFA official structure
 */
export function generateR32Bracket(qualified: QualifiedTeam[]): PlayoffMatch[] {
    const matches: PlayoffMatch[] = [];
    const bestThirds = qualified.filter(q => q.position === 3);

    // Prepare third-place assignment data
    const thirdPlaceMatches = FIFA_R32_STRUCTURE
        .filter(config => 'thirdPlacePool' in config.team2Source)
        .map(config => ({
            matchId: config.matchId,
            firstPlaceGroup: 'group' in config.team1Source ? config.team1Source.group : undefined,
            thirdPlacePool: ('thirdPlacePool' in config.team2Source ? config.team2Source.thirdPlacePool : []) as string[]
        }));

    const thirdPlaceAssignments = assignThirdPlaceTeams(bestThirds, thirdPlaceMatches);

    // Generate matches following FIFA structure
    FIFA_R32_STRUCTURE.forEach((config, index) => {
        const team1 = findQualifiedTeam(qualified, config.team1Source, thirdPlaceAssignments, config.matchId);
        const team2 = findQualifiedTeam(qualified, config.team2Source, thirdPlaceAssignments, config.matchId);

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
 * Generate empty matches for R16 with correct bracket structure
 */
function generateR16Matches(): PlayoffMatch[] {
    return FIFA_R16_STRUCTURE.map((config, index) => ({
        id: config.matchId,
        round: 'R16' as const,
        position: index + 1,
        team1: null,
        team2: null,
        winner: null,
        nextMatchId: config.nextMatchId,
        nextSlot: config.nextSlot,
    }));
}

/**
 * Generate empty matches for Quarter-Finals
 */
function generateQFMatches(): PlayoffMatch[] {
    return FIFA_QF_STRUCTURE.map((config, index) => ({
        id: config.matchId,
        round: 'QF' as const,
        position: index + 1,
        team1: null,
        team2: null,
        winner: null,
        nextMatchId: config.nextMatchId,
        nextSlot: config.nextSlot,
    }));
}

/**
 * Generate empty matches for Semi-Finals (with loser routing to third place)
 */
function generateSFMatches(): PlayoffMatch[] {
    return FIFA_SF_STRUCTURE.map((config, index) => ({
        id: config.matchId,
        round: 'SF' as const,
        position: index + 1,
        team1: null,
        team2: null,
        winner: null,
        loser: null,
        nextMatchId: config.nextMatchId,
        nextSlot: config.nextSlot,
        loserNextMatchId: config.loserNextMatchId,
        loserNextSlot: config.loserNextSlot,
    }));
}

/**
 * Generate the complete playoff bracket structure
 */
export function generatePlayoffBracket(predictions: GroupPredictions): PlayoffBracket {
    const qualified = getQualifiedTeams(predictions);

    return {
        r32: generateR32Bracket(qualified),
        r16: generateR16Matches(),
        qf: generateQFMatches(),
        sf: generateSFMatches(),
        thirdPlace: {
            id: 'P103',
            round: 'TP',
            position: 1,
            team1: null,
            team2: null,
            winner: null,
            nextMatchId: null,
            nextSlot: null,
        },
        final: {
            id: 'P104',
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
        newBracket.thirdPlace,
        newBracket.final,
    ];

    // Create a map for quick lookup
    const matchMap = new Map<string, PlayoffMatch>();
    allMatches.forEach(m => matchMap.set(m.id, m));

    // Process predictions in round order
    const roundOrder = ['R32', 'R16', 'QF', 'SF', 'TP', 'F'];

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

            // Determine loser for SF matches
            if (match.round === 'SF') {
                match.loser = match.team1.team.code === winnerCode
                    ? match.team2.team.code
                    : match.team1.team.code;
            }

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

            // Advance loser to third place match (for SF)
            if (match.loserNextMatchId && match.loserNextSlot && match.loser) {
                const thirdPlaceMatch = matchMap.get(match.loserNextMatchId);
                if (thirdPlaceMatch) {
                    const loserTeam = match.team1.team.code === match.loser
                        ? match.team1
                        : match.team2;

                    if (match.loserNextSlot === 1) {
                        thirdPlaceMatch.team1 = loserTeam;
                    } else {
                        thirdPlaceMatch.team2 = loserTeam;
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
export function getMatchesByRound(bracket: PlayoffBracket, round: 'R32' | 'R16' | 'QF' | 'SF' | 'TP' | 'F'): PlayoffMatch[] {
    switch (round) {
        case 'R32': return bracket.r32;
        case 'R16': return bracket.r16;
        case 'QF': return bracket.qf;
        case 'SF': return bracket.sf;
        case 'TP': return [bracket.thirdPlace];
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
        currentBracket.thirdPlace,
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
