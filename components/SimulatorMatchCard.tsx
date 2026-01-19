'use client';

import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { getFlagUrl } from '@/lib/worldCupData';
import type { WorldCupTeam } from '@/lib/worldCupData';
import { CheckCircle2 } from 'lucide-react';

interface SimulatorMatchCardProps {
    matchId: string | number;
    homeTeam: WorldCupTeam;
    awayTeam: WorldCupTeam;
    homeGoals: number | null;
    awayGoals: number | null;
    onPredictionChange: (homeGoals: number | null, awayGoals: number | null) => void;
    officialResult?: {
        homeGoals: number;
        awayGoals: number;
    };
}

export function SimulatorMatchCard({
    matchId,
    homeTeam,
    awayTeam,
    homeGoals,
    awayGoals,
    onPredictionChange,
    officialResult
}: SimulatorMatchCardProps) {
    // Use official result if available, otherwise prediction
    const effectiveHome = officialResult ? officialResult.homeGoals : homeGoals;
    const effectiveAway = officialResult ? officialResult.awayGoals : awayGoals;

    const hasResult = effectiveHome !== null && effectiveAway !== null;
    const homeWins = hasResult && effectiveHome! > effectiveAway!;
    const awayWins = hasResult && effectiveAway! > effectiveHome!;
    const isDraw = hasResult && effectiveHome === effectiveAway;

    // Check if prediction matches official result (for styling)
    const isExactHit = officialResult && homeGoals === officialResult.homeGoals && awayGoals === officialResult.awayGoals;
    const isResultHit = officialResult && !isExactHit && (
        (homeGoals! > awayGoals! && officialResult.homeGoals > officialResult.awayGoals) ||
        (homeGoals! < awayGoals! && officialResult.homeGoals < officialResult.awayGoals) ||
        (homeGoals === awayGoals && officialResult.homeGoals === officialResult.awayGoals && homeGoals !== null)
    );

    const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (officialResult) return; // Read only if finalized
        const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
        if (value === null || (!isNaN(value) && value >= 0 && value <= 99)) {
            onPredictionChange(value, awayGoals);
        }
    };

    const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (officialResult) return; // Read only if finalized
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
                border-gray-100 transition-all duration-300
                ${officialResult
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'hover:border-amber-300 shadow-sm'
                }
                ${hasResult && !officialResult ? 'shadow-md border-amber-200' : ''}`}
            >
                {/* Status Badge */}
                {officialResult && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-bl-lg flex items-center gap-1 z-10">
                        <CheckCircle2 className="w-3 h-3" />
                        FINAL
                    </div>
                )}

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

                    {/* Score Inputs / Display */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 relative">
                            {officialResult && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap font-semibold text-emerald-600">
                                    {isExactHit ? '+3 PUNTOS' : isResultHit ? '+1 PUNTO' : ''}
                                </div>
                            )}
                            <input
                                type="number"
                                value={effectiveHome ?? ''}
                                onChange={handleHomeChange}
                                readOnly={!!officialResult}
                                className={`w-14 h-14 text-center text-2xl font-extrabold rounded-xl 
                                border-2 transition-all duration-200
                                ${officialResult
                                        ? 'bg-white border-emerald-200 text-gray-800' // Official style
                                        : homeWins
                                            ? 'border-amber-500 bg-amber-50 text-amber-600'
                                            : 'bg-gray-50 border-gray-200 focus:border-amber-500 focus:bg-amber-50'
                                    }
                                focus:outline-none placeholder:text-gray-300`}
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
                                value={effectiveAway ?? ''}
                                onChange={handleAwayChange}
                                readOnly={!!officialResult}
                                className={`w-14 h-14 text-center text-2xl font-extrabold rounded-xl 
                                border-2 transition-all duration-200
                                ${officialResult
                                        ? 'bg-white border-emerald-200 text-gray-800' // Official style
                                        : awayWins
                                            ? 'border-amber-500 bg-amber-50 text-amber-600'
                                            : 'bg-gray-50 border-gray-200 focus:border-amber-500 focus:bg-amber-50'
                                    }
                                focus:outline-none placeholder:text-gray-300`}
                                placeholder="-"
                            />
                        </div>

                        {/* User Prediction Display */}
                        {officialResult && (homeGoals !== null && awayGoals !== null) && (
                            <div className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                                Tu predicción: {homeGoals} - {awayGoals}
                            </div>
                        )}
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

                {/* Result indicator - Gold gradient (only if not official to avoid clutter) */}
                {hasResult && !officialResult && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 via-amber-500 to-amber-600"
                    />
                )}

                {/* Official Result Indicator - Emerald gradient */}
                {officialResult && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                    />
                )}
            </Card>
        </motion.div>
    );
}
