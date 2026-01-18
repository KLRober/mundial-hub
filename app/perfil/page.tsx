'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Trophy, Star, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ points: 0, rank: 0, hits: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setStats({
                    points: data.puntos_totales || 0,
                    rank: 0, // Need calc logic or backend trigger
                    hits: 0 // Need calc logic
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/perfil`,
            },
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setStats({ points: 0, rank: 0, hits: 0 });
    };

    if (loading) {
        return <div className="min-h-screen p-4 flex items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen p-4 pb-24">
            <h1 className="text-xl font-bold mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mi Perfil
            </h1>

            {!user ? (
                <Card className="p-8 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-2">Inicia Sesión</h2>
                        <p className="text-muted-foreground text-sm">
                            Guarda tus predicciones, suma puntos y compite en el ranking global.
                        </p>
                    </div>
                    <Button
                        onClick={handleLogin}
                        className="w-full max-w-xs bg-white text-black hover:bg-gray-100 border border-gray-200"
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.-.19-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 4.6c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continuar con Google
                    </Button>
                </Card>
            ) : (
                <>
                    <Card className="p-6 mb-6 bg-linear-to-br from-card to-muted/20">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary via-secondary to-accent p-1 mb-4">
                                <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt={user.user_metadata.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                            <h2 className="text-xl font-bold">{user.user_metadata?.full_name || 'Usuario'}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>

                            <div className="grid grid-cols-3 gap-4 w-full mt-6">
                                <div className="flex flex-col items-center p-3 rounded-xl bg-background/50">
                                    <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
                                    <span className="font-bold">{stats.points}</span>
                                    <span className="text-[10px] text-muted-foreground text-center">Puntos</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-xl bg-background/50">
                                    <Star className="h-5 w-5 text-primary mb-1" />
                                    <span className="font-bold">#{stats.rank || '-'}</span>
                                    <span className="text-[10px] text-muted-foreground text-center">Rango</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-xl bg-background/50">
                                    <Shield className="h-5 w-5 text-secondary mb-1" />
                                    <span className="font-bold">{stats.hits}</span>
                                    <span className="text-[10px] text-muted-foreground text-center">Aciertos</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                    </Button>
                </>
            )}
        </div>
    );
}
