'use client';

import { motion } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';
import { MatchCard } from './MatchCard';
import { useMatches } from '@/hooks/useMatches';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export function MatchFeed() {
    const { matches, isLoading, refresh } = useMatches();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Partidos de Hoy</h2>
                    </div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-32 rounded-xl bg-muted/50 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Partidos de Hoy</h2>
                </div>
                <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => refresh()}
                    className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                </motion.button>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3"
            >
                {matches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No hay partidos programados para hoy
                    </div>
                ) : (
                    matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))
                )}
            </motion.div>
        </div>
    );
}
