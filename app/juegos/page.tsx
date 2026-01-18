'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Ghost, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function JuegosPage() {
    return (
        <div className="min-h-screen p-4 pb-24">
            <h1 className="text-xl font-bold mb-6 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                Minijuegos
            </h1>

            <div className="grid gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Link href="/juegos/impostor">
                        <Card className="p-6 overflow-hidden relative cursor-pointer hover:border-primary/50 transition-colors group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Ghost className="h-24 w-24 text-primary" />
                            </div>
                            <div className="relative z-10">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                    <Ghost className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">El Impostor</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Encuentra al jugador que no pertenece al equipo antes de que se acabe el tiempo.
                                </p>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                                    Jugar Ahora
                                </Button>
                            </div>
                        </Card>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="p-6 overflow-hidden relative cursor-pointer hover:border-secondary/50 transition-colors group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="h-24 w-24 text-secondary" />
                        </div>
                        <div className="relative z-10">
                            <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary-foreground">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Adivina el Jugador</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Descubre quién es el jugador oculto a través de pistas y estadísticas.
                            </p>
                            <Button variant="outline" className="w-full border-secondary text-secondary-foreground hover:bg-secondary/10">
                                Próximamente
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
