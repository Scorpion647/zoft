"use client";

import { createClient } from "@/app/_lib/supabase/client";
import { CustomDataError, manageErrorMessage } from "@/app/_lib/definitions";
import { Tables, TablesUpdate } from "@/app/_lib/supabase/db";
import type { SetRequired } from "type-fest";

const supabase = createClient();

export async function updateProfile(
  data: SetRequired<TablesUpdate<"profiles">, "profile_id">,
) {
  const { data: result, error } = await supabase
    .from("profiles")
    .update(data)
    .eq("profile_id", data.profile_id);
}

export async function deleteAccount(): Promise<void | CustomDataError> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) return manageErrorMessage(userError);

  if (userData.user) {
    const { error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: userData.user.id },
    });
    if (error) return manageErrorMessage(error);
  } else {
    return manageErrorMessage(null);
  }
}

export async function removeUser(
  user_id: string,
): Promise<void | CustomDataError> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) return manageErrorMessage(userError);

  if (userData.user) {
    const { data: userTarget, error: userTargetError } = await supabase
      .from("profiles")
      .select("profile_id")
      .eq("profile_id", user_id)
      .limit(1)
      .maybeSingle();

    if (userTargetError) return manageErrorMessage(userTargetError);
    if (!userTarget) return manageErrorMessage(null);

    if (userTarget?.profile_id) {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: userTarget.profile_id },
      });
      if (error) return manageErrorMessage(error);
    }
  } else {
    return manageErrorMessage(null);
  }
}
