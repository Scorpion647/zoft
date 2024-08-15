'use server'
import { createClient } from '@/app/_lib/supabase/server'

export async function deleteUserServer(user_id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    const { data:profile, error:profile_error } = await supabase.from('profile').select('*').eq('user_id', user_id).single();
    if (profile_error) {
        throw profile_error;
    }
    if (profile.role!=='administrator') {
        throw new Error("No tienes permisos para realizar esta acción")
    } else {
        const response = await supabase.auth.admin.deleteUser(user_id);
        if (response.error) {
            throw response.error;
        } else {
            return;
        }
    }
}