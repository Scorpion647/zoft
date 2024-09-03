"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './db'
import { CustomDataError, manageErrorMessage } from '../definitions'

export async function createClient() {
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

export async function getRole(): Promise<string | undefined |CustomDataError> {
    const supabase = createClient()
    const {data, error} = await (await supabase).auth.getUser()

    if (error) {
        return manageErrorMessage(error);
    }

    if (data.user) {
        const { data: profileData, error: profileError } = await (await supabase).from('profile').select('*').eq('user_id', data.user.id).limit(1).maybeSingle()

        if (profileError) return manageErrorMessage(profileError);

        if (!profileData) { return manageErrorMessage(null) }

        if (!profileData.role) return manageErrorMessage(null);

        return profileData.role;
    }
}

export async function checkIfAdmin(): Promise<boolean | CustomDataError> {
    const role = await getRole();

    if (role instanceof CustomDataError) {
        return role;
    }

    return role === 'administrator';
}