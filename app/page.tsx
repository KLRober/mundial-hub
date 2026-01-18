'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, TrendingUp, Shirt } from 'lucide-react';
import { UpcomingMatches } from '@/components/UpcomingMatches';
import { Leaderboard } from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header with Host Country Gradient Border */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-extrabold title-gradient-animated">
                Mundial Hub
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-mexico"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-usa"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-canada"></span>
                2026 Edition
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/ranking">
                <Button size="sm" variant="ghost" className="relative group">
                  <Trophy className="h-5 w-5 text-gold group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-gold-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Host Country Gradient Border */}
        <div className="h-[3px] bg-linear-to-r from-mexico via-usa to-canada" />
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-6"
      >
        <div className="relative overflow-hidden rounded-2xl glass-card p-6 border border-mexico/30">
          {/* Decorative elements - Stadium lights effect */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-mexico/30 rounded-full blur-2xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-gold/10 rounded-full blur-3xl" />

          <div className="relative">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="text-gold">⚽</span>
              ¡Bienvenido al Prode!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Predice los resultados y compite con tus amigos por premios exclusivos.
            </p>
            <div className="flex gap-2">
              <Link href="/prode">
                <Button size="sm" className="bg-gold hover:bg-gold text-gold-dark font-semibold shadow-lg shadow-gold/25">
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Hacer Predicción
                </Button>
              </Link>
              <Link href="/juegos">
                <Button size="sm" variant="outline" className="border-mexico/50 hover:bg-mexico/10 hover:border-mexico">
                  <Gamepad2 className="h-4 w-4 mr-1.5" />
                  Minijuegos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Upcoming Matches */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 pb-6"
      >
        <UpcomingMatches />
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
