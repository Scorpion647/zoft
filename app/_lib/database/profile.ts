"use client"

import { createClient } from "@/app/_lib/supabase/client";
import { CustomDataError, manageErrorMessage } from "@/app/_lib/definitions";
import { Database } from "@/app/_lib/supabase/db";

export async function getProfile(): Promise<Database['public']['Tables']['profile']['Row'] | CustomDataError> {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) return manageErrorMessage(userError);

    if (!userData.user) { return manageErrorMessage(null) }

    const { data: profileData, error: profileError } = await supabase.from('profile').select('*').eq('user_id', userData.user.id).limit(1).maybeSingle()

    if (profileError) return manageErrorMessage(profileError);

    if (!profileData) { return manageErrorMessage(null) }

    return profileData
}

export async function updateProfile(data: Database['public']['Tables']['profile']['Update']): Promise<void | CustomDataError> {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) return manageErrorMessage(userError);

    if (userData.user) {
        const { error: updateError } = await supabase.from('profile').update(data).eq('user_id', userData.user.id)

        if (updateError) return manageErrorMessage(updateError);
    }
}