'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Gamepad2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/prode', icon: Trophy, label: 'Prode' },
        { href: '/juegos', icon: Gamepad2, label: 'Juegos' },
        { href: '/perfil', icon: User, label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-[500px] bg-background/80 backdrop-blur-xl border-t border-border/50 pointer-events-auto shadow-lg shadow-primary/5 pb-safe">
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
                                            className="absolute -top-px w-8 h-[2px] bg-primary shadow-[0_0_8px_rgba(113,219,210,0.5)]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-hover:text-primary/70'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'
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
