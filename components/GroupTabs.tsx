'use client';

import { motion } from 'framer-motion';
import { GROUPS } from '@/lib/worldCupData';

interface GroupTabsProps {
    activeGroup: string;
    onSelect: (group: string) => void;
}

export function GroupTabs({ activeGroup, onSelect }: GroupTabsProps) {
    return (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
            <div className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide">
                {GROUPS.map(group => {
                    const isActive = activeGroup === group;

                    return (
                        <button
                            key={group}
                            onClick={() => onSelect(group)}
                            className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${isActive
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }
              `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeGroupTab"
                                    className="absolute inset-0 bg-primary rounded-xl"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">Grupo {group}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
