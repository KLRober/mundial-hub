'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Flame, ChevronRight, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeaderboard } from '@/hooks/useLeaderboard';

const rankColors = [
    'from-gold to-gold', // 1st - Gold
    'from-slate-300 to-slate-400', // 2nd - Silver
    'from-amber-700 to-amber-800', // 3rd - Bronze
];

const rankIcons = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
    const { leaderboard, isLoading } = useLeaderboard(5);

    if (isLoading) {
        return (
            <Card className="p-4 space-y-3 glass-card border-mexico/20">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-gold" />
                    <h2 className="text-lg font-semibold">Leaderboard</h2>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 rounded-lg bg-mexico/10 animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden glass-card border-mexico/20">
            {/* Header with stadium gradient */}
            <div className="bg-linear-to-r from-gold/20 via-mexico/15 to-usa/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-gold" />
                        </div>
                        <h2 className="text-lg font-bold">Leaderboard</h2>
                    </div>
                    <Link href="/ranking">
                        <motion.span
                            whileHover={{ x: 3 }}
                            className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1 transition-colors"
                        >
                            Ver todo
                            <ChevronRight className="h-3 w-3" />
                        </motion.span>
                    </Link>
                </div>
            </div>

            {/* Leaderboard entries */}
            <div className="p-2">
                {leaderboard.map((entry, index) => (
                    <motion.div
                        key={entry.user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${index === 0
                            ? 'bg-linear-to-r from-gold/15 to-transparent border border-gold/20'
                            : 'hover:bg-mexico/10'
                            }`}
                    >
                        {/* Rank */}
                        <div
                            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index < 3
                                ? `bg-linear-to-br ${rankColors[index]} text-white shadow-lg`
                                : 'bg-mexico/15 text-muted-foreground'
                                }`}
                        >
                            {index < 3 ? (
                                <span className="text-base">{rankIcons[index]}</span>
                            ) : (
                                entry.rank
                            )}
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${index === 0 ? 'text-gold' : ''}`}>
                                {entry.user.username}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{entry.correct_predictions} aciertos</span>
                                {entry.current_streak > 2 && (
                                    <span className="flex items-center gap-0.5 text-orange-500">
                                        <Flame className="h-3 w-3" />
                                        {entry.current_streak}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                            <p className={`font-bold ${index === 0 ? 'text-gold text-lg' : 'text-gold'}`}>
                                {entry.total_points.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">pts</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom gradient bar */}
            <div className="h-[2px] bg-linear-to-r from-mexico via-gold to-canada" />
        </Card>
    );
}
