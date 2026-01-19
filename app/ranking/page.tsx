'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, User, TrendingUp, TrendingDown, Minus, Target, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { ShareButton } from '@/components/ShareButton';

interface RankingUser {
    id: string;
    username: string | null;
    avatar_url: string | null;
    puntos_totales: number;
    plenos: number;
    ganadores_acertados: number;
    trend: 'up' | 'down' | 'same' | null;
}

// Cache key for localStorage trend tracking
const RANKING_CACHE_KEY = 'mundial-hub-ranking-cache';

interface RankingCache {
    timestamp: number;
    rankings: { [userId: string]: number };
}

function getCachedRankings(): { [userId: string]: number } | null {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(RANKING_CACHE_KEY);
        if (!cached) return null;
        const data: RankingCache = JSON.parse(cached);
        return data.rankings;
    } catch {
        return null;
    }
}

function setCachedRankings(rankings: { [userId: string]: number }): void {
    if (typeof window === 'undefined') return;
    try {
        const cache: RankingCache = { timestamp: Date.now(), rankings };
        localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(cache));
    } catch { /* ignore */ }
}

export default function RankingPage() {
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserStats, setCurrentUserStats] = useState<{ username: string; rank: number; points: number; plenos: number } | null>(null);
    const [demoUser, setDemoUser] = useState<RankingUser | null>(null);

    useEffect(() => {
        // Check for demo mode
        const demoUserData = localStorage.getItem('mundial-hub-demo-user');
        const demoPoints = parseInt(localStorage.getItem('mundial-hub-demo-points') || '0');

        if (demoUserData) {
            const parsed = JSON.parse(demoUserData);
            setCurrentUserId(parsed.id);
            if (demoPoints > 0) {
                setDemoUser({
                    id: parsed.id,
                    username: 'Jugador Demo ⭐',
                    avatar_url: null,
                    puntos_totales: demoPoints,
                    plenos: 0,
                    ganadores_acertados: 0,
                    trend: null
                });
            }
        } else {
            supabase.auth.getUser().then(({ data: { user } }) => {
                setCurrentUserId(user?.id ?? null);
            });
        }

        const fetchRanking = async () => {
            // Fetch profiles
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, puntos_totales')
                .order('puntos_totales', { ascending: false })
                .limit(50);

            if (error || !profiles) {
                console.error('Error fetching ranking:', error);
                setRanking([]);
                setLoading(false);
                return;
            }

            // Fetch prediction stats
            const userIds = profiles.map(p => p.id);
            const { data: predictions } = await supabase
                .from('predictions')
                .select('user_id, puntos_ganados')
                .in('user_id', userIds)
                .not('puntos_ganados', 'is', null);

            // Calculate stats per user
            const userStats: { [id: string]: { plenos: number; ganadores: number } } = {};
            if (predictions) {
                for (const pred of predictions) {
                    if (!userStats[pred.user_id]) {
                        userStats[pred.user_id] = { plenos: 0, ganadores: 0 };
                    }
                    if (pred.puntos_ganados === 3) userStats[pred.user_id].plenos++;
                    else if (pred.puntos_ganados === 1) userStats[pred.user_id].ganadores++;
                }
            }

            // Sort by points, then plenos as tiebreaker
            const sorted = [...profiles].sort((a, b) => {
                const pointsDiff = (b.puntos_totales || 0) - (a.puntos_totales || 0);
                if (pointsDiff !== 0) return pointsDiff;
                const aPlenos = userStats[a.id]?.plenos || 0;
                const bPlenos = userStats[b.id]?.plenos || 0;
                return bPlenos - aPlenos;
            });

            // Get previous rankings for trends
            const previousRankings = getCachedRankings();

            // Build ranking with trends
            const rankingWithStats: RankingUser[] = sorted.map((profile, idx) => {
                const rank = idx + 1;
                const stats = userStats[profile.id] || { plenos: 0, ganadores: 0 };

                let trend: 'up' | 'down' | 'same' | null = null;
                if (previousRankings && profile.id in previousRankings) {
                    const prevRank = previousRankings[profile.id];
                    if (rank < prevRank) trend = 'up';
                    else if (rank > prevRank) trend = 'down';
                    else trend = 'same';
                }

                return {
                    id: profile.id,
                    username: profile.username,
                    avatar_url: profile.avatar_url,
                    puntos_totales: profile.puntos_totales || 0,
                    plenos: stats.plenos,
                    ganadores_acertados: stats.ganadores,
                    trend
                };
            });

            // Cache new rankings
            const newCache: { [userId: string]: number } = {};
            rankingWithStats.forEach((u, idx) => { newCache[u.id] = idx + 1; });
            setCachedRankings(newCache);

            setRanking(rankingWithStats);
            setLoading(false);

            // Find current user stats for sharing
            const currentUserData = rankingWithStats.find(u => u.id === currentUserId);
            if (currentUserData) {
                const userRank = rankingWithStats.findIndex(u => u.id === currentUserId) + 1;
                setCurrentUserStats({
                    username: currentUserData.username || 'Anónimo',
                    rank: userRank,
                    points: currentUserData.puntos_totales,
                    plenos: currentUserData.plenos,
                });
            }
        };

        fetchRanking();
    }, []);

    const TrendIndicator = ({ trend }: { trend: 'up' | 'down' | 'same' | null }) => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4 trend-up" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4 trend-down" />;
        if (trend === 'same') return <Minus className="w-4 h-4 trend-same" />;
        return null;
    };

    const StatsBadges = ({ plenos, ganadores }: { plenos: number; ganadores: number }) => (
        <div className="flex gap-1.5">
            <span className="stat-badge-pe px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                <Target className="w-2.5 h-2.5" />
                {plenos}
            </span>
            <span className="stat-badge-ga px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5" />
                {ganadores}
            </span>
        </div>
    );

    const SkeletonLoader = () => (
        <div className="space-y-4">
            <div className="flex justify-center items-end gap-4 py-8">
                <div className="w-20 h-28 bg-muted/50 rounded-xl animate-pulse" />
                <div className="w-24 h-36 bg-muted/50 rounded-xl animate-pulse" />
                <div className="w-20 h-24 bg-muted/50 rounded-xl animate-pulse" />
            </div>
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
        const heights = ['h-28', 'h-36', 'h-24'];
        const positions = [2, 1, 3];
        const medalClasses = ['medal-silver', 'medal-gold', 'medal-bronze'];
        const medalEmojis = ['🥈', '🥇', '🥉'];

        return (
            <div className="flex justify-center items-end gap-3 py-6 mb-6">
                {podiumOrder.map((user, idx) => {
                    const rank = positions[idx];
                    const isChampion = rank === 1;
                    const isCurrentUser = user.id === currentUserId;

                    return (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15, type: 'spring', stiffness: 100 }}
                            className={`relative flex flex-col items-center ${heights[idx]}`}
                        >
                            {/* Champion Crown - Animated */}
                            {isChampion && (
                                <motion.div
                                    initial={{ y: -20, opacity: 0, scale: 0 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                                    className="absolute -top-8 crown-animated"
                                >
                                    <Crown className="w-8 h-8 text-amber-500" fill="#f5d742" />
                                </motion.div>
                            )}

                            {/* Avatar with medal styling */}
                            <div className={`
                                relative w-16 h-16 rounded-full p-0.5
                                ${isChampion ? 'golden-crown-border' : ''}
                                ${isCurrentUser ? 'ring-2 ring-grass ring-offset-2 ring-offset-background' : ''}
                            `}>
                                <div className={`
                                    w-full h-full rounded-full overflow-hidden 
                                    flex items-center justify-center
                                    ${isChampion ? 'bg-linear-to-br from-amber-50 to-amber-100' : 'bg-muted'}
                                `}>
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.username || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className={`w-7 h-7 ${isChampion ? 'text-amber-600' : 'text-muted-foreground'}`} />
                                    )}
                                </div>

                                {/* Medal badge */}
                                <div className={`
                                    absolute -bottom-1 -right-1 w-7 h-7 rounded-full 
                                    ${medalClasses[idx]} 
                                    flex items-center justify-center text-sm
                                `}>
                                    {medalEmojis[idx]}
                                </div>
                            </div>

                            {/* Name with crown for champion */}
                            <div className="mt-2 flex items-center gap-1">
                                {isChampion && <Crown className="w-3 h-3 text-amber-500" />}
                                <p className={`text-sm font-bold truncate max-w-[80px] ${isChampion ? 'text-amber-700' : isCurrentUser ? 'text-grass' : ''}`}>
                                    {user.username || 'Anon'}
                                </p>
                            </div>

                            {/* Points */}
                            <p className={`text-lg font-black ${isChampion ? 'text-amber-600' : 'text-primary'}`}>
                                {user.puntos_totales.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground -mt-1">puntos</p>

                            {/* Stats */}
                            <div className="mt-1">
                                <StatsBadges plenos={user.plenos} ganadores={user.ganadores_acertados} />
                            </div>

                            {/* Trend */}
                            <div className="mt-1">
                                <TrendIndicator trend={user.trend} />
                            </div>
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
                <div className="p-2.5 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                        Ranking Global
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Top jugadores del Mundial Hub
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <span className="stat-badge-pe px-1.5 py-0.5 rounded font-bold">PE</span>
                    <span>Plenos (3pts)</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="stat-badge-ga px-1.5 py-0.5 rounded font-bold">GA</span>
                    <span>Ganadores (1pt)</span>
                </div>
            </div>

            {loading ? (
                <SkeletonLoader />
            ) : ranking.length === 0 && !demoUser ? (
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
                    {/* Demo user special card */}
                    {demoUser && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4"
                        >
                            <Card className="p-4 border-amber-400/40 bg-linear-to-r from-amber-50 to-amber-100/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                                        ⭐
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-amber-700">Tu Puntuación (Demo)</p>
                                        <p className="text-sm text-amber-600/70">
                                            Jugando en modo invitado
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-amber-600">
                                            {demoUser.puntos_totales}
                                        </p>
                                        <p className="text-xs text-amber-600/70">puntos</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Current User Share Button */}
                    {currentUserStats && (
                        <div className="mb-4">
                            <ShareButton
                                username={currentUserStats.username}
                                rank={currentUserStats.rank}
                                points={currentUserStats.points}
                                plenos={currentUserStats.plenos}
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* Top 3 Podium */}
                    {ranking.length >= 3 && <TopThreePodium />}

                    {/* Rest of the ranking (4th place and below) */}
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
                                        className={`
                                            flex items-center gap-3 p-3
                                            ${isCurrentUser ? 'current-user-row' : 'hover:bg-muted/50'}
                                            transition-colors
                                        `}
                                    >
                                        {/* Rank */}
                                        <div className="w-8 text-center font-bold text-muted-foreground">
                                            {rank}
                                        </div>

                                        {/* Trend */}
                                        <div className="w-5">
                                            <TrendIndicator trend={user.trend} />
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center ${isCurrentUser ? 'ring-2 ring-grass' : ''}`}>
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

                                        {/* Name & Stats */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isCurrentUser ? 'text-grass-dark font-bold' : ''}`}>
                                                {user.username || 'Anónimo'}
                                            </p>
                                            <StatsBadges plenos={user.plenos} ganadores={user.ganadores_acertados} />
                                        </div>

                                        {/* Points */}
                                        <div className="text-right">
                                            <p className={`font-bold ${isCurrentUser ? 'text-grass-dark' : 'text-primary'}`}>
                                                {user.puntos_totales.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">pts</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Simplified list if less than 3 users */}
                    {ranking.length > 0 && ranking.length < 3 && (
                        <Card className="overflow-hidden">
                            <div className="divide-y divide-border">
                                {ranking.map((user, index) => {
                                    const rank = index + 1;
                                    const isCurrentUser = user.id === currentUserId;
                                    const medalEmoji = ['🥇', '🥈', '🥉'][rank - 1] || rank;

                                    return (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex items-center gap-4 p-4 ${isCurrentUser ? 'current-user-row' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${rank === 1 ? 'medal-gold' : rank === 2 ? 'medal-silver' : 'medal-bronze'}`}>
                                                {medalEmoji}
                                            </div>

                                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.username || 'User'} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium truncate ${isCurrentUser ? 'text-grass-dark font-bold' : ''}`}>
                                                    {user.username || 'Anónimo'}
                                                </p>
                                                <StatsBadges plenos={user.plenos} ganadores={user.ganadores_acertados} />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <TrendIndicator trend={user.trend} />
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">{user.puntos_totales.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">pts</p>
                                                </div>
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
