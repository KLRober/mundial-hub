'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Trophy, Crown, Undo2 } from 'lucide-react';
import { getFlagUrl, getTeamByCode } from '@/lib/worldCupData';
import type { PlayoffRound, ROUND_NAMES } from '@/types/playoffTypes';

interface AdminPlayoffCardProps {
    matchId: string;
    round: PlayoffRound;
    team1Code: string | null;
    team2Code: string | null;
    team1Label?: string;
    team2Label?: string;
    isProcessed: boolean;
    savedWinner?: string;
    onFinalize: (matchId: string, winnerCode: string) => Promise<void>;
    onReset?: (matchId: string) => Promise<void>;
}

const ROUND_DISPLAY: Record<PlayoffRound, string> = {
    'R32': 'Dieciseisavos',
    'R16': 'Octavos',
    'QF': 'Cuartos',
    'SF': 'Semifinal',
    'F': 'Final'
};

export default function AdminPlayoffCard({
    matchId,
    round,
    team1Code,
    team2Code,
    team1Label,
    team2Label,
    isProcessed,
    savedWinner,
    onFinalize,
    onReset
}: AdminPlayoffCardProps) {
    const [selectedWinner, setSelectedWinner] = useState<string | null>(savedWinner ?? null);
    const [loading, setLoading] = useState(false);

    const team1 = team1Code ? getTeamByCode(team1Code) : null;
    const team2 = team2Code ? getTeamByCode(team2Code) : null;

    const handleFinalize = async () => {
        if (!selectedWinner) return;

        setLoading(true);
        try {
            await onFinalize(matchId, selectedWinner);
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
            setSelectedWinner(null);
        } finally {
            setLoading(false);
        }
    };

    const canFinalize = selectedWinner && !isProcessed && team1Code && team2Code;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={`p-4 transition-all ${isProcessed ? 'bg-amber-50 border-gold' : 'bg-white border-gray-200 hover:border-grass/50'}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/30">
                            {ROUND_DISPLAY[round]}
                        </span>
                    </div>
                    {isProcessed && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-gold">
                                <Crown className="w-4 h-4" />
                                <span className="text-xs font-medium">Decidido</span>
                            </div>
                            {onReset && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-amber-700/50 hover:text-red-500 hover:bg-red-50 rounded-full"
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

                {/* Teams */}
                <div className="space-y-2">
                    {/* Team 1 */}
                    <button
                        onClick={() => !isProcessed && team1Code && setSelectedWinner(team1Code)}
                        disabled={isProcessed || !team1Code}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selectedWinner === team1Code
                                ? 'border-grass bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isProcessed ? 'cursor-default' : 'cursor-pointer'} ${!team1Code ? 'opacity-50' : ''}`}
                    >
                        {team1Code ? (
                            <>
                                <img
                                    src={getFlagUrl(team1Code, 40)}
                                    alt={team1?.name || team1Code}
                                    className="w-8 h-6 object-cover rounded shadow-sm"
                                />
                                <span className="flex-1 text-left font-medium text-gray-800">
                                    {team1?.name || team1Code.toUpperCase()}
                                </span>
                            </>
                        ) : (
                            <span className="flex-1 text-left text-gray-400 italic">
                                {team1Label || 'Por definir'}
                            </span>
                        )}
                        {selectedWinner === team1Code && (
                            <CheckCircle2 className="w-5 h-5 text-grass" />
                        )}
                    </button>

                    {/* VS Divider */}
                    <div className="flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            VS
                        </span>
                    </div>

                    {/* Team 2 */}
                    <button
                        onClick={() => !isProcessed && team2Code && setSelectedWinner(team2Code)}
                        disabled={isProcessed || !team2Code}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selectedWinner === team2Code
                                ? 'border-grass bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${isProcessed ? 'cursor-default' : 'cursor-pointer'} ${!team2Code ? 'opacity-50' : ''}`}
                    >
                        {team2Code ? (
                            <>
                                <img
                                    src={getFlagUrl(team2Code, 40)}
                                    alt={team2?.name || team2Code}
                                    className="w-8 h-6 object-cover rounded shadow-sm"
                                />
                                <span className="flex-1 text-left font-medium text-gray-800">
                                    {team2?.name || team2Code.toUpperCase()}
                                </span>
                            </>
                        ) : (
                            <span className="flex-1 text-left text-gray-400 italic">
                                {team2Label || 'Por definir'}
                            </span>
                        )}
                        {selectedWinner === team2Code && (
                            <CheckCircle2 className="w-5 h-5 text-grass" />
                        )}
                    </button>
                </div>

                {/* Finalize Button */}
                {!isProcessed && team1Code && team2Code && (
                    <div className="mt-4 flex justify-center">
                        <Button
                            onClick={handleFinalize}
                            disabled={!canFinalize || loading}
                            className="bg-gold hover:bg-[#b8921f] text-white font-medium shadow-md"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Crown className="w-4 h-4 mr-2" />
                            )}
                            Confirmar Ganador
                        </Button>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
