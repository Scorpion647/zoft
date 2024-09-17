"use client";

import { getRole } from "@lib/supabase/client";
import { Suspense } from "react";
import PageLoader from "../_ui/pageLoader";

export default async function SpecialLayout({
  user,
  admin,
  guest,
}: {
  user: React.ReactNode;
  admin: React.ReactNode;
  guest: React.ReactNode;
}) {
  let userRole: string = "guest";
  let isLoading = true;

  isLoading = false;
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <Suspense fallback={<PageLoader />}>
        {getRole().then((role) => {
          console.info(role);
          // TODO: handle error
          if (role) {
            userRole = role;
          } else {
            // TODO: handle unexpected error
          }
          isLoading = false;
          return (
            <>
              {isLoading ?
                <PageLoader />
              : userRole === "administrator" ?
                admin
              : userRole === "employee" ?
                user
              : guest}
            </>
          );
        })}
      </Suspense>
    </main>
  );
}
