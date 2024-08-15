import { createBrowserClient } from '@supabase/ssr'
import { Database } from './db'
import { CustomDataError, manageErrorMessage } from '@/app/_lib/definitions'

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export async function getSession() {
    const supabase = createClient()
    return await supabase.auth.getSession()
}

export async function reauthenticate() {
    const supabase = createClient()
    return await supabase.auth.reauthenticate()
}

export async function checkIfAdmin(): Promise<boolean | CustomDataError> {
    const supabase = createClient()
    const {data, error} = await supabase.auth.getUser()

    if (error) {
        return manageErrorMessage(error);
    }

    if (data.user) {
        const { data: profileData, error: profileError } = await supabase.from('profile').select('*').eq('user_id', data.user.id).limit(1).maybeSingle()

        if (profileError) return manageErrorMessage(profileError);

        if (!profileData) { return manageErrorMessage(null) }

        return profileData.role === 'administrator'
    }

    return false;
}