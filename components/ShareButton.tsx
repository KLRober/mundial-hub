'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, Check, Copy, Trophy, Target, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';

interface ShareButtonProps {
    username: string;
    rank: number;
    points: number;
    plenos: number;
    className?: string;
}

export function ShareButton({ username, rank, points, plenos, className = '' }: ShareButtonProps) {
    const [showCard, setShowCard] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const shareText = `🏆 ¡Mira mi posición en Mundialito 2026! ⚽

👤 Usuario: ${username}
📊 Puesto: #${rank}
🎯 Puntos: ${points} (${plenos} Plenos exactos)

¿Podés superarme? Armá tu predicción acá:
https://mundialito2026.vercel.app/`;

    const handleShare = useCallback(async () => {
        // Try Web Share API first (mobile native share)
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: 'Mundialito 2026 - Mi Ranking',
                    text: shareText,
                    url: 'https://mundialito2026.vercel.app/',
                });
                return;
            } catch (err) {
                // User cancelled or API failed, fall through to copy
                if ((err as Error).name === 'AbortError') return;
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Last resort fallback
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [shareText]);

    const handleDownloadImage = useCallback(async () => {
        if (!cardRef.current) return;

        setDownloading(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: '#f8f9fa',
            });

            // Download the image
            const link = document.createElement('a');
            link.download = `mundialito-${username.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error generating image:', err);
        } finally {
            setDownloading(false);
        }
    }, [username]);

    return (
        <>
            {/* Main Share Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCard(true)}
                className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    bg-white border-2 border-gold text-amber-700
                    font-bold shadow-lg shadow-gold/20
                    hover:bg-amber-50 transition-colors
                    ${className}
                `}
            >
                <Share2 className="w-5 h-5" />
                <span>Compartir mi Predicción</span>
            </motion.button>

            {/* Modal for Share Card */}
            <AnimatePresence>
                {showCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                        onClick={() => setShowCard(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm"
                        >
                            {/* Share Card (Story format for download) */}
                            <div
                                ref={cardRef}
                                className="bg-linear-to-br from-white via-amber-50 to-green-50 rounded-2xl p-6 shadow-2xl border border-gold/30"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <div className="p-2 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black bg-linear-to-r from-amber-600 to-green-600 bg-clip-text text-transparent">
                                            MUNDIALITO 2026
                                        </h2>
                                    </div>
                                </div>

                                {/* User Stats */}
                                <div className="text-center space-y-4">
                                    {/* User Avatar Placeholder */}
                                    <div className="relative mx-auto w-20 h-20">
                                        <div className="w-full h-full rounded-full bg-linear-to-br from-amber-400 to-green-500 p-1">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                                <span className="text-3xl">👤</span>
                                            </div>
                                        </div>
                                        {rank === 1 && (
                                            <Crown className="absolute -top-3 -right-1 w-8 h-8 text-amber-500 crown-animated" fill="#f5d742" />
                                        )}
                                    </div>

                                    {/* Username */}
                                    <p className="text-xl font-bold text-gray-800">{username}</p>

                                    {/* Rank Badge */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-amber-100 to-amber-200 border border-amber-300">
                                        <span className="text-sm font-medium text-amber-700">PUESTO</span>
                                        <span className="text-2xl font-black text-amber-600">#{rank}</span>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <div className="p-3 rounded-xl bg-white/80 border border-green-200">
                                            <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                            <p className="text-2xl font-black text-gray-800">{points}</p>
                                            <p className="text-xs text-gray-500">Puntos</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-white/80 border border-green-200">
                                            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                            <p className="text-2xl font-black text-gray-800">{plenos}</p>
                                            <p className="text-xs text-gray-500">Plenos Exactos</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                                    <p className="text-sm text-gray-500">¿Podés superarme? ⚽</p>
                                    <p className="text-xs font-medium text-green-600 mt-1">mundialito2026.vercel.app</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                                <Button
                                    onClick={handleShare}
                                    className="flex-1 bg-white border-2 border-gold text-amber-700 hover:bg-amber-50 font-bold"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            ¡Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copiar Texto
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleDownloadImage}
                                    disabled={downloading}
                                    className="flex-1 bg-linear-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 font-bold"
                                >
                                    {downloading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Descargar
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Close hint */}
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Toca afuera para cerrar
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
