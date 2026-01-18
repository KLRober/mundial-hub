import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Save, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '@/lib/supabase';
import type { Match } from '@/types/database';

interface MatchCardProps {
    match: Match;
    onClick?: () => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';
    const [predLocal, setPredLocal] = useState('');
    const [predVisitante, setPredVisitante] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasPredicted, setHasPredicted] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check current user
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            if (data.user) {
                checkExistingPrediction(data.user.id);
            }
        });
    }, [match.id]);

    const checkExistingPrediction = async (userId: string) => {
        const { data } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', userId)
            .eq('match_id', match.id)
            .single();

        if (data) {
            setPredLocal(data.pred_local);
            setPredVisitante(data.pred_visitante);
            setHasPredicted(true);
        }
    };

    const handleSavePrediction = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click

        if (!user) {
            alert('Debes iniciar sesión para guardar predicciones');
            return;
        }

        if (predLocal === '' || predVisitante === '') return;

        setIsSaving(true);
        const { error } = await supabase
            .from('predictions')
            .upsert({
                user_id: user.id,
                match_id: match.id,
                pred_local: parseInt(predLocal),
                pred_visitante: parseInt(predVisitante)
            }, { onConflict: 'user_id,match_id' });

        setIsSaving(false);
        if (error) {
            console.error('Error saving prediction:', error);
            alert('Error al guardar predicción');
        } else {
            setHasPredicted(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={`relative overflow-hidden p-4 transition-all duration-300 ${isLive
                    ? 'bg-linear-to-br from-red-500/10 via-orange-500/5 to-transparent border-red-500/30'
                    : 'bg-linear-to-br from-primary/5 via-transparent to-secondary/5 hover:from-primary/10 hover:to-secondary/10'
                    }`}
            >
                {/* Live indicator */}
                {isLive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                            En Vivo
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2" onClick={onClick}>
                    {/* Home team */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-3xl">{match.home_team.flag_url || '🏳️'}</div>
                        <p className="text-sm font-medium text-center leading-tight">
                            {match.home_team.name}
                        </p>
                        {!isFinished && !isLive && (
                            <Input
                                type="number"
                                className="w-12 h-8 text-center"
                                placeholder="-"
                                value={predLocal}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPredLocal(e.target.value)}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            />
                        )}
                    </div>

                    {/* Score/Time/Action */}
                    <div className="flex flex-col items-center min-w-[80px] gap-1">
                        {isFinished || isLive ? (
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl font-bold">{match.home_score ?? 0}</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="text-2xl font-bold">{match.away_score ?? 0}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center mb-2">
                                <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                                <span className="text-xs font-semibold text-primary">
                                    {match.match_time}
                                </span>
                            </div>
                        )}

                        {!isFinished && (
                            <Button
                                size="sm"
                                className={`h-7 text-xs px-3 ${hasPredicted ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                onClick={handleSavePrediction}
                                disabled={isSaving || (predLocal === '' || predVisitante === '')}
                            >
                                {isSaving ? '...' : hasPredicted ? 'Guardado' : 'Predecir'}
                            </Button>
                        )}
                    </div>

                    {/* Away team */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-3xl">{match.away_team.flag_url || '🏳️'}</div>
                        <p className="text-sm font-medium text-center leading-tight">
                            {match.away_team.name}
                        </p>
                        {!isFinished && !isLive && (
                            <Input
                                type="number"
                                className="w-12 h-8 text-center"
                                placeholder="-"
                                value={predVisitante}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPredVisitante(e.target.value)}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            />
                        )}
                    </div>
                </div>

                {/* Venue */}
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{match.city}</span>
                </div>
            </Card>
        </motion.div>
    );
}
