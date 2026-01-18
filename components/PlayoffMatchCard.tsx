'use client';

import { motion } from 'framer-motion';
import { Check, HelpCircle, Trophy } from 'lucide-react';
import { Card } from './ui/card';
import { getFlagUrl } from '@/lib/worldCupData';
import type { PlayoffMatch, QualifiedTeam } from '@/types/playoffTypes';

interface PlayoffMatchCardProps {
    match: PlayoffMatch;
    onSelectWinner: (matchId: string, winnerCode: string) => void;
    compact?: boolean;
}

function TeamRow({
    team,
    isWinner,
    isLoser,
    onClick,
    disabled,
}: {
    team: QualifiedTeam | null;
    isWinner: boolean;
    isLoser: boolean;
    onClick: () => void;
    disabled: boolean;
}) {
    if (!team) {
        return (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-mexico/5 border border-dashed border-mexico/20">
                <HelpCircle className="w-5 h-5 text-muted-foreground/40" />
                <span className="text-sm text-muted-foreground/50 italic">Por definir</span>
            </div>
        );
    }

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, y: -1 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            onClick={onClick}
            disabled={disabled}
            className={`
        w-full flex items-center gap-2 p-2.5 rounded-lg transition-all duration-300
        ${isWinner
                    ? 'bg-linear-to-r from-gold/20 to-gold/10 border-2 border-gold shadow-lg shadow-gold/20'
                    : isLoser
                        ? 'bg-mexico/5 border border-mexico/10 opacity-40 scale-95'
                        : 'bg-mexico/5 border border-mexico/20 hover:border-gold/50 hover:bg-gold/5'
                }
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <div className="relative">
                <img
                    src={getFlagUrl(team.team.code, 40)}
                    alt={team.team.name}
                    className={`w-7 h-5 object-cover rounded shadow-sm transition-all
                        ${isWinner ? 'ring-2 ring-gold ring-offset-1 ring-offset-transparent' : ''}`}
                    loading="lazy"
                />
                {isWinner && (
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold rounded-full flex items-center justify-center"
                    >
                        <Trophy className="w-2.5 h-2.5 text-gold-dark" />
                    </motion.div>
                )}
            </div>
            <span className={`flex-1 text-sm font-medium truncate text-left transition-colors
                ${isWinner ? 'text-gold font-bold' : ''}`}>
                {team.team.name}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap transition-colors
                ${isWinner
                    ? 'bg-gold/20 text-gold font-semibold'
                    : 'bg-mexico/10 text-muted-foreground'
                }`}>
                {team.originLabel || `${team.position}° ${team.group}`}
            </span>
            {isWinner && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                >
                    <Check className="w-4 h-4 text-gold" />
                </motion.div>
            )}
        </motion.button>
    );
}

export function PlayoffMatchCard({ match, onSelectWinner, compact = false }: PlayoffMatchCardProps) {
    const hasTeams = match.team1 && match.team2;
    const isTeam1Winner = match.winner === match.team1?.team.code;
    const isTeam2Winner = match.winner === match.team2?.team.code;

    const handleSelect = (teamCode: string) => {
        if (!hasTeams) return;
        onSelectWinner(match.id, teamCode);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={`overflow-hidden ${compact ? 'p-2' : 'p-3'} glass-card backdrop-blur-xl border-mexico/20`}>
                {/* Match ID Badge */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Partido {match.position}
                    </span>
                    {match.winner && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] font-bold text-gold bg-gold/15 px-2 py-0.5 rounded-full flex items-center gap-1"
                        >
                            <Trophy className="w-3 h-3" />
                            Decidido
                        </motion.span>
                    )}
                </div>

                {/* Teams */}
                <div className="space-y-1.5">
                    <TeamRow
                        team={match.team1}
                        isWinner={isTeam1Winner}
                        isLoser={isTeam2Winner}
                        onClick={() => match.team1 && handleSelect(match.team1.team.code)}
                        disabled={!hasTeams}
                    />
                    <TeamRow
                        team={match.team2}
                        isWinner={isTeam2Winner}
                        isLoser={isTeam1Winner}
                        onClick={() => match.team2 && handleSelect(match.team2.team.code)}
                        disabled={!hasTeams}
                    />
                </div>

                {/* Golden indicator when decided */}
                {match.winner && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-mexico via-gold to-canada"
                    />
                )}
            </Card>
        </motion.div>
    );
}
