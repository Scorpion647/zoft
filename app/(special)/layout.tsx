"use server";
import { getRole } from '@/app/_lib/supabase/server';
import { Suspense } from 'react';
import { CustomDataError } from '../_lib/definitions';
import PageLoader from '../_ui/pageLoader';

export default async function SpecialLayout({ user, admin, guest }: {
    user: React.ReactNode,
    admin: React.ReactNode,
    guest: React.ReactNode,
}) {
    let userRole: string = "guest";
    let isLoading = true;

    getRole().then(role => {
        if (role instanceof CustomDataError) {
            // TODO: handle error
        } else if (role) {
            userRole = role;
        } else {
            // TODO: handle unexpectede rror
        }
        isLoading = false;
    });

    return (
        <main className='flex flex-col items-center justify-center h-screen'>
            <Suspense fallback={<PageLoader />}>
                {getRole().then(role => {
                    if (role instanceof CustomDataError) {
                        // TODO: handle error
                    } else if (role) {
                        userRole = role;
                    } else {
                        // TODO: handle unexpected error
                    }
                    isLoading = false;
                    return <>
                        {isLoading ? <PageLoader /> : userRole === "administrator" ? admin : userRole === "employee" ? user : guest}
                    </>;
                })}
            </Suspense>
        </main>
    )
}