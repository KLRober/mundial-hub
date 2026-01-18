'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw } from 'lucide-react';
import { GroupTabs } from '@/components/GroupTabs';
import { GroupBlock } from '@/components/GroupBlock';
import { FloatingSaveButton } from '@/components/FloatingSaveButton';
import { supabase } from '@/lib/supabase';
import { getUserPredictions, savePredictions } from '@/services/predictions';
import type { GroupPredictions } from '@/types/groupStandings';

export default function ProdePage() {
    const [activeGroup, setActiveGroup] = useState('A');
    const [allPredictions, setAllPredictions] = useState<GroupPredictions>({});
    const [savedPredictions, setSavedPredictions] = useState<GroupPredictions>({});
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Check for unsaved changes
    const hasUnsavedChanges = JSON.stringify(allPredictions) !== JSON.stringify(savedPredictions);

    // Load user and their predictions
    useEffect(() => {
        async function loadUserAndPredictions() {
            setIsLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const predictions = await getUserPredictions(user.id);
                setAllPredictions(predictions);
                setSavedPredictions(predictions);
            }

            setIsLoading(false);
        }

        loadUserAndPredictions();
    }, []);

    // Handle prediction changes from GroupBlock
    const handlePredictionsChange = useCallback((groupPredictions: GroupPredictions) => {
        setAllPredictions(prev => ({
            ...prev,
            ...groupPredictions,
        }));
        setIsSaved(false);
    }, []);

    // Save all predictions
    const handleSave = async () => {
        if (!user) {
            alert('Debes iniciar sesión para guardar predicciones');
            return;
        }

        setIsSaving(true);
        const result = await savePredictions(user.id, allPredictions);
        setIsSaving(false);

        if (result.success) {
            setSavedPredictions({ ...allPredictions });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } else {
            alert('Error al guardar: ' + result.error);
        }
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
                <div className="px-4 py-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                                <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Simulador de Grupos</h1>
                                <p className="text-xs text-muted-foreground">Mundial 2026 • Fase de Grupos</p>
                            </div>
                        </div>
                        {isLoading && (
                            <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
                        )}
                    </motion.div>
                </div>
            </header>

            {/* Group Navigation Tabs */}
            <GroupTabs activeGroup={activeGroup} onSelect={setActiveGroup} />

            {/* Main Content */}
            <main className="px-4 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                            <p className="text-muted-foreground">Cargando predicciones...</p>
                        </div>
                    </div>
                ) : (
                    <GroupBlock
                        key={activeGroup}
                        group={activeGroup}
                        initialPredictions={allPredictions}
                        onPredictionsChange={handlePredictionsChange}
                    />
                )}

                {/* Login prompt if not authenticated */}
                {!isLoading && !user && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center"
                    >
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Inicia sesión para guardar tus predicciones y competir en el ranking.
                        </p>
                    </motion.div>
                )}
            </main>

            {/* Floating Save Button */}
            {user && (
                <FloatingSaveButton
                    hasChanges={hasUnsavedChanges}
                    onSave={handleSave}
                    isSaving={isSaving}
                    isSaved={isSaved}
                />
            )}
        </div>
    );
}
