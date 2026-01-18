'use client';

import { motion } from 'framer-motion';
import { Trophy, Gamepad2, TrendingUp } from 'lucide-react';
import { MatchFeed } from '@/components/MatchFeed';
import { Leaderboard } from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Mundial Hub
              </h1>
              <p className="text-xs text-muted-foreground">2026 Edition</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="relative">
                <Trophy className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-6"
      >
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/20 via-secondary/15 to-accent/10 p-6 border border-primary/30">
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />

          <div className="relative">
            <h2 className="text-lg font-semibold mb-2">¡Bienvenido al Prode!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Predice los resultados y compite con tus amigos por premios exclusivos.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                Hacer Predicción
              </Button>
              <Button size="sm" variant="outline">
                <Gamepad2 className="h-4 w-4 mr-1.5" />
                Minijuegos
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Match Feed */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 pb-6"
      >
        <MatchFeed />
      </motion.section>

      {/* Leaderboard */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 pb-6"
      >
        <Leaderboard />
      </motion.section>


    </div>
  );
}
