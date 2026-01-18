'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Match } from '@/types/database';

interface MatchCardProps {
    match: Match;
    onClick?: () => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                onClick={onClick}
                className={`relative overflow-hidden p-4 cursor-pointer transition-all duration-300 ${isLive
                    ? 'bg-linear-to-br from-red-500/10 via-orange-500/5 to-transparent border-red-500/30'
                    : 'bg-linear-to-br from-primary/5 via-transparent to-secondary/5 hover:from-primary/10 hover:to-secondary/10'
                    }`}
            >
                {/* Live indicator */}
                {isLive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                            En Vivo
                        </span>
                    </div>
                )}

                {/* Match info */}
                <div className="flex items-center justify-between gap-4">
                    {/* Home team */}
                    <div className="flex-1 text-center">
                        <div className="text-3xl mb-1">{match.home_team.flag_url}</div>
                        <p className="text-sm font-medium text-foreground/80 truncate">
                            {match.home_team.name}
                        </p>
                    </div>

                    {/* Score or time */}
                    <div className="flex flex-col items-center min-w-[80px]">
                        {isFinished || isLive ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{match.home_score}</span>
                                <span className="text-lg text-muted-foreground">-</span>
                                <span className="text-2xl font-bold">{match.away_score}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                                <span className="text-lg font-semibold text-primary">
                                    {match.match_time}
                                </span>
                            </div>
                        )}

                        {isFinished && (
                            <span className="text-xs text-muted-foreground mt-1">Final</span>
                        )}
                    </div>

                    {/* Away team */}
                    <div className="flex-1 text-center">
                        <div className="text-3xl mb-1">{match.away_team.flag_url}</div>
                        <p className="text-sm font-medium text-foreground/80 truncate">
                            {match.away_team.name}
                        </p>
                    </div>
                </div>

                {/* Venue */}
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                        {match.venue}, {match.city}
                    </span>
                </div>

                {/* Group badge */}
                {match.group && (
                    <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            Grupo {match.group}
                        </span>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
