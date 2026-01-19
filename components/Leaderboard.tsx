'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Flame, ChevronRight, Target, Award, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLeaderboard } from '@/hooks/useLeaderboard';

const rankColors = [
    'medal-gold', // 1st - Gold
    'medal-silver', // 2nd - Silver
    'medal-bronze', // 3rd - Bronze
];

const rankEmojis = ['🥇', '🥈', '🥉'];

const TrendIndicator = ({ trend }: { trend: 'up' | 'down' | 'same' | null }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 trend-up" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 trend-down" />;
    if (trend === 'same') return <Minus className="w-3 h-3 trend-same" />;
    return null;
};

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
            <div className="bg-linear-to-r from-amber-50 to-amber-100/50 p-4 border-b border-amber-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-amber-800">Leaderboard</h2>
                    </div>
                    <Link href="/ranking">
                        <motion.span
                            whileHover={{ x: 3 }}
                            className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors font-medium"
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
                            ? 'golden-crown-border'
                            : 'hover:bg-gray-50'
                            }`}
                    >
                        {/* Rank with medal */}
                        <div
                            className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index < 3
                                ? `${rankColors[index]} text-white shadow-lg`
                                : 'bg-gray-100 text-gray-500'
                                }`}
                        >
                            {index < 3 ? (
                                <span className="text-base">{rankEmojis[index]}</span>
                            ) : (
                                entry.rank
                            )}
                        </div>

                        {/* Trend */}
                        <div className="w-4">
                            <TrendIndicator trend={entry.trend} />
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                                {index === 0 && <Crown className="w-3 h-3 text-amber-500" />}
                                <p className={`font-semibold truncate ${index === 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                                    {entry.user.username}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                {/* Stats badges */}
                                <span className="stat-badge-pe px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                                    <Target className="w-2 h-2" />
                                    {entry.plenos}
                                </span>
                                <span className="stat-badge-ga px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                                    <Award className="w-2 h-2" />
                                    {entry.ganadores_acertados}
                                </span>
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
