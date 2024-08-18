"use client";

import { getRole } from '@/app/_lib/supabase/server';
import { useEffect, useState } from 'react';
import { CustomDataError } from '../_lib/definitions';
import PageLoader from '../_ui/pageLoader';

export default function SpecialLayout({ user, admin, guest }: {
    user: React.ReactNode,
    admin: React.ReactNode,
    guest: React.ReactNode,
}) {
    const [role, setRole] = useState("employee");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getRole().then(role => {
            if (role instanceof CustomDataError) {
                // TODO: handle error
            } else if (role) {
                setRole(role);
            } else {
                // TODO: handle unexpectede rror
            }
            setIsLoading(false);
        });
    }, [])

    return (
        <main className='flex flex-col items-center justify-center h-screen'>
            {isLoading ? <PageLoader /> : role === "administrator" ? admin : role === "employee" ? user :
                <div>Por favor espera a que el administrador valide tu información para acceder.</div>}
        </main>
    )
}