// Admin Authentication Service
// Verifies if the current user is an admin based on their email

import { supabase } from '@/lib/supabase';

// Admin emails list - roberkarp@gmail.com has full access
const ADMIN_EMAILS = ['roberkarp@gmail.com'];

export interface AdminUser {
    id: string;
    email: string;
    isAdmin: boolean;
}

/**
 * Check if an email is in the admin list
 */
export function isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Get current admin user from Supabase session
 * Returns null if not logged in or not an admin
 */
export async function getAdminUser(): Promise<AdminUser | null> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session?.user) {
        return null;
    }

    const email = session.user.email;
    if (!email || !isAdminEmail(email)) {
        return null;
    }

    return {
        id: session.user.id,
        email: email,
        isAdmin: true
    };
}

/**
 * Subscribe to auth changes and check admin status
 */
export function onAdminAuthChange(callback: (user: AdminUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
        if (!session?.user?.email) {
            callback(null);
            return;
        }

        if (isAdminEmail(session.user.email)) {
            callback({
                id: session.user.id,
                email: session.user.email,
                isAdmin: true
            });
        } else {
            callback(null);
        }
    });
}
