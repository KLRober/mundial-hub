// Calculate Group Standings based on predictions

import type { WorldCupTeam, GroupMatch } from '@/lib/worldCupData';
import type { TeamStanding, GroupPredictions } from '@/types/groupStandings';

/**
 * Calculate group standings based on match predictions
 * Sorting criteria: 1. Points (desc) → 2. Goal Difference (desc) → 3. Goals For (desc)
 */
export function calculateStandings(
    teams: WorldCupTeam[],
    matches: GroupMatch[],
    predictions: GroupPredictions
): TeamStanding[] {
    // Initialize standings for each team
    const standingsMap = new Map<string, TeamStanding>();

    teams.forEach(team => {
        standingsMap.set(team.code, {
            team,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDiff: 0,
            points: 0,
            position: 0,
        });
    });

    // Process each match prediction
    matches.forEach(match => {
        const prediction = predictions[match.id];
        if (prediction === undefined || prediction.home === null || prediction.away === null) {
            return; // Skip matches without predictions
        }

        const homeStanding = standingsMap.get(match.homeTeam);
        const awayStanding = standingsMap.get(match.awayTeam);

        if (!homeStanding || !awayStanding) return;

        const homeGoals = prediction.home;
        const awayGoals = prediction.away;

        // Update played matches
        homeStanding.played += 1;
        awayStanding.played += 1;

        // Update goals
        homeStanding.goalsFor += homeGoals;
        homeStanding.goalsAgainst += awayGoals;
        awayStanding.goalsFor += awayGoals;
        awayStanding.goalsAgainst += homeGoals;

        // Determine result and update points
        if (homeGoals > awayGoals) {
            // Home win
            homeStanding.won += 1;
            homeStanding.points += 3;
            awayStanding.lost += 1;
        } else if (homeGoals < awayGoals) {
            // Away win
            awayStanding.won += 1;
            awayStanding.points += 3;
            homeStanding.lost += 1;
        } else {
            // Draw
            homeStanding.drawn += 1;
            awayStanding.drawn += 1;
            homeStanding.points += 1;
            awayStanding.points += 1;
        }
    });

    // Calculate goal difference
    standingsMap.forEach(standing => {
        standing.goalDiff = standing.goalsFor - standing.goalsAgainst;
    });

    // Sort teams by: Points → Goal Difference → Goals For
    const sortedStandings = Array.from(standingsMap.values()).sort((a, b) => {
        // 1. Points (descending)
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        // 2. Goal Difference (descending)
        if (b.goalDiff !== a.goalDiff) {
            return b.goalDiff - a.goalDiff;
        }
        // 3. Goals For (descending)
        if (b.goalsFor !== a.goalsFor) {
            return b.goalsFor - a.goalsFor;
        }
        // 4. Alphabetical by name (for consistent ordering)
        return a.team.name.localeCompare(b.team.name);
    });

    // Assign positions
    sortedStandings.forEach((standing, index) => {
        standing.position = index + 1;
    });

    return sortedStandings;
}

/**
 * Get initial empty standings for a group
 */
export function getInitialStandings(teams: WorldCupTeam[]): TeamStanding[] {
    return teams.map((team, index) => ({
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        position: index + 1,
    }));
}
