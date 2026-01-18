'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, EyeOff, Timer, ArrowRight, RotateCcw, PartyPopper, AlertTriangle, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { getRandomWord } from '@/lib/impostorData';
import { supabase } from '@/lib/supabase';
import { addGamePoints } from '@/services/gamePoints';

type GameState = 'SETUP' | 'REVEAL' | 'DISCUSSION' | 'VOTING' | 'RESULT';

export default function ImpostorGame() {
    const [gameState, setGameState] = useState<GameState>('SETUP');
    const [playerCount, setPlayerCount] = useState(3);
    const [impostorIndex, setImpostorIndex] = useState(0);
    const [currentWord, setCurrentWord] = useState('');
    const [category, setCategory] = useState('');
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [votedPlayer, setVotedPlayer] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pointsEarned, setPointsEarned] = useState<number | null>(null);

    // Check if user is authenticated
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsLoggedIn(!!user);
        });
    }, []);

    const startGame = () => {
        const { word, category } = getRandomWord();
        setCurrentWord(word);
        setCategory(category);
        setImpostorIndex(Math.floor(Math.random() * playerCount));
        setCurrentPlayer(0);
        setGameState('REVEAL');
    };

    const nextPlayer = () => {
        if (currentPlayer < playerCount - 1) {
            setCurrentPlayer(prev => prev + 1);
        } else {
            setTimeLeft(60);
            setGameState('DISCUSSION');
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'DISCUSSION' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState, timeLeft]);

    const handleVote = (playerIndex: number) => {
        setVotedPlayer(playerIndex);
        setPointsEarned(null); // Reset points before showing result
        setGameState('RESULT');
    };

    // Award points when game ends with a win and user is logged in
    useEffect(() => {
        const awardPoints = async () => {
            if (gameState === 'RESULT' && votedPlayer === impostorIndex && isLoggedIn) {
                const POINTS_FOR_WIN = 10;
                const success = await addGamePoints(POINTS_FOR_WIN);
                if (success) {
                    setPointsEarned(POINTS_FOR_WIN);
                }
            }
        };
        awardPoints();
    }, [gameState, votedPlayer, impostorIndex, isLoggedIn]);

    const resetGame = () => {
        setGameState('SETUP');
        setVotedPlayer(null);
        setPointsEarned(null);
    };

    return (
        <div className="min-h-screen p-6 pb-24 flex flex-col items-center justify-center max-w-md mx-auto">
            <AnimatePresence mode="wait">

                {/* SETUP SCREEN */}
                {gameState === 'SETUP' && (
                    <motion.div
                        key="setup"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full space-y-8 text-center"
                    >
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">EL IMPOSTOR</h1>
                            <p className="text-muted-foreground">Encuentra al infiltrado antes que sea tarde</p>
                        </div>

                        <Card className="p-6 space-y-6 border-primary/20 bg-background/50 backdrop-blur-sm">
                            <div className="space-y-4">
                                <label className="text-sm font-medium">¿Cuántos juegan?</label>
                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPlayerCount(Math.max(3, playerCount - 1))}
                                    >
                                        -
                                    </Button>
                                    <span className="text-3xl font-bold w-12">{playerCount}</span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setPlayerCount(Math.min(10, playerCount + 1))}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>

                            <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" onClick={startGame}>
                                Comenzar Partida
                            </Button>
                        </Card>
                    </motion.div>
                )}

                {/* REVEAL SCREEN */}
                {gameState === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="w-full text-center space-y-8"
                    >
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Jugador {currentPlayer + 1}</h2>
                            <p className="text-muted-foreground text-sm">Pasa el celular al Jugador {currentPlayer + 1}</p>
                        </div>

                        <div className="relative h-64 w-full perspective-1000">
                            <Button
                                className="w-full h-full rounded-2xl text-2xl font-bold transition-all duration-300 transform active:scale-95 touch-none select-none flex flex-col gap-4"
                                variant={isRevealing ? (currentPlayer === impostorIndex ? "destructive" : "default") : "outline"}
                                onPointerDown={() => setIsRevealing(true)}
                                onPointerUp={() => setIsRevealing(false)}
                                onTouchStart={() => setIsRevealing(true)}
                                onTouchEnd={() => setIsRevealing(false)}
                            >
                                {isRevealing ? (
                                    currentPlayer === impostorIndex ? (
                                        <>
                                            <Users className="w-16 h-16" />
                                            <span>ERES EL<br />IMPOSTOR</span>
                                            <span className="text-sm font-normal opacity-80 mt-2">Engaña a todos</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-normal opacity-80 mb-2">La palabra es:</span>
                                            <span className="text-4xl">{currentWord}</span>
                                            <span className="text-xs font-normal opacity-60 mt-4">Categoría: {category}</span>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <Eye className="w-12 h-12 mb-2 opacity-50" />
                                        Mantén presionado<br />para ver tu rol
                                    </>
                                )}
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={nextPlayer}
                        >
                            {currentPlayer < playerCount - 1 ? 'Siguiente Jugador' : 'Comenzar Juego'} <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </motion.div>
                )}

                {/* DISCUSSION SCREEN */}
                {gameState === 'DISCUSSION' && (
                    <motion.div
                        key="discussion"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full text-center space-y-8"
                    >
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">¡A debatir!</h2>
                            <p className="text-muted-foreground">Descubran quién es el impostor haciendo preguntas.</p>
                        </div>

                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="relative">
                                <Timer className={`w-32 h-32 ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 text-lg bg-destructive hover:bg-destructive/90 text-white animate-in slide-in-from-bottom"
                            onClick={() => setGameState('VOTING')}
                        >
                            ¡Votar Ahora!
                        </Button>
                    </motion.div>
                )}

                {/* VOTING SCREEN */}
                {gameState === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-center">¿Quién es el impostor?</h2>

                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({ length: playerCount }).map((_, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    className="h-24 flex flex-col gap-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-colors"
                                    onClick={() => handleVote(i)}
                                >
                                    <Users className="w-8 h-8" />
                                    Jugador {i + 1}
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* RESULT SCREEN */}
                {gameState === 'RESULT' && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full text-center space-y-8"
                    >
                        <div className={`p-8 rounded-full inline-block ${votedPlayer === impostorIndex ? 'bg-green-100' : 'bg-red-100'}`}>
                            {votedPlayer === impostorIndex ? (
                                <PartyPopper className="w-16 h-16 text-green-600" />
                            ) : (
                                <AlertTriangle className="w-16 h-16 text-red-600" />
                            )}
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-black uppercase">
                                {votedPlayer === impostorIndex ? '¡Lo atraparon!' : '¡Ganó el Impostor!'}
                            </h2>

                            <Card className="p-6 bg-muted/30">
                                <p className="text-lg mb-2">El impostor era:</p>
                                <p className="text-2xl font-bold text-primary">Jugador {impostorIndex + 1}</p>
                                <div className="my-4 h-px bg-border/50" />
                                <p className="text-sm text-muted-foreground">La palabra secreta era:</p>
                                <p className="text-xl font-bold">{currentWord}</p>

                                {/* Points earned notification */}
                                {votedPlayer === impostorIndex && (
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        {pointsEarned ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-center gap-2 text-yellow-500"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                <span className="font-bold">+{pointsEarned} puntos</span>
                                                <Trophy className="w-5 h-5" />
                                            </motion.div>
                                        ) : isLoggedIn ? (
                                            <p className="text-sm text-muted-foreground animate-pulse">
                                                Sumando puntos...
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Inicia sesión para acumular puntos 🎮
                                            </p>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </div>

                        <Button size="lg" className="w-full" onClick={resetGame}>
                            <RotateCcw className="mr-2 w-4 h-4" /> Jugar Otra Vez
                        </Button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
