'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCcw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAUpdater() {
    const [offline, setOffline] = useState(false);
    const [needsUpdate, setNeedsUpdate] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
            const wb = (window as any).workbox;

            wb.addEventListener('waiting', () => {
                setNeedsUpdate(true);
            });

            wb.register();
        }

        // Offline checking
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const reloadPage = () => {
        if (needsUpdate) {
            window.location.reload();
        }
    };

    return (
        <AnimatePresence>
            {/* Offline Banner */}
            {offline && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-20 left-4 right-4 z-50 flex justify-center"
                >
                    <Card className="px-4 py-2 bg-destructive text-destructive-foreground border-none shadow-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-sm font-medium">Sin conexión - Modo Offline</span>
                    </Card>
                </motion.div>
            )}

            {/* Update Toast */}
            {needsUpdate && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-4 left-4 right-4 z-100 flex justify-center"
                >
                    <Card className="p-3 shadow-xl border-primary/20 bg-background/95 backdrop-blur-md flex items-center justify-between gap-4 max-w-sm w-full ring-1 ring-primary/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <Download className="w-4 h-4" />
                            </div>
                            <div className="text-sm">
                                <p className="font-bold">Nueva versión disponible</p>
                                <p className="text-muted-foreground text-xs">Actualiza para ver los cambios.</p>
                            </div>
                        </div>
                        <Button size="sm" onClick={reloadPage} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                            <RefreshCcw className="w-3 h-3 mr-1.5" />
                            Actualizar
                        </Button>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
