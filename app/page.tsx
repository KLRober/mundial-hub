'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, TrendingUp } from 'lucide-react';
import { UpcomingMatches } from '@/components/UpcomingMatches';
import { Leaderboard } from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen pb-20 bg-white-soft">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-100">
        <div className="px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Mundialito
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                {/* Minimalist Flags */}
                <span className="inline-block w-5 h-3 rounded-sm overflow-hidden shadow-sm" style={{ background: 'linear-gradient(90deg, #006847 33%, white 33% 66%, #ce1126 66%)' }}>
                </span>
                <span className="inline-block w-5 h-3 rounded-sm overflow-hidden shadow-sm relative" style={{ background: 'linear-gradient(180deg, #b22234 0, #b22234 15%, white 15%, white 30%, #b22234 30%, #b22234 45%, white 45%, white 60%, #b22234 60%, #b22234 75%, white 75%, white 90%, #b22234 90%)' }}>
                  <span className="absolute top-0 left-0 w-2 h-1.5 bg-[#3c3b6e]"></span>
                </span>
                <span className="inline-block w-5 h-3 rounded-sm overflow-hidden shadow-sm" style={{ background: 'linear-gradient(90deg, #ff0000 25%, white 25% 75%, #ff0000 75%)' }}>
                </span>
                <span className="text-gray-400">2026</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/ranking">
                <Button size="sm" variant="ghost" className="relative group">
                  <Trophy className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Subtle gradient border */}
        <div className="h-[2px] bg-linear-to-r from-emerald-500 via-emerald-600 to-emerald-700 opacity-80" />
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-6"
      >
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 border border-amber-200 shadow-sm">
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl" />

          <div className="relative">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span>⚽</span>
              ¡Haz tus Predicciones!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Predice los resultados y compite con tus amigos por premios exclusivos.
            </p>
            <div className="flex gap-2">
              <Link href="/prode">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/25">
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Hacer Predicción
                </Button>
              </Link>
              <Link href="/juegos">
                <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 hover:border-gray-300">
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
