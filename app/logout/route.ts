import { createClient } from '@/app/_lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.signOut()
    }

    revalidatePath('/', 'layout')
    redirect('/')
}