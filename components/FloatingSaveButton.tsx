'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Goal } from 'lucide-react';

interface FloatingSaveButtonProps {
    hasChanges: boolean;
    onSave: () => void;
    isSaving: boolean;
    isSaved?: boolean;
}

export function FloatingSaveButton({
    hasChanges,
    onSave,
    isSaving,
    isSaved = false
}: FloatingSaveButtonProps) {
    return (
        <AnimatePresence>
            {(hasChanges || isSaving || isSaved) && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed bottom-20 right-4 z-999"
                >
                    <button
                        onClick={onSave}
                        disabled={isSaving || isSaved}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold shadow-lg 
                       transition-all duration-300 
                       ${isSaved
                                ? 'bg-mexico text-white shadow-mexico/40'
                                : 'bg-linear-to-r from-gold to-gold text-gold-dark shadow-gold/40 hover:shadow-gold/60 hover:scale-105 gold-glow'
                            }
                       disabled:cursor-not-allowed`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : isSaved ? (
                            <>
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                >
                                    <Check className="w-5 h-5" />
                                </motion.div>
                                <span>¡Gooool!</span>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    animate={{
                                        rotate: [0, -10, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 2
                                    }}
                                >
                                    <Goal className="w-5 h-5" />
                                </motion.div>
                                <span>Guardar Predicciones</span>
                            </>
                        )}
                    </button>

                    {/* Celebration particles on save */}
                    {isSaved && (
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-gold"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                    }}
                                    initial={{ x: 0, y: 0, scale: 1 }}
                                    animate={{
                                        x: Math.cos((i * Math.PI * 2) / 8) * 60,
                                        y: Math.sin((i * Math.PI * 2) / 8) * 60,
                                        scale: 0,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
