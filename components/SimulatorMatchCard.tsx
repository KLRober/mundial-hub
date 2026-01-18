'use client';

import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { getFlagUrl } from '@/lib/worldCupData';
import type { WorldCupTeam } from '@/lib/worldCupData';

interface SimulatorMatchCardProps {
    matchId: string | number;
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
    const hasResult = homeGoals !== null && awayGoals !== null;
    const homeWins = hasResult && homeGoals > awayGoals;
    const awayWins = hasResult && awayGoals > homeGoals;
    const isDraw = hasResult && homeGoals === awayGoals;

    const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
        if (value === null || (!isNaN(value) && value >= 0 && value <= 99)) {
            onPredictionChange(value, awayGoals);
        }
    };

    const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
        if (value === null || (!isNaN(value) && value >= 0 && value <= 99)) {
            onPredictionChange(homeGoals, value);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={`relative overflow-hidden p-3 bg-white
                border-gray-100 hover:border-amber-300 transition-all duration-300
                ${hasResult ? 'shadow-md border-amber-200' : 'shadow-sm'}`}
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
                                    ${homeWins ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-transparent' : ''}`}
                                loading="lazy"
                            />
                            {homeWins && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                >
                                    ⭐
                                </motion.div>
                            )}
                        </div>
                        <span className={`text-sm font-medium truncate transition-colors duration-200
                            ${homeWins ? 'text-amber-600 font-bold' : 'text-gray-900'}`}>
                            {homeTeam.name}
                        </span>
                    </div>

                    {/* Score Inputs */}
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="99"
                            value={homeGoals ?? ''}
                            onChange={handleHomeChange}
                            onFocus={(e) => e.target.select()}
                            className={`w-14 h-14 text-center text-2xl font-extrabold rounded-xl 
                             bg-gray-50 border-2 
                             ${homeWins
                                    ? 'border-amber-500 bg-amber-50 text-amber-600'
                                    : 'border-gray-200 focus:border-amber-500'
                                }
                             focus:bg-amber-50 focus:outline-none
                             transition-all duration-200
                             placeholder:text-gray-300`}
                            placeholder="-"
                        />
                        {isDraw && (
                            <motion.span
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[8px] text-amber-600 font-bold"
                            >
                                EMPATE
                            </motion.span>
                        )}
                        <input
                            type="number"
                            min="0"
                            max="99"
                            value={awayGoals ?? ''}
                            onChange={handleAwayChange}
                            onFocus={(e) => e.target.select()}
                            className={`w-14 h-14 text-center text-2xl font-extrabold rounded-xl 
                             bg-gray-50 border-2 
                             ${awayWins
                                    ? 'border-amber-500 bg-amber-50 text-amber-600'
                                    : 'border-gray-200 focus:border-amber-500'
                                }
                             focus:bg-amber-50 focus:outline-none
                             transition-all duration-200
                             placeholder:text-gray-300`}
                            placeholder="-"
                        />
                    </div>

                    {/* Away Team */}
                    <div className={`flex-1 flex items-center justify-end gap-2 transition-all duration-300
                        ${homeWins ? 'opacity-40 scale-95' : awayWins ? 'scale-100' : ''}`}>
                        <span className={`text-sm font-medium truncate text-right transition-colors duration-200
                            ${awayWins ? 'text-amber-600 font-bold' : 'text-gray-900'}`}>
                            {awayTeam.name}
                        </span>
                        <div className="relative">
                            <img
                                src={getFlagUrl(awayTeam.code, 80)}
                                alt={awayTeam.name}
                                className={`w-9 h-7 object-cover rounded shadow-md
                                    ${awayWins ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-transparent' : ''}`}
                                loading="lazy"
                            />
                            {awayWins && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -left-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                                >
                                    ⭐
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Result indicator - Gold gradient */}
                {hasResult && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600"
                    />
                )}
            </Card>
        </motion.div>
    );
}
