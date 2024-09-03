"use client"

import { createClient } from "@/app/_lib/supabase/client";
import { CustomDataError, manageErrorMessage } from "@/app/_lib/definitions";
import { Tables, TablesUpdate } from "@/app/_lib/supabase/db";

export async function getProfile(): Promise<Tables<'profile'> | CustomDataError> {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) return manageErrorMessage(userError);

    if (!userData.user) { return manageErrorMessage(null) }

    const { data: profileData, error: profileError } = await supabase.from('profile').select('*').eq('user_id', userData.user.id).limit(1).maybeSingle()

    if (profileError) return manageErrorMessage(profileError);

    if (!profileData) { return manageErrorMessage(null) }

    return profileData
}

export async function updateProfile(data: TablesUpdate<'profile'>): Promise<void | CustomDataError> {
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) return manageErrorMessage(userError);

    if (userData.user) {
        const { error: updateError } = await supabase.from('profile').update(data).eq('user_id', userData.user.id)

        if (updateError) return manageErrorMessage(updateError);
    }
}

export async function deleteAccount(): Promise<void | CustomDataError> {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) return manageErrorMessage(userError);

    if (userData.user) {
        const { error } = await supabase.functions.invoke('delete-user', { body: { user_id: userData.user.id } })
        if (error) return manageErrorMessage(error);
    } else {
        return manageErrorMessage(null)
    }
}

export async function removeUser(user_id: string): Promise<void | CustomDataError> {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError) return manageErrorMessage(userError);

    if (userData.user) {
        const { data: userTarget, error: userTargetError } = await supabase.from('profile').select('user_id').eq('user_id', user_id).limit(1).maybeSingle()

        if (userTargetError) return manageErrorMessage(userTargetError);
        if (!userTarget) return manageErrorMessage(null)

        if (userTarget?.user_id) {
            const { error } = await supabase.functions.invoke('delete-user', { body: { user_id: userTarget.user_id } })
            if (error) return manageErrorMessage(error);
        }

    } else {
        return manageErrorMessage(null)
    }
}