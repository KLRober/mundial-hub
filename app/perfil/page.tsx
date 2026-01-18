'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Trophy, Star, Shield, LogOut, Mail, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PerfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ points: 0, rank: 0, hits: 0 });
    const [loading, setLoading] = useState(true);

    // Email login state
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    // Demo mode state
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        // Check for demo mode in localStorage
        const demoUser = localStorage.getItem('mundial-hub-demo-user');
        if (demoUser) {
            setIsDemo(true);
            setUser(JSON.parse(demoUser));
            setStats({ points: parseInt(localStorage.getItem('mundial-hub-demo-points') || '0'), rank: 0, hits: 0 });
            setLoading(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                // Redirect to ranking after login
                if (window.location.search.includes('redirected=true')) {
                    router.push('/ranking');
                }
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                // Redirect to ranking after successful login
                if (event === 'SIGNED_IN') {
                    router.push('/ranking');
                }
            } else {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

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
                    rank: 0,
                    hits: 0
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async () => {
        if (!email || !email.includes('@')) {
            setEmailError('Ingresa un email válido');
            return;
        }

        setEmailLoading(true);
        setEmailError('');

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/perfil?redirected=true`,
            },
        });

        setEmailLoading(false);

        if (error) {
            setEmailError(error.message);
        } else {
            setEmailSent(true);
        }
    };

    const handleDemoMode = () => {
        const demoUser = {
            id: 'demo-user-' + Date.now(),
            email: 'demo@mundialhub.local',
            user_metadata: {
                full_name: 'Jugador Demo',
                avatar_url: null
            }
        };

        localStorage.setItem('mundial-hub-demo-user', JSON.stringify(demoUser));
        localStorage.setItem('mundial-hub-demo-points', '0');
        setUser(demoUser);
        setIsDemo(true);
        setStats({ points: 0, rank: 0, hits: 0 });
    };

    const handleLogout = async () => {
        if (isDemo) {
            localStorage.removeItem('mundial-hub-demo-user');
            localStorage.removeItem('mundial-hub-demo-points');
            setIsDemo(false);
            setUser(null);
            setStats({ points: 0, rank: 0, hits: 0 });
        } else {
            await supabase.auth.signOut();
            setStats({ points: 0, rank: 0, hits: 0 });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 pb-24">
            <h1 className="text-xl font-bold mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mi Perfil
            </h1>

            {!user ? (
                <div className="space-y-4">
                    {/* Main login card */}
                    <Card className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-1">Inicia Sesión</h2>
                                <p className="text-muted-foreground text-sm">
                                    Guarda tus puntos y compite en el ranking global.
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {emailSent ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
                                >
                                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="font-medium text-green-600">¡Link enviado!</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Revisa tu bandeja de entrada en <strong>{email}</strong>
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => { setEmailSent(false); setEmail(''); }}
                                    >
                                        Usar otro email
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-6 space-y-4"
                                >
                                    {/* Email input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="email"
                                                placeholder="tu@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={handleEmailLogin}
                                                disabled={emailLoading}
                                                className="shrink-0"
                                            >
                                                {emailLoading ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Mail className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        {emailError && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {emailError}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Te enviaremos un link mágico para iniciar sesión sin contraseña.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Demo mode card */}
                    <Card className="p-4 border-dashed border-2 border-muted-foreground/30">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">Modo Invitado (Demo)</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    ¿No querés revisar el mail? Probá el juego en modo demo.
                                    Los puntos se guardan localmente.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={handleDemoMode}
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Entrar como Invitado
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <>
                    <Card className="p-6 mb-6 bg-linear-to-br from-card to-muted/20">
                        <div className="flex flex-col items-center text-center">
                            {/* Demo badge */}
                            {isDemo && (
                                <div className="mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Modo Demo
                                    </span>
                                </div>
                            )}

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

                    {/* Quick actions */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => router.push('/ranking')}
                        >
                            <Trophy className="h-4 w-4 mr-2" />
                            Ver Ranking Global
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            {isDemo ? 'Salir del Modo Demo' : 'Cerrar Sesión'}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
