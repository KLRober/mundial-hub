'use client';

import { motion } from 'framer-motion';
import { GROUPS } from '@/lib/worldCupData';

interface GroupTabsProps {
    activeGroup: string;
    onSelect: (group: string) => void;
}

export function GroupTabs({ activeGroup, onSelect }: GroupTabsProps) {
    return (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
            <div className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide">
                {GROUPS.map(group => {
                    const isActive = activeGroup === group;

                    return (
                        <button
                            key={group}
                            onClick={() => onSelect(group)}
                            className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap
                ${isActive
                                    ? 'text-gold-dark'
                                    : 'text-muted-foreground hover:text-gold hover:bg-gold/10'
                                }
              `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeGroupTab"
                                    className="absolute inset-0 bg-linear-to-r from-gold to-gold rounded-xl shadow-lg shadow-gold/25"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1">
                                <span className="text-[10px] opacity-70">Grupo</span>
                                <span className="text-base font-bold">{group}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
            {/* Subtle bottom border */}
            <div className="h-[1px] bg-linear-to-r from-transparent via-mexico/30 to-transparent" />
        </div>
    );
}
