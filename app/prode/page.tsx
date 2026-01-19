'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, UserX, Cloud, CloudOff, Grid3X3, ArrowRight } from 'lucide-react';
import { GroupTabs } from '@/components/GroupTabs';
import { GroupBlock } from '@/components/GroupBlock';
import { PlayoffBracket } from '@/components/PlayoffBracket';
import { FloatingSaveButton } from '@/components/FloatingSaveButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { supabase } from '@/lib/supabase';
import { getUserPredictions, savePredictions } from '@/services/predictions';
import { getPlayoffPredictions, savePlayoffPredictions } from '@/services/playoffPredictions';
import {
    generatePlayoffBracket,
    applyPlayoffPredictions,
    getQualifiedTeamCodes,
    cleanInvalidPlayoffPredictions
} from '@/lib/playoffLogic';
import type { GroupPredictions } from '@/types/groupStandings';
import type { PlayoffPredictions } from '@/types/playoffTypes';

// Local storage keys
const LS_GROUP_PREDICTIONS = 'mundial-hub-predictions';
const LS_PLAYOFF_PREDICTIONS = 'mundial-hub-playoff-predictions';

type Phase = 'groups' | 'playoffs';

export default function ProdePage() {
    const [phase, setPhase] = useState<Phase>('groups');
    const [activeGroup, setActiveGroup] = useState('A');
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Group State
    const [groupPredictions, setGroupPredictions] = useState<GroupPredictions>({});
    const [savedGroupPredictions, setSavedGroupPredictions] = useState<GroupPredictions>({});

    // Playoff State
    const [playoffPredictions, setPlayoffPredictions] = useState<PlayoffPredictions>({});
    const [savedPlayoffPredictions, setSavedPlayoffPredictions] = useState<PlayoffPredictions>({});

    // Official Results
    const [matchResults, setMatchResults] = useState<Record<string, { homeGoals: number; awayGoals: number }>>({});

    // Save State
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Track previous qualified teams to detect changes (ghost team cleanup)
    const previousQualifiedRef = useRef<string>('');
    const isInitialLoadRef = useRef<boolean>(true);

    // Check for unsaved changes
    const hasUnsavedGroup = Object.keys(groupPredictions).length > 0 &&
        JSON.stringify(groupPredictions) !== JSON.stringify(savedGroupPredictions);

    const hasUnsavedPlayoff = Object.keys(playoffPredictions).length > 0 &&
        JSON.stringify(playoffPredictions) !== JSON.stringify(savedPlayoffPredictions);

    const hasUnsavedChanges = hasUnsavedGroup || hasUnsavedPlayoff;

    // Load initial data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Fetch Official Results (Public)
            const { data: results } = await supabase
                .from('match_results')
                .select('match_id, home_goals, away_goals')
                .eq('match_type', 'group')
                .eq('processed', true);

            if (results) {
                const resultsMap: Record<string, { homeGoals: number; awayGoals: number }> = {};
                results.forEach(r => {
                    if (r.home_goals !== null && r.away_goals !== null) {
                        resultsMap[r.match_id] = {
                            homeGoals: r.home_goals,
                            awayGoals: r.away_goals
                        };
                    }
                });
                setMatchResults(resultsMap);
            }

            if (user) {
                // Load from Supabase
                const groups = await getUserPredictions(user.id);
                const playoffs = await getPlayoffPredictions(user.id);

                setGroupPredictions(groups);
                setSavedGroupPredictions(groups);
                setPlayoffPredictions(playoffs);
                setSavedPlayoffPredictions(playoffs);
            } else {
                // Load from localStorage
                try {
                    const lsGroups = localStorage.getItem(LS_GROUP_PREDICTIONS);
                    const lsPlayoffs = localStorage.getItem(LS_PLAYOFF_PREDICTIONS);

                    if (lsGroups) {
                        const parsed = JSON.parse(lsGroups);
                        setGroupPredictions(parsed);
                        setSavedGroupPredictions(parsed);
                    }
                    if (lsPlayoffs) {
                        const parsed = JSON.parse(lsPlayoffs);
                        setPlayoffPredictions(parsed);
                        setSavedPlayoffPredictions(parsed);
                    }
                } catch (e) {
                    console.error('Error loading local data', e);
                }
            }
            setIsLoading(false);
            isInitialLoadRef.current = false;
        }
        loadData();

        // Subscribe to real-time changes for match_results
        const channel = supabase
            .channel('public:match_results')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'match_results'
                },
                (payload) => {
                    // Update matchResults state based on event
                    if (payload.eventType === 'DELETE') {
                        // Since we may not have the match_id in the old record (unless replica identity is full),
                        // and we key by match_id, the safest quick fix is to remove by finding the entry 
                        // OR just re-fetch. Given the low volume, re-fetching is safest to avoid stale state.
                        // However, let's try to remove if we have the ID, otherwise refetch.
                        const oldRecord = payload.old as any;

                        setMatchResults(prev => {
                            // If we have match_id, use it.
                            if (oldRecord.match_id) {
                                const newResults = { ...prev };
                                delete newResults[oldRecord.match_id];
                                return newResults;
                            }
                            return prev; // If no match_id, we can't optimistically update
                        });

                        // Fallback: Trigger a reload to be sure
                        loadData();
                    } else if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
                        const newRecord = payload.new as any;
                        setMatchResults(prev => {
                            const newResults = { ...prev };
                            if (newRecord.match_type === 'group' && newRecord.processed) {
                                newResults[newRecord.match_id] = {
                                    homeGoals: newRecord.home_goals,
                                    awayGoals: newRecord.away_goals
                                };
                            }
                            return newResults;
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Clean invalid playoff predictions when qualified teams change (ghost team cleanup)
    useEffect(() => {
        // Skip on initial load
        if (isInitialLoadRef.current || isLoading) return;

        // Get current qualified team codes
        const currentQualifiedCodes = getQualifiedTeamCodes(groupPredictions).join(',');

        // Check if qualified teams have changed
        if (previousQualifiedRef.current && previousQualifiedRef.current !== currentQualifiedCodes) {
            // Qualified teams changed - clean invalid playoff predictions
            const baseBracket = generatePlayoffBracket(groupPredictions);
            const cleanedPredictions = cleanInvalidPlayoffPredictions(playoffPredictions, baseBracket);

            // Only update if predictions actually changed
            if (JSON.stringify(cleanedPredictions) !== JSON.stringify(playoffPredictions)) {
                setPlayoffPredictions(cleanedPredictions);
            }
        }

        // Update ref for next comparison
        previousQualifiedRef.current = currentQualifiedCodes;
    }, [groupPredictions, playoffPredictions, isLoading]);

    // Handle Group Predictions
    const handleGroupPredictionChange = useCallback((matchId: string, home: number | null, away: number | null) => {
        setGroupPredictions(prev => {
            const newPreds = { ...prev };
            if (home === null && away === null) {
                delete newPreds[matchId];
            } else {
                newPreds[matchId] = { home: home ?? 0, away: away ?? 0 };
            }
            return newPreds;
        });
        setIsSaved(false);
    }, []);

    // Handle Playoff Winners
    const handlePlayoffWinner = useCallback((matchId: string, winnerCode: string) => {
        setPlayoffPredictions(prev => ({
            ...prev,
            [matchId]: winnerCode
        }));
        setIsSaved(false);
    }, []);

    // Generate Bracket dynamically
    const activeBracket = useMemo(() => {
        const baseBracket = generatePlayoffBracket(groupPredictions);
        return applyPlayoffPredictions(baseBracket, playoffPredictions);
    }, [groupPredictions, playoffPredictions]);

    // Save All
    const handleSave = async () => {
        setIsSaving(true);

        if (user) {
            const [groupRes, playoffRes] = await Promise.all([
                savePredictions(user.id, groupPredictions),
                savePlayoffPredictions(user.id, playoffPredictions)
            ]);

            if (groupRes.success && playoffRes.success) {
                setSavedGroupPredictions({ ...groupPredictions });
                setSavedPlayoffPredictions({ ...playoffPredictions });
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            } else {
                alert('Error al guardar');
            }
        } else {
            localStorage.setItem(LS_GROUP_PREDICTIONS, JSON.stringify(groupPredictions));
            localStorage.setItem(LS_PLAYOFF_PREDICTIONS, JSON.stringify(playoffPredictions));
            setSavedGroupPredictions({ ...groupPredictions });
            setSavedPlayoffPredictions({ ...playoffPredictions });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
        setIsSaving(false);
    };

    return (
        <div className="min-h-screen pb-24 bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-100">
                <div className="px-4 py-4 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Trophy className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Predicciones</h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    {/* Minimalist Flags */}
                                    <span className="inline-block w-4 h-2.5 rounded-sm overflow-hidden" style={{ background: 'linear-gradient(90deg, #006847 33%, white 33% 66%, #ce1126 66%)' }}></span>
                                    <span className="inline-block w-4 h-2.5 rounded-sm overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #b22234 0, #b22234 15%, white 15%, white 30%, #b22234 30%, #b22234 45%, white 45%, white 60%, #b22234 60%, #b22234 75%, white 75%, white 90%, #b22234 90%)' }}>
                                        <span className="absolute top-0 left-0 w-1.5 h-1 bg-[#3c3b6e]"></span>
                                    </span>
                                    <span className="inline-block w-4 h-2.5 rounded-sm overflow-hidden" style={{ background: 'linear-gradient(90deg, #ff0000 25%, white 25% 75%, #ff0000 75%)' }}></span>
                                    <span className="text-gray-400">2026</span>
                                </p>
                            </div>
                        </div>

                        {/* Sync Status */}
                        {!isLoading && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {user ? (
                                    <>
                                        <Cloud className="w-4 h-4 text-emerald-600" />
                                        <span className="hidden sm:inline">Sincronizado</span>
                                    </>
                                ) : (
                                    <>
                                        <CloudOff className="w-4 h-4 text-amber-500" />
                                        <span className="hidden sm:inline">Local</span>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Phase Switcher */}
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setPhase('groups')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${phase === 'groups'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                                : 'text-gray-500 hover:text-emerald-700'
                                }`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                            Fase de Grupos
                        </button>
                        <button
                            onClick={() => setPhase('playoffs')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${phase === 'playoffs'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                                : 'text-gray-500 hover:text-emerald-700'
                                }`}
                        >
                            <Trophy className="w-4 h-4" />
                            Eliminatorias
                        </button>
                    </div>
                </div>
                {/* Subtle gradient border */}
                <div className="h-[2px] bg-linear-to-r from-emerald-500 via-emerald-600 to-emerald-700 opacity-60" />
            </header>

            {/* Guest Warning */}
            <AnimatePresence>
                {!isLoading && !user && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 overflow-hidden"
                    >
                        <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                            <UserX className="w-5 h-5 text-yellow-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    <strong>Modo Invitado:</strong> Tus predicciones se guardan solo en este dispositivo.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="px-4 py-6">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <AnimatePresence mode="wait">
                        {phase === 'groups' ? (
                            <motion.div
                                key="groups"
                                initial={{ opacity: 0, x: -100, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -100, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="space-y-6"
                            >
                                <GroupTabs activeGroup={activeGroup} onSelect={setActiveGroup} />
                                <GroupBlock
                                    key={activeGroup}
                                    group={activeGroup}
                                    allPredictions={groupPredictions}
                                    onPredictionChange={handleGroupPredictionChange}
                                    matchResults={matchResults}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="playoffs"
                                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                                <div className="mb-6 p-4 rounded-xl glass-card border border-gold/30">
                                    <h3 className="text-sm font-semibold text-gold mb-1 flex items-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        Fase Eliminatoria
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Los cruces se calculan automáticamente según tus predicciones de la Fase de Grupos.
                                        ¡Haz clic en los equipos para avanzar de ronda!
                                    </p>
                                </div>

                                <PlayoffBracket
                                    bracket={activeBracket}
                                    onPredictionChange={handlePlayoffWinner}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            <FloatingSaveButton
                hasChanges={hasUnsavedChanges}
                onSave={handleSave}
                isSaving={isSaving}
                isSaved={isSaved}
            />
        </div>
    );
}
