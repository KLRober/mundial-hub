import { supabase } from '@/lib/supabase';

/**
 * Suma puntos al usuario autenticado actual
 * @param points - Cantidad de puntos a sumar (debe ser positivo)
 * @returns true si se sumaron los puntos correctamente, false en caso de error
 */
export async function addGamePoints(points: number): Promise<boolean> {
    // Verificar que hay un usuario autenticado
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
 * Obtiene la sesión actual del usuario
 * @returns El usuario autenticado o null
 */
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}
