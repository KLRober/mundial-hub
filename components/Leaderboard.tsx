'use client';

import { motion } from 'framer-motion';
import { Trophy, Flame, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeaderboard } from '@/hooks/useLeaderboard';

const rankColors = [
    'from-yellow-400 to-amber-500', // 1st
    'from-slate-300 to-slate-400', // 2nd
    'from-amber-600 to-amber-700', // 3rd
];

export function Leaderboard() {
    const { leaderboard, isLoading } = useLeaderboard(5);

    if (isLoading) {
        return (
            <Card className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold">Leaderboard</h2>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 rounded-lg bg-muted/50 animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-linear-to-r from-primary/20 via-secondary/15 to-accent/10 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold">Leaderboard</h2>
                    </div>
                    <motion.button
                        whileHover={{ x: 3 }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                        Ver todo
                        <ChevronRight className="h-3 w-3" />
                    </motion.button>
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
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${index === 0
                            ? 'bg-linear-to-r from-yellow-500/10 to-transparent'
                            : 'hover:bg-muted/50'
                            }`}
                    >
                        {/* Rank */}
                        <div
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3
                                ? `bg-linear-to-br ${rankColors[index]} text-white shadow-lg`
                                : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {entry.rank}
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{entry.user.username}</p>
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
                            <p className="font-bold text-primary">
                                {entry.total_points.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">pts</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
}
