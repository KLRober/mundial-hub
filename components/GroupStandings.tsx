'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { TeamStanding } from '@/types/groupStandings';
import { getFlagUrl } from '@/lib/worldCupData';

interface GroupStandingsProps {
    standings: TeamStanding[];
    previousStandings?: TeamStanding[];
}

export function GroupStandings({ standings, previousStandings }: GroupStandingsProps) {
    // Calculate position changes for animations
    const getPositionChange = (teamCode: string, currentPosition: number): number => {
        if (!previousStandings) return 0;
        const prev = previousStandings.find(s => s.team.code === teamCode);
        if (!prev) return 0;
        return prev.position - currentPosition; // Positive = moved up, Negative = moved down
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[32px_1fr_28px_28px_28px_28px_36px_36px_36px_36px] gap-1 px-3 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                <span className="text-center">#</span>
                <span>Equipo</span>
                <span className="text-center">PJ</span>
                <span className="text-center">PG</span>
                <span className="text-center">PE</span>
                <span className="text-center">PP</span>
                <span className="text-center">GF</span>
                <span className="text-center">GC</span>
                <span className="text-center">DG</span>
                <span className="text-center font-bold text-foreground">PTS</span>
            </div>

            {/* Table Body with Animations */}
            <div className="divide-y divide-border/30">
                <AnimatePresence mode="popLayout">
                    {standings.map((standing) => {
                        const positionChange = getPositionChange(standing.team.code, standing.position);
                        const isQualified = standing.position <= 2;

                        return (
                            <motion.div
                                key={standing.team.code}
                                layout
                                layoutId={`standing-${standing.team.code}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{
                                    layout: { duration: 0.4, type: 'spring', stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className={`grid grid-cols-[32px_1fr_28px_28px_28px_28px_36px_36px_36px_36px] gap-1 px-3 py-2.5 items-center text-xs
                  ${isQualified ? 'bg-green-500/10' : 'bg-transparent'}
                  transition-colors duration-300
                `}
                            >
                                {/* Position with indicator */}
                                <div className="flex items-center justify-center gap-0.5">
                                    <span className={`font-bold ${isQualified ? 'text-green-600' : ''}`}>
                                        {standing.position}
                                    </span>
                                    {positionChange !== 0 && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                        >
                                            {positionChange > 0 ? (
                                                <ChevronUp className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3 text-red-500" />
                                            )}
                                        </motion.span>
                                    )}
                                </div>

                                {/* Team with flag */}
                                <div className="flex items-center gap-2 min-w-0">
                                    <img
                                        src={getFlagUrl(standing.team.code, 40)}
                                        alt={standing.team.name}
                                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                        loading="lazy"
                                    />
                                    <span className="font-medium truncate">{standing.team.name}</span>
                                </div>

                                {/* Stats */}
                                <span className="text-center text-muted-foreground">{standing.played}</span>
                                <span className="text-center text-muted-foreground">{standing.won}</span>
                                <span className="text-center text-muted-foreground">{standing.drawn}</span>
                                <span className="text-center text-muted-foreground">{standing.lost}</span>
                                <span className="text-center">{standing.goalsFor}</span>
                                <span className="text-center">{standing.goalsAgainst}</span>
                                <span className={`text-center font-medium ${standing.goalDiff > 0 ? 'text-green-600' :
                                        standing.goalDiff < 0 ? 'text-red-500' : ''
                                    }`}>
                                    {standing.goalDiff > 0 ? '+' : ''}{standing.goalDiff}
                                </span>
                                <span className="text-center font-bold text-primary">{standing.points}</span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="px-3 py-2 bg-muted/20 border-t border-border/30">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                    <span>Clasificado a la siguiente fase</span>
                </div>
            </div>
        </div>
    );
}
