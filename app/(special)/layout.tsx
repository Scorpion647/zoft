"use client";

import { checkIfAdmin } from '@/app/_lib/supabase/client';
import { useEffect, useState } from 'react';
import { CustomDataError } from '../_lib/definitions';
import PageLoader from '../_ui/pageLoader';

export default function SpecialLayout({ user, admin }: {
    user: React.ReactNode,
    admin: React.ReactNode,
}) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkIfAdmin().then(isAdmin => {
            if (isAdmin instanceof CustomDataError) {
                // TODO: handle error
            } else {
                setIsAdmin(isAdmin);
            }
            setIsLoading(false);
        });
    }, [])

    return (
        <main className='flex flex-col items-center justify-center h-screen'>
            {isLoading ? <PageLoader /> : isAdmin ? admin : user}
        </main>
    )
}