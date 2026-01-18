'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Goal, Check, Save } from 'lucide-react';

interface FloatingSaveButtonProps {
    hasChanges: boolean;
    isSaving: boolean;
    isSaved: boolean;
    onSave: () => void;
}

export function FloatingSaveButton({
    hasChanges,
    isSaving,
    isSaved,
    onSave,
}: FloatingSaveButtonProps) {
    const isVisible = hasChanges || isSaving || isSaved;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
                >
                    <motion.button
                        whileHover={!isSaving && !isSaved ? { scale: 1.05 } : undefined}
                        whileTap={!isSaving && !isSaved ? { scale: 0.95 } : undefined}
                        onClick={onSave}
                        disabled={isSaving || isSaved}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold shadow-lg 
                       transition-all duration-300 
                       ${isSaved
                                ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                                : 'bg-emerald-600 text-white shadow-emerald-600/40 hover:shadow-emerald-600/60 hover:bg-emerald-700'
                            }
                       disabled:cursor-not-allowed`}
                    >
                        <AnimatePresence mode="wait">
                            {isSaving ? (
                                <motion.div
                                    key="saving"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                                />
                            ) : isSaved ? (
                                <motion.div
                                    key="saved"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Check className="w-5 h-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="goal"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Save className="w-5 h-5" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <span>
                            {isSaving ? 'Guardando...' : isSaved ? '¡Guardado!' : 'Guardar'}
                        </span>
                    </motion.button>

                    {/* Success particles */}
                    {isSaved && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-emerald-500"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                    }}
                                    initial={{
                                        x: 0,
                                        y: 0,
                                        opacity: 1,
                                    }}
                                    animate={{
                                        x: Math.cos((i * 60 * Math.PI) / 180) * 50,
                                        y: Math.sin((i * 60 * Math.PI) / 180) * 50,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: 'easeOut',
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
