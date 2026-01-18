'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { getFlagUrl, type WorldCupTeam } from '@/lib/worldCupData';

interface SimulatorMatchCardProps {
    matchId: string;
    homeTeam: WorldCupTeam;
    awayTeam: WorldCupTeam;
    homeGoals: number | null;
    awayGoals: number | null;
    onPredictionChange: (homeGoals: number | null, awayGoals: number | null) => void;
}

export function SimulatorMatchCard({
    matchId,
    homeTeam,
    awayTeam,
    homeGoals,
    awayGoals,
    onPredictionChange,
}: SimulatorMatchCardProps) {

    const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow empty or digits only
        if (value !== '' && !/^\d+$/.test(value)) return;
        if (value.length > 2) return;

        const numValue = value === '' ? null : parseInt(value, 10);
        onPredictionChange(numValue, awayGoals);
    };

    const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow empty or digits only
        if (value !== '' && !/^\d+$/.test(value)) return;
        if (value.length > 2) return;

        const numValue = value === '' ? null : parseInt(value, 10);
        onPredictionChange(homeGoals, numValue);
    };

    const hasResult = homeGoals !== null && awayGoals !== null;
    const homeWins = hasResult && homeGoals > awayGoals;
    const awayWins = hasResult && awayGoals > homeGoals;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="relative overflow-hidden p-3 bg-card/90 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-200">
                <div className="flex items-center justify-between gap-2">
                    {/* Home Team */}
                    <div className={`flex-1 flex items-center gap-2 transition-opacity duration-200 ${awayWins ? 'opacity-50' : ''}`}>
                        <img
                            src={getFlagUrl(homeTeam.code, 80)}
                            alt={homeTeam.name}
                            className="w-8 h-6 object-cover rounded shadow-sm"
                            loading="lazy"
                        />
                        <span className={`text-sm font-medium truncate ${homeWins ? 'text-green-600 font-semibold' : ''}`}>
                            {homeTeam.name}
                        </span>
                    </div>

                    {/* Score Inputs */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={2}
                            value={homeGoals ?? ''}
                            onChange={handleHomeChange}
                            onFocus={(e) => e.target.select()}
                            className="w-12 h-12 text-center text-xl font-bold rounded-lg 
                         bg-primary/10 border-2 border-primary/30 
                         focus:border-primary focus:bg-primary/20 focus:outline-none
                         transition-all duration-200
                         placeholder:text-muted-foreground/40"
                            placeholder="-"
                        />
                        <span className="text-muted-foreground font-bold text-lg">:</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={2}
                            value={awayGoals ?? ''}
                            onChange={handleAwayChange}
                            onFocus={(e) => e.target.select()}
                            className="w-12 h-12 text-center text-xl font-bold rounded-lg 
                         bg-primary/10 border-2 border-primary/30 
                         focus:border-primary focus:bg-primary/20 focus:outline-none
                         transition-all duration-200
                         placeholder:text-muted-foreground/40"
                            placeholder="-"
                        />
                    </div>

                    {/* Away Team */}
                    <div className={`flex-1 flex items-center justify-end gap-2 transition-opacity duration-200 ${homeWins ? 'opacity-50' : ''}`}>
                        <span className={`text-sm font-medium truncate text-right ${awayWins ? 'text-green-600 font-semibold' : ''}`}>
                            {awayTeam.name}
                        </span>
                        <img
                            src={getFlagUrl(awayTeam.code, 80)}
                            alt={awayTeam.name}
                            className="w-8 h-6 object-cover rounded shadow-sm"
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Prediction indicator */}
                {hasResult && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-secondary to-primary"
                    />
                )}
            </Card>
        </motion.div>
    );
}
