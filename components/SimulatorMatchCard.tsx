'use client';

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
    const isDraw = hasResult && homeGoals === awayGoals;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={`relative overflow-hidden p-3 glass-card backdrop-blur-xl 
                border-mexico/20 hover:border-gold/40 transition-all duration-300
                ${hasResult ? 'shadow-lg shadow-mexico/10' : ''}`}
            >
                <div className="flex items-center justify-between gap-2">
                    {/* Home Team */}
                    <div className={`flex-1 flex items-center gap-2 transition-all duration-300 
                        ${awayWins ? 'opacity-40 scale-95' : homeWins ? 'scale-100' : ''}`}>
                        <div className="relative">
                            <img
                                src={getFlagUrl(homeTeam.code, 80)}
                                alt={homeTeam.name}
                                className={`w-9 h-7 object-cover rounded shadow-md
                                    ${homeWins ? 'ring-2 ring-gold ring-offset-1 ring-offset-transparent' : ''}`}
                                loading="lazy"
                            />
                            {homeWins && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[8px] font-bold text-gold-dark"
                                >
                                    W
                                </motion.div>
                            )}
                        </div>
                        <span className={`text-sm font-medium truncate transition-colors duration-200
                            ${homeWins ? 'text-gold font-bold' : ''}`}>
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
                            className={`w-14 h-14 text-center text-2xl font-extrabold rounded-xl 
                             bg-mexico/10 border-2 
                             ${homeWins
                                    ? 'border-gold bg-gold/10 text-gold'
                                    : 'border-mexico/30 focus:border-gold'
                                }
                             focus:bg-gold/10 focus:outline-none
                             transition-all duration-200
                             placeholder:text-muted-foreground/40`}
                            placeholder="-"
                        />
                        <div className="flex flex-col items-center">
                            <span className="text-muted-foreground font-extrabold text-xl">:</span>
                            {isDraw && (
                                <motion.span
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[8px] text-mexico font-bold"
                                >
                                    EMPATE
                                </motion.span>
                            )}
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={2}
                            value={awayGoals ?? ''}
                            onChange={handleAwayChange}
                            onFocus={(e) => e.target.select()}
                            className={`w-14 h-14 text-center text-2xl font-extrabold rounded-xl 
                             bg-mexico/10 border-2 
                             ${awayWins
                                    ? 'border-gold bg-gold/10 text-gold'
                                    : 'border-mexico/30 focus:border-gold'
                                }
                             focus:bg-gold/10 focus:outline-none
                             transition-all duration-200
                             placeholder:text-muted-foreground/40`}
                            placeholder="-"
                        />
                    </div>

                    {/* Away Team */}
                    <div className={`flex-1 flex items-center justify-end gap-2 transition-all duration-300
                        ${homeWins ? 'opacity-40 scale-95' : awayWins ? 'scale-100' : ''}`}>
                        <span className={`text-sm font-medium truncate text-right transition-colors duration-200
                            ${awayWins ? 'text-gold font-bold' : ''}`}>
                            {awayTeam.name}
                        </span>
                        <div className="relative">
                            <img
                                src={getFlagUrl(awayTeam.code, 80)}
                                alt={awayTeam.name}
                                className={`w-9 h-7 object-cover rounded shadow-md
                                    ${awayWins ? 'ring-2 ring-gold ring-offset-1 ring-offset-transparent' : ''}`}
                                loading="lazy"
                            />
                            {awayWins && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -left-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[8px] font-bold text-gold-dark"
                                >
                                    W
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Prediction indicator - Gold gradient for completed */}
                {hasResult && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-mexico via-gold to-canada"
                    />
                )}
            </Card>
        </motion.div>
    );
}
