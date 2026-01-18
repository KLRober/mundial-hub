import { supabase } from '@/lib/supabase';

/**
 * Suma puntos al usuario autenticado actual
 * Funciona tanto con usuarios reales de Supabase como con modo demo (localStorage)
 * @param points - Cantidad de puntos a sumar (debe ser positivo)
 * @returns true si se sumaron los puntos correctamente, false en caso de error
 */
export async function addGamePoints(points: number): Promise<boolean> {
    // Check for demo mode first
    const demoUser = localStorage.getItem('mundial-hub-demo-user');
    if (demoUser) {
        // Demo mode: save to localStorage
        const currentPoints = parseInt(localStorage.getItem('mundial-hub-demo-points') || '0');
        localStorage.setItem('mundial-hub-demo-points', String(currentPoints + points));
        console.log(`[Demo Mode] Added ${points} points. Total: ${currentPoints + points}`);
        return true;
    }

    // Regular Supabase mode
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('No authenticated user - points not saved');
        return false;
    }

    const { error } = await supabase.rpc('add_game_points', {
        points_to_add: points
    });

    if (error) {
        console.error('Error adding game points:', error);
        return false;
    }

    console.log(`Added ${points} points to user ${user.id}`);
    return true;
}

/**
 * Verifica si hay un usuario logueado (real o demo)
 * @returns true si hay usuario, false si no
 */
export function isUserLoggedIn(): boolean {
    // Check demo mode
    const demoUser = localStorage.getItem('mundial-hub-demo-user');
    if (demoUser) return true;

    // Will need async check for real users
    return false;
}

/**
 * Obtiene la sesión actual del usuario (real o demo)
 * @returns El usuario autenticado o null
 */
export async function getCurrentUser() {
    // Check demo mode first
    const demoUser = localStorage.getItem('mundial-hub-demo-user');
    if (demoUser) {
        return JSON.parse(demoUser);
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Verifica si está en modo demo
 */
export function isDemoMode(): boolean {
    return !!localStorage.getItem('mundial-hub-demo-user');
}
