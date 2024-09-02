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