'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Flame, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeaderboard } from '@/hooks/useLeaderboard';

const rankColors = [
    'from-amber-400 to-amber-500', // 1st - Gold
    'from-gray-300 to-gray-400', // 2nd - Silver
    'from-amber-600 to-amber-700', // 3rd - Bronze
];

const rankIcons = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
    const { leaderboard, isLoading } = useLeaderboard(5);

    if (isLoading) {
        return (
            <Card className="p-4 space-y-3 bg-white border-gray-100">
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold">Leaderboard</h2>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden bg-white border-gray-100 shadow-sm">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Trophy className="h-4 w-4 text-amber-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
                    </div>
                    <Link href="/ranking">
                        <motion.span
                            whileHover={{ x: 3 }}
                            className="text-xs text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
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
                            ? 'bg-amber-50 border border-amber-100'
                            : 'hover:bg-gray-50'
                            }`}
                    >
                        {/* Rank */}
                        <div
                            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index < 3
                                ? `bg-linear-to-br ${rankColors[index]} text-white shadow-lg`
                                : 'bg-gray-100 text-gray-500'
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
                            <p className={`font-semibold truncate ${index === 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                                {entry.user.username}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
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
                            <p className={`font-bold ${index === 0 ? 'text-amber-600 text-lg' : 'text-emerald-700'}`}>
                                {entry.total_points.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">pts</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    );
}
