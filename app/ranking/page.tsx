'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface RankingUser {
    id: string;
    username: string | null;
    avatar_url: string | null;
    puntos_totales: number;
}

export default function RankingPage() {
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setCurrentUserId(user?.id ?? null);
        });

        // Fetch ranking - only necessary fields for security and efficiency
        const fetchRanking = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, puntos_totales')
                .order('puntos_totales', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching ranking:', error);
            } else {
                setRanking(data || []);
            }
            setLoading(false);
        };

        fetchRanking();
    }, []);

    const getMedalStyles = (rank: number) => {
        switch (rank) {
            case 1:
                return {
                    bg: 'bg-linear-to-br from-yellow-400 via-amber-300 to-yellow-500',
                    text: 'text-yellow-900',
                    shadow: 'shadow-lg shadow-yellow-500/30',
                    icon: <Crown className="w-6 h-6" />
                };
            case 2:
                return {
                    bg: 'bg-linear-to-br from-slate-300 via-gray-200 to-slate-400',
                    text: 'text-slate-700',
                    shadow: 'shadow-lg shadow-slate-400/30',
                    icon: <Medal className="w-5 h-5" />
                };
            case 3:
                return {
                    bg: 'bg-linear-to-br from-amber-600 via-orange-500 to-amber-700',
                    text: 'text-amber-100',
                    shadow: 'shadow-lg shadow-amber-600/30',
                    icon: <Medal className="w-5 h-5" />
                };
            default:
                return null;
        }
    };

    const SkeletonLoader = () => (
        <div className="space-y-4">
            {/* Top 3 skeleton */}
            <div className="flex justify-center items-end gap-4 py-8">
                <div className="w-20 h-28 bg-muted/50 rounded-xl animate-pulse" />
                <div className="w-24 h-36 bg-muted/50 rounded-xl animate-pulse" />
                <div className="w-20 h-24 bg-muted/50 rounded-xl animate-pulse" />
            </div>
            {/* List skeleton */}
            {[4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
        </div>
    );

    const TopThreePodium = () => {
        const top3 = ranking.slice(0, 3);
        if (top3.length < 3) return null;

        // Reorder for podium display: 2nd, 1st, 3rd
        const podiumOrder = [top3[1], top3[0], top3[2]];
        const heights = ['h-24', 'h-32', 'h-20'];
        const positions = [2, 1, 3];

        return (
            <div className="flex justify-center items-end gap-2 py-6 mb-6">
                {podiumOrder.map((user, idx) => {
                    const rank = positions[idx];
                    const medal = getMedalStyles(rank);
                    const isCurrentUser = user.id === currentUserId;

                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative flex flex-col items-center ${heights[idx]}`}
                        >
                            {/* Crown for 1st place */}
                            {rank === 1 && (
                                <motion.div
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute -top-6 text-yellow-500"
                                >
                                    <Crown className="w-8 h-8" />
                                </motion.div>
                            )}

                            {/* Avatar */}
                            <div className={`relative w-14 h-14 rounded-full ${medal?.bg} ${medal?.shadow} p-0.5 ${isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                                <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.username || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Rank badge */}
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${medal?.bg} ${medal?.text} flex items-center justify-center text-xs font-bold`}>
                                    {rank}
                                </div>
                            </div>

                            {/* Name and points */}
                            <p className={`mt-2 text-sm font-semibold truncate max-w-[80px] ${isCurrentUser ? 'text-primary' : ''}`}>
                                {user.username || 'Anon'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {user.puntos_totales.toLocaleString()} pts
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen p-4 pb-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-linear-to-br from-yellow-400 to-amber-500 text-white">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Ranking Global
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Top jugadores del Mundial Hub
                    </p>
                </div>
            </div>

            {loading ? (
                <SkeletonLoader />
            ) : ranking.length === 0 ? (
                <Card className="p-8 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                        Aún no hay jugadores en el ranking.
                        <br />
                        ¡Sé el primero en sumar puntos!
                    </p>
                </Card>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    {ranking.length >= 3 && <TopThreePodium />}

                    {/* Rest of the ranking */}
                    <Card className="overflow-hidden">
                        <div className="divide-y divide-border">
                            {ranking.slice(3).map((user, index) => {
                                const rank = index + 4;
                                const isCurrentUser = user.id === currentUserId;

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`flex items-center gap-4 p-4 ${isCurrentUser ? 'bg-primary/5' : 'hover:bg-muted/50'} transition-colors`}
                                    >
                                        {/* Rank */}
                                        <div className="w-8 text-center font-bold text-muted-foreground">
                                            {rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.username || 'User'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                                                {user.username || 'Anónimo'}
                                            </p>
                                        </div>

                                        {/* Points */}
                                        <div className="text-right">
                                            <p className="font-bold text-primary">
                                                {user.puntos_totales.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">pts</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* If less than 3 users, show simplified list */}
                    {ranking.length < 3 && (
                        <Card className="overflow-hidden">
                            <div className="divide-y divide-border">
                                {ranking.map((user, index) => {
                                    const rank = index + 1;
                                    const medal = getMedalStyles(rank);
                                    const isCurrentUser = user.id === currentUserId;

                                    return (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex items-center gap-4 p-4 ${isCurrentUser ? 'bg-primary/5' : ''}`}
                                        >
                                            {/* Rank with medal styling */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${medal ? `${medal.bg} ${medal.text}` : 'bg-muted text-muted-foreground'}`}>
                                                {rank}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.username || 'User'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>

                                            {/* Name */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                                                    {user.username || 'Anónimo'}
                                                </p>
                                            </div>

                                            {/* Points */}
                                            <div className="text-right">
                                                <p className="font-bold text-primary">
                                                    {user.puntos_totales.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">pts</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
