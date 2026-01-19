'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Loader2, Trophy, Undo2 } from 'lucide-react';
import { getFlagUrl, getTeamByCode } from '@/lib/worldCupData';

interface AdminMatchCardProps {
    matchId: string;
    homeTeamCode: string;
    awayTeamCode: string;
    group: string;
    matchday: number;
    isProcessed: boolean;
    savedHomeGoals?: number;
    savedAwayGoals?: number;
    onFinalize: (matchId: string, homeGoals: number, awayGoals: number) => Promise<void>;
    onReset?: (matchId: string) => Promise<void>;
}

export default function AdminMatchCard({
    matchId,
    homeTeamCode,
    awayTeamCode,
    group,
    matchday,
    isProcessed,
    savedHomeGoals,
    savedAwayGoals,
    onFinalize,
    onReset
}: AdminMatchCardProps) {
    const [homeGoals, setHomeGoals] = useState<string>(savedHomeGoals?.toString() ?? '');
    const [awayGoals, setAwayGoals] = useState<string>(savedAwayGoals?.toString() ?? '');
    const [loading, setLoading] = useState(false);

    const homeTeam = getTeamByCode(homeTeamCode);
    const awayTeam = getTeamByCode(awayTeamCode);

    const handleFinalize = async () => {
        const h = parseInt(homeGoals);
        const a = parseInt(awayGoals);

        if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;

        setLoading(true);
        try {
            await onFinalize(matchId, h, a);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!onReset) return;
        if (!confirm('¿Estás seguro de deshacer este resultado? Se recalcularán los puntos.')) return;

        setLoading(true);
        try {
            await onReset(matchId);
            setHomeGoals('');
            setAwayGoals('');
        } finally {
            setLoading(false);
        }
    };

    const canFinalize = homeGoals !== '' && awayGoals !== '' && !isProcessed;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={`p-4 transition-all ${isProcessed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:border-gold/50'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            Grupo {group}
                        </span>
                        <span className="text-xs text-gray-400">
                            Jornada {matchday}
                        </span>
                    </div>
                    {isProcessed && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-medium">Finalizado</span>
                            </div>
                            {onReset && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                    onClick={handleReset}
                                    disabled={loading}
                                    title="Deshacer resultado"
                                >
                                    {loading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Undo2 className="w-3 h-3" />
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Match Row */}
                <div className="flex items-center gap-3">
                    {/* Home Team */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">
                            {homeTeam?.name || homeTeamCode.toUpperCase()}
                        </span>
                        <img
                            src={getFlagUrl(homeTeamCode, 40)}
                            alt={homeTeam?.name || homeTeamCode}
                            className="w-8 h-6 object-cover rounded shadow-sm"
                        />
                    </div>

                    {/* Score Inputs */}
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min="0"
                            max="99"
                            value={homeGoals}
                            onChange={(e) => setHomeGoals(e.target.value)}
                            disabled={isProcessed}
                            className={`w-14 h-10 text-center text-lg font-bold border-2 ${isProcessed
                                    ? 'border-emerald-200 bg-white text-emerald-700'
                                    : 'border-gray-200 focus:border-grass'
                                }`}
                        />
                        <span className={`font-bold ${isProcessed ? 'text-emerald-300' : 'text-gray-400'}`}>-</span>
                        <Input
                            type="number"
                            min="0"
                            max="99"
                            value={awayGoals}
                            onChange={(e) => setAwayGoals(e.target.value)}
                            disabled={isProcessed}
                            className={`w-14 h-10 text-center text-lg font-bold border-2 ${isProcessed
                                    ? 'border-emerald-200 bg-white text-emerald-700'
                                    : 'border-gray-200 focus:border-grass'
                                }`}
                        />
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex items-center gap-2">
                        <img
                            src={getFlagUrl(awayTeamCode, 40)}
                            alt={awayTeam?.name || awayTeamCode}
                            className="w-8 h-6 object-cover rounded shadow-sm"
                        />
                        <span className="text-sm font-medium text-gray-800 truncate">
                            {awayTeam?.name || awayTeamCode.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Finalize Button */}
                {!isProcessed && (
                    <div className="mt-4 flex justify-center">
                        <Button
                            onClick={handleFinalize}
                            disabled={!canFinalize || loading}
                            className="bg-grass hover:bg-grass-dark text-white font-medium shadow-md"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Trophy className="w-4 h-4 mr-2" />
                            )}
                            Finalizar Partido
                        </Button>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
