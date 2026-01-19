'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { PlayoffMatchCard } from './PlayoffMatchCard';
import { ROUND_ORDER, ROUND_NAMES } from '@/types/playoffTypes';
import { getMatchesByRound } from '@/lib/playoffLogic';
import type { PlayoffBracket as PlayoffBracketType, PlayoffMatch } from '@/types/playoffTypes';

interface PlayoffBracketProps {
    bracket: PlayoffBracketType;
    onPredictionChange: (matchId: string, winnerCode: string) => void;
}

export function PlayoffBracket({ bracket, onPredictionChange }: PlayoffBracketProps) {
    const [activeRound, setActiveRound] = useState(ROUND_ORDER[0]);

    return (
        <div className="space-y-6">
            {/* Mobile/Tablet: Round Navigation Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide snap-x">
                {ROUND_ORDER.map((round) => {
                    const isActive = activeRound === round;
                    const matches = getMatchesByRound(bracket, round);
                    const completedMatches = matches.filter(m => m.winner).length;
                    const totalMatches = matches.length;

                    return (
                        <button
                            key={round}
                            onClick={() => setActiveRound(round)}
                            className={`
                flex-none snap-center px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                                }
              `}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                <span>{ROUND_NAMES[round]}</span>
                                <span className="text-[10px] opacity-70">
                                    {completedMatches}/{totalMatches}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Bracket Visualization */}
            <div className="min-h-[600px] lg:h-auto overflow-y-auto lg:overflow-visible relative">
                {/* Desktop: Full Bracket / Mobile: Single Round */}
                <div className="lg:grid lg:grid-cols-5 lg:gap-8 lg:absolute lg:inset-0 lg:h-full lg:w-full">
                    {ROUND_ORDER.map((round, roundIndex) => {
                        const matches = getMatchesByRound(bracket, round);
                        const isVisible = activeRound === round;

                        return (
                            <div
                                key={round}
                                className={`
                  lg:flex flex-col justify-around gap-4
                  ${isVisible ? 'block space-y-4' : 'hidden lg:flex'}
                `}
                            >
                                {/* Round Title (Desktop only) */}
                                <h3 className="hidden lg:block text-center font-bold text-muted-foreground mb-4">
                                    {ROUND_NAMES[round]}
                                </h3>

                                {/* Matches */}
                                {matches.map((match, matchIndex) => (
                                    <div key={match.id} className="relative">
                                        <PlayoffMatchCard
                                            match={match}
                                            onSelectWinner={onPredictionChange}
                                            compact={round === 'R32'}
                                        />

                                        {/* Connector Lines (Desktop only) */}
                                        {round !== 'F' && round !== 'TP' && (
                                            <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-px bg-border/50">
                                                {/* Vertical connector logic could go here for more complex visuals */}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Champion Visual (if Final decided) */}
            {bracket.final.winner && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-2xl bg-linear-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/50 text-center"
                >
                    <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold bg-linear-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                        ¡Campeón del Mundo!
                    </h2>
                    <p className="text-lg font-medium mt-2">
                        {[bracket.final.team1, bracket.final.team2].find(t => t?.team.code === bracket.final.winner)?.team.name}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
