'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Gamepad2, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/prode', icon: Trophy, label: 'Predicciones' },
        { href: '/juegos', icon: Gamepad2, label: 'Juegos' },
        { href: '/perfil', icon: User, label: 'Perfil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-[500px] bg-white/95 backdrop-blur-xl border-t border-gray-100 pointer-events-auto shadow-lg pb-safe">
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
                                            className="absolute -top-[1px] w-10 h-[3px] bg-emerald-600 rounded-full"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-gray-400 group-hover:text-emerald-600'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <span className={`text-[10px] font-semibold transition-colors duration-300 ${isActive
                                        ? 'text-emerald-700'
                                        : 'text-gray-400 group-hover:text-emerald-600'
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
