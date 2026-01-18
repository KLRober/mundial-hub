'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Gamepad2, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/prode', icon: Trophy, label: 'Prode' },
        { href: '/juegos', icon: Gamepad2, label: 'Juegos' },
        { href: '/perfil', icon: Shirt, label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-[500px] bg-background/90 backdrop-blur-xl border-t border-mexico/20 pointer-events-auto shadow-lg shadow-mexico/10 pb-safe">
                {/* Host Country Top Border */}
                <div className="h-[2px] bg-linear-to-r from-mexico via-usa to-canada" />

                <ul className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href} className="flex-1">
                                <Link
                                    href={item.href}
                                    className="flex flex-col items-center justify-center w-full h-full gap-1 group relative"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute -top-[2px] w-10 h-[3px] bg-gold shadow-[0_0_12px_rgba(212,175,55,0.6)] rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-gold/15 text-gold'
                                        : 'text-muted-foreground group-hover:text-gold'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                        {/* Trophy icon special treatment */}
                                        {item.href === '/prode' && isActive && (
                                            <motion.div
                                                className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full"
                                                animate={{ scale: [1, 1.3, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                    </div>

                                    <span className={`text-[10px] font-semibold transition-colors duration-300 ${isActive
                                        ? 'text-gold'
                                        : 'text-muted-foreground group-hover:text-gold'
                                        }`}>
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}
