'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Swords } from 'lucide-react';
import { Card } from './ui/card';
import {
    getAllGroupMatches,
    getTeamByCode,
    getFlagUrl,
    GROUPS
} from '@/lib/worldCupData';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
};

export function UpcomingMatches() {
    // Get first 6 matches from the groups (sample of upcoming matches)
    const upcomingMatches = useMemo(() => {
        const allMatches = getAllGroupMatches();
        // Get first 2 matches from first 3 groups
        return allMatches.slice(0, 6);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-mexico/15 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-mexico" />
                    </div>
                    <h2 className="text-lg font-bold">Próximos Partidos</h2>
                </div>
                <Link
                    href="/prode"
                    className="flex items-center gap-1 text-sm text-gold hover:text-gold/80 transition-colors font-medium"
                >
                    Ver todos
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-2"
            >
                {upcomingMatches.map((match, index) => {
                    const homeTeam = getTeamByCode(match.homeTeam);
                    const awayTeam = getTeamByCode(match.awayTeam);

                    if (!homeTeam || !awayTeam) return null;

                    return (
                        <motion.div key={match.id} variants={itemVariants}>
                            <Link href="/prode">
                                <Card className="p-3 glass-card hover:border-gold/30 transition-all duration-300 cursor-pointer border-mexico/20 group">
                                    <div className="flex items-center justify-between">
                                        {/* Home Team */}
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <img
                                                src={getFlagUrl(homeTeam.code, 40)}
                                                alt={homeTeam.name}
                                                className="w-7 h-5 object-cover rounded shadow-sm"
                                                loading="lazy"
                                            />
                                            <span className="text-sm font-medium truncate">
                                                {homeTeam.name}
                                            </span>
                                        </div>

                                        {/* VS Badge */}
                                        <div className="px-3 flex flex-col items-center">
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
                                                Grupo {match.group}
                                            </span>
                                            <span className="text-xs font-bold text-gold group-hover:scale-110 transition-transform">
                                                VS
                                            </span>
                                        </div>

                                        {/* Away Team */}
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                                            <span className="text-sm font-medium truncate text-right">
                                                {awayTeam.name}
                                            </span>
                                            <img
                                                src={getFlagUrl(awayTeam.code, 40)}
                                                alt={awayTeam.name}
                                                className="w-7 h-5 object-cover rounded shadow-sm"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* CTA to see all matches */}
            <Link href="/prode">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full p-3 rounded-xl bg-linear-to-r from-gold/10 via-gold/15 to-gold/10 border border-gold/30 text-center cursor-pointer hover:shadow-lg hover:shadow-gold/10 transition-all duration-300"
                >
                    <span className="text-sm font-semibold text-gold flex items-center justify-center gap-2">
                        <Swords className="w-4 h-4" />
                        Simular todos los grupos
                        <ChevronRight className="w-4 h-4" />
                    </span>
                </motion.div>
            </Link>
        </div>
    );
}
