'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { GroupStandings } from './GroupStandings';
import { SimulatorMatchCard } from './SimulatorMatchCard';
import {
    getTeamsByGroup,
    generateGroupMatches,
    getTeamByCode,
    type GroupMatch,
    type WorldCupTeam
} from '@/lib/worldCupData';
import { calculateStandings, getInitialStandings } from '@/lib/calculateStandings';
import type { TeamStanding, GroupPredictions } from '@/types/groupStandings';

interface GroupBlockProps {
    group: string;
    initialPredictions?: GroupPredictions;
    onPredictionsChange?: (predictions: GroupPredictions) => void;
}

export function GroupBlock({ group, initialPredictions = {}, onPredictionsChange }: GroupBlockProps) {
    const teams = getTeamsByGroup(group);
    const matches = generateGroupMatches(group);

    const [predictions, setPredictions] = useState<GroupPredictions>(initialPredictions);
    const [standings, setStandings] = useState<TeamStanding[]>(() => getInitialStandings(teams));
    const [previousStandings, setPreviousStandings] = useState<TeamStanding[] | undefined>();

    // Recalculate standings when predictions change
    useEffect(() => {
        const newStandings = calculateStandings(teams, matches, predictions);
        setPreviousStandings(standings);
        setStandings(newStandings);
    }, [predictions]);

    // Notify parent of prediction changes
    useEffect(() => {
        onPredictionsChange?.(predictions);
    }, [predictions, onPredictionsChange]);

    const handlePredictionChange = useCallback((matchId: string, homeGoals: number | null, awayGoals: number | null) => {
        setPredictions(prev => {
            if (homeGoals === null || awayGoals === null) {
                const newPreds = { ...prev };
                delete newPreds[matchId];
                return newPreds;
            }
            return {
                ...prev,
                [matchId]: { home: homeGoals, away: awayGoals }
            };
        });
    }, []);

    // Group matches by matchday
    const matchesByDay = matches.reduce((acc, match) => {
        if (!acc[match.matchday]) acc[match.matchday] = [];
        acc[match.matchday].push(match);
        return acc;
    }, {} as Record<number, GroupMatch[]>);

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
                                const prediction = predictions[match.id];

                                return (
                                    <SimulatorMatchCard
                                        key={match.id}
                                        matchId={match.id}
                                        homeTeam={homeTeam!}
                                        awayTeam={awayTeam!}
                                        homeGoals={prediction?.home ?? null}
                                        awayGoals={prediction?.away ?? null}
                                        onPredictionChange={(home: number | null, away: number | null) => handlePredictionChange(match.id, home, away)}
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
