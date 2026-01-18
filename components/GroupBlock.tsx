'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GroupStandings } from './GroupStandings';
import { SimulatorMatchCard } from './SimulatorMatchCard';
import {
    getTeamsByGroup,
    generateGroupMatches,
    getTeamByCode,
    type GroupMatch,
} from '@/lib/worldCupData';
import { calculateStandings } from '@/lib/calculateStandings';
import type { TeamStanding, GroupPredictions } from '@/types/groupStandings';

interface GroupBlockProps {
    group: string;
    allPredictions: GroupPredictions;
    onPredictionChange: (matchId: string, homeGoals: number | null, awayGoals: number | null) => void;
}

export function GroupBlock({ group, allPredictions, onPredictionChange }: GroupBlockProps) {
    const teams = useMemo(() => getTeamsByGroup(group), [group]);
    const matches = useMemo(() => generateGroupMatches(group), [group]);

    // Calculate standings based on predictions for this group
    const standings = useMemo(() => {
        const groupPredictions: GroupPredictions = {};
        matches.forEach(match => {
            if (allPredictions[match.id]) {
                groupPredictions[match.id] = allPredictions[match.id];
            }
        });
        return calculateStandings(teams, matches, groupPredictions);
    }, [teams, matches, allPredictions]);

    // Track previous standings for animations
    const [previousStandings, setPreviousStandings] = useState<TeamStanding[] | undefined>();

    useEffect(() => {
        setPreviousStandings(standings);
    }, [group]); // Reset when group changes

    // Group matches by matchday
    const matchesByDay = useMemo(() => {
        return matches.reduce((acc, match) => {
            if (!acc[match.matchday]) acc[match.matchday] = [];
            acc[match.matchday].push(match);
            return acc;
        }, {} as Record<number, GroupMatch[]>);
    }, [matches]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            {/* Group Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                    <span className="text-lg font-bold text-primary">{group}</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold">Grupo {group}</h2>
                    <p className="text-xs text-muted-foreground">
                        {teams.map(t => t.name).join(' • ')}
                    </p>
                </div>
            </div>

            {/* Matches by Matchday */}
            <div className="space-y-4">
                {[1, 2, 3].map(matchday => (
                    <div key={matchday} className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-1">
                            Jornada {matchday}
                        </h3>
                        <div className="grid gap-2">
                            {matchesByDay[matchday]?.map(match => {
                                const homeTeam = getTeamByCode(match.homeTeam);
                                const awayTeam = getTeamByCode(match.awayTeam);
                                const prediction = allPredictions[match.id];

                                if (!homeTeam || !awayTeam) return null;

                                return (
                                    <SimulatorMatchCard
                                        key={match.id}
                                        matchId={match.id}
                                        homeTeam={homeTeam}
                                        awayTeam={awayTeam}
                                        homeGoals={prediction?.home ?? null}
                                        awayGoals={prediction?.away ?? null}
                                        onPredictionChange={(home, away) => onPredictionChange(match.id, home, away)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Group Standings */}
            <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3 pl-1">Tabla de Posiciones</h3>
                <GroupStandings
                    standings={standings}
                    previousStandings={previousStandings}
                />
            </div>
        </motion.div>
    );
}
