'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, Check } from 'lucide-react';

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
                    className="fixed bottom-20 right-4 z-50"
                >
                    <button
                        onClick={onSave}
                        disabled={isSaving || isSaved}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium shadow-lg 
                       transition-all duration-200 
                       ${isSaved
                                ? 'bg-green-500 text-white shadow-green-500/25'
                                : 'bg-primary text-primary-foreground shadow-primary/25 hover:shadow-primary/40 hover:scale-105'
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
                                <Check className="w-5 h-5" />
                                <span>¡Guardado!</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Guardar Predicciones</span>
                            </>
                        )}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
