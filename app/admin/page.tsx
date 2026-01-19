'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shield,
    Grid3X3,
    LogOut,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Crown,
    Users,
    Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAdminUser, isAdminEmail, type AdminUser } from '@/services/adminAuth';
import {
    processGroupMatchPoints,
    processPlayoffMatchPoints,
    resetMatchResult,
    getMatchResults
} from '@/services/adminPoints';
import { GROUPS, generateGroupMatches } from '@/lib/worldCupData';
import { generatePlayoffBracket } from '@/lib/playoffLogic';
import AdminMatchCard from '@/components/admin/AdminMatchCard';
import AdminPlayoffCard from '@/components/admin/AdminPlayoffCard';
import type { MatchResult } from '@/services/adminPoints';
import type { PlayoffRound } from '@/types/playoffTypes';

type Phase = 'groups' | 'playoffs';

export default function AdminPage() {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<Phase>('groups');
    const [activeGroup, setActiveGroup] = useState('A');
    const [processedMatches, setProcessedMatches] = useState<Map<string, MatchResult>>(new Map());
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load admin user and processed matches
    useEffect(() => {
        async function checkAdmin() {
            const user = await getAdminUser();
            if (!user) {
                router.push('/perfil');
                return;
            }
            setAdminUser(user);

            // Load processed matches
            const results = await getMatchResults();
            const resultsMap = new Map<string, MatchResult>();
            results.forEach(r => resultsMap.set(r.matchId, r));
            setProcessedMatches(resultsMap);

            setLoading(false);
        }
        checkAdmin();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!session?.user?.email || !isAdminEmail(session.user.email)) {
                router.push('/perfil');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // Get matches for current group
    const groupMatches = useMemo(() => {
        return generateGroupMatches(activeGroup);
    }, [activeGroup]);

    // Generate playoff bracket (empty predictions for admin view)
    const playoffBracket = useMemo(() => {
        return generatePlayoffBracket({});
    }, []);

    // Handle group match finalization
    const handleFinalizeGroupMatch = async (matchId: string, homeGoals: number, awayGoals: number) => {
        const result = await processGroupMatchPoints(matchId, homeGoals, awayGoals);

        if (result.success) {
            setProcessedMatches(prev => {
                const newMap = new Map(prev);
                newMap.set(matchId, {
                    matchId,
                    matchType: 'group',
                    homeGoals,
                    awayGoals
                });
                return newMap;
            });
            setSuccessMessage(`Partido finalizado. ${result.usersUpdated} usuarios actualizados.`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    // Handle playoff match finalization
    const handleFinalizePlayoffMatch = async (matchId: string, winnerCode: string) => {
        const result = await processPlayoffMatchPoints(matchId, winnerCode);

        if (result.success) {
            setProcessedMatches(prev => {
                const newMap = new Map(prev);
                newMap.set(matchId, {
                    matchId,
                    matchType: 'playoff',
                    winnerCode
                });
                return newMap;
            });
            setSuccessMessage(`Ganador confirmado. ${result.usersUpdated} usuarios con puntos.`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    // Handle reset match
    const handleResetMatch = async (matchId: string) => {
        const matchResult = processedMatches.get(matchId);
        if (!matchResult) return;

        const result = await resetMatchResult(matchId, matchResult.matchType);

        if (result.success) {
            setProcessedMatches(prev => {
                const newMap = new Map(prev);
                newMap.delete(matchId);
                return newMap;
            });
            setSuccessMessage('El partido ha sido restablecido y los puntos recalculados.');
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            alert(`Error al restablecer: ${result.error}`);
        }
    };

    const handleUpdatePassword = async () => {
        if (!confirm('¿Estás seguro de establecer la contraseña a "roberto"?')) return;

        const { error } = await supabase.auth.updateUser({
            password: 'roberto'
        });

        if (error) {
            alert('Error al actualizar contraseña: ' + error.message);
        } else {
            alert('Contraseña actualizada a "roberto" correctamente');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/perfil');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-grass mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/30">
                                <Shield className="w-5 h-5 text-gold" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Panel de Administración</h1>
                                <p className="text-xs text-gray-500">{adminUser?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {adminUser?.email === 'roberkarp@gmail.com' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUpdatePassword}
                                    className="text-xs text-gray-500 hover:text-grass border-gray-200"
                                    title="Establecer contraseña rápida"
                                >
                                    Set PWD
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="text-gray-500 hover:text-red-500 hover:border-red-200"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Phase Switcher */}
                    <div className="mt-4 flex p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setPhase('groups')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${phase === 'groups'
                                ? 'bg-grass text-white shadow-lg'
                                : 'text-gray-500 hover:text-grass'
                                }`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                            Fase de Grupos
                        </button>
                        <button
                            onClick={() => setPhase('playoffs')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${phase === 'playoffs'
                                ? 'bg-gold text-white shadow-lg'
                                : 'text-gray-500 hover:text-gold'
                                }`}
                        >
                            <Crown className="w-4 h-4" />
                            Eliminatorias
                        </button>
                    </div>
                </div>
                <div className="h-[2px] bg-linear-to-r from-grass via-gold to-grass" />
            </header>

            {/* Success Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {phase === 'groups' ? (
                        <motion.div
                            key="groups-admin"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Group Tabs */}
                            <div className="mb-6 overflow-x-auto scrollbar-hide">
                                <div className="flex gap-2 pb-2 min-w-max">
                                    {GROUPS.map(group => {
                                        const groupMatchIds = generateGroupMatches(group).map(m => m.id);
                                        const processedCount = groupMatchIds.filter(id => processedMatches.has(id)).length;
                                        const isComplete = processedCount === 6;

                                        return (
                                            <button
                                                key={group}
                                                onClick={() => setActiveGroup(group)}
                                                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeGroup === group
                                                    ? 'bg-grass text-white shadow-md'
                                                    : isComplete
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-grass'
                                                    }`}
                                            >
                                                Grupo {group}
                                                {processedCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-amber-500 text-white rounded-full flex items-center justify-center">
                                                        {processedCount}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Group Matches */}
                            <div className="space-y-3">
                                {groupMatches.map(match => {
                                    const result = processedMatches.get(match.id);
                                    return (
                                        <AdminMatchCard
                                            key={match.id}
                                            matchId={match.id}
                                            homeTeamCode={match.homeTeam}
                                            awayTeamCode={match.awayTeam}
                                            group={match.group}
                                            matchday={match.matchday}
                                            isProcessed={!!result}
                                            savedHomeGoals={result?.homeGoals}
                                            savedAwayGoals={result?.awayGoals}
                                            onFinalize={handleFinalizeGroupMatch}
                                            onReset={handleResetMatch}
                                        />
                                    );
                                })}
                            </div>

                            {/* Stats Card */}
                            <Card className="mt-6 p-4 bg-white border-gray-200">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gold" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            Partidos Finalizados: {Array.from(processedMatches.values()).filter(r => r.matchType === 'group').length} / 72
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Los puntos se actualizan automáticamente en los perfiles.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="playoffs-admin"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Info Card */}
                            <Card className="mb-6 p-4 bg-amber-50 border-gold/30">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-gold mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">
                                            Fase Eliminatoria
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            Los equipos se definen según los resultados reales de la fase de grupos.
                                            Ingresa los ganadores de cada partido a medida que se jueguen.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Playoff Rounds */}
                            {(['R32', 'R16', 'QF', 'SF', 'TP', 'F'] as PlayoffRound[]).map(round => {
                                const roundMatches = round === 'F'
                                    ? [playoffBracket.final]
                                    : round === 'TP'
                                        ? [playoffBracket.thirdPlace]
                                        : round === 'R32'
                                            ? playoffBracket.r32
                                            : round === 'R16'
                                                ? playoffBracket.r16
                                                : round === 'QF'
                                                    ? playoffBracket.qf
                                                    : playoffBracket.sf;

                                const roundNames: Record<PlayoffRound, string> = {
                                    'R32': 'Dieciseisavos de Final',
                                    'R16': 'Octavos de Final',
                                    'QF': 'Cuartos de Final',
                                    'SF': 'Semifinales',
                                    'TP': 'Tercer Puesto',
                                    'F': 'Final'
                                };

                                return (
                                    <div key={round} className="mb-8">
                                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                            <Crown className="w-5 h-5 text-gold" />
                                            {roundNames[round]}
                                        </h2>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {roundMatches.map(match => {
                                                const result = processedMatches.get(match.id);
                                                return (
                                                    <AdminPlayoffCard
                                                        key={match.id}
                                                        matchId={match.id}
                                                        round={round}
                                                        team1Code={match.team1?.team.code ?? null}
                                                        team2Code={match.team2?.team.code ?? null}
                                                        team1Label={match.team1?.originLabel}
                                                        team2Label={match.team2?.originLabel}
                                                        isProcessed={!!result}
                                                        savedWinner={result?.winnerCode}
                                                        onFinalize={handleFinalizePlayoffMatch}
                                                        onReset={handleResetMatch}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Playoff Stats */}
                            <Card className="mt-6 p-4 bg-white border-gray-200">
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-5 h-5 text-gold" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            Partidos Decididos: {Array.from(processedMatches.values()).filter(r => r.matchType === 'playoff').length} / 31
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            3 puntos por acierto de ganador en eliminatorias.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
