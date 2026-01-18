'use client';

import { motion } from 'framer-motion';

export function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Group Header Skeleton */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                <div className="space-y-2">
                    <div className="w-24 h-5 bg-muted rounded animate-pulse" />
                    <div className="w-48 h-3 bg-muted/50 rounded animate-pulse" />
                </div>
            </div>

            {/* Matchday Skeletons */}
            {[1, 2, 3].map((matchday) => (
                <div key={matchday} className="space-y-2">
                    <div className="w-20 h-3 bg-muted/50 rounded animate-pulse mb-2" />

                    {/* Match Card Skeletons */}
                    {[1, 2].map((match) => (
                        <motion.div
                            key={match}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (matchday * 2 + match) * 0.05 }}
                            className="p-3 rounded-xl border border-border/50 bg-card/50"
                        >
                            <div className="flex items-center justify-between gap-2">
                                {/* Home Team Skeleton */}
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-8 h-6 bg-muted rounded animate-pulse" />
                                    <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                                </div>

                                {/* Score Inputs Skeleton */}
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-muted/70 rounded-lg animate-pulse" />
                                    <div className="w-2 h-4 bg-muted/50 rounded animate-pulse" />
                                    <div className="w-10 h-10 bg-muted/70 rounded-lg animate-pulse" />
                                </div>

                                {/* Away Team Skeleton */}
                                <div className="flex items-center gap-2 flex-1 justify-end">
                                    <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                                    <div className="w-8 h-6 bg-muted rounded animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ))}

            {/* Standings Table Skeleton */}
            <div className="mt-6 space-y-3">
                <div className="w-32 h-4 bg-muted rounded animate-pulse" />

                <div className="rounded-xl border border-border/50 overflow-hidden">
                    {/* Table Header */}
                    <div className="h-8 bg-muted/30 animate-pulse" />

                    {/* Table Rows */}
                    {[1, 2, 3, 4].map((row) => (
                        <div
                            key={row}
                            className="h-10 border-t border-border/30 flex items-center px-3 gap-2"
                        >
                            <div className="w-6 h-4 bg-muted/50 rounded animate-pulse" />
                            <div className="w-5 h-3.5 bg-muted/50 rounded animate-pulse" />
                            <div className="flex-1 h-4 bg-muted/50 rounded animate-pulse max-w-[100px]" />
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                                    <div key={col} className="w-6 h-4 bg-muted/30 rounded animate-pulse" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
