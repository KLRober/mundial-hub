'use client';

import { motion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';
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
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-dashed border-border/50">
                <HelpCircle className="w-5 h-5 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground/50 italic">Por definir</span>
            </div>
        );
    }

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            onClick={onClick}
            disabled={disabled}
            className={`
        w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200
        ${isWinner
                    ? 'bg-green-500/20 border-2 border-green-500 shadow-sm shadow-green-500/20'
                    : isLoser
                        ? 'bg-muted/30 border border-border/50 opacity-50'
                        : 'bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/5'
                }
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <img
                src={getFlagUrl(team.team.code, 40)}
                alt={team.team.name}
                className="w-6 h-4 object-cover rounded shadow-sm"
                loading="lazy"
            />
            <span className={`flex-1 text-sm font-medium truncate text-left ${isWinner ? 'text-green-700 dark:text-green-400' : ''}`}>
                {team.team.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
                {team.position}°{team.group}
            </span>
            {isWinner && (
                <Check className="w-4 h-4 text-green-600" />
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
            <Card className={`overflow-hidden ${compact ? 'p-2' : 'p-3'} bg-card/90 backdrop-blur-sm`}>
                {/* Match ID Badge */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                        Partido {match.position}
                    </span>
                    {match.winner && (
                        <span className="text-[10px] font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                            Decidido
                        </span>
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
            </Card>
        </motion.div>
    );
}
