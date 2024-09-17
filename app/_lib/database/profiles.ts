"use client";

import { createClient } from "@/app/_lib/supabase/client";
import { Arrayable, SetRequired } from "type-fest";
import { Tables, TablesUpdate } from "../database.types";
import { handleError } from "../definitions";

const supabase = createClient();

export async function getProfile(profile_id: Tables<"profiles">["profile_id"]) {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("profile_id", profile_id)
    .single();

  if (error) throw error;

  return data;
}

export async function updateProfile(
  profile: Arrayable<SetRequired<TablesUpdate<"profiles">, "profile_id">>,
) {
  const profileList = profile instanceof Array ? profile : [profile];

  for (const it of profileList) {
    const { error } = await supabase
      .from("profiles")
      .update(it)
      .eq("user_id", it.profile_id);

    if (error) throw error;
  }
}

// TODO: Check if this functions work
export async function deleteAccount() {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { error } = await supabase.functions.invoke("delete-user", {
    body: { user_id: userData.user.id },
  });

  if (error) throw error;
}

export async function removeUser(user_id: string) {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;

  const { data: userTarget, error: userTargetError } = await supabase
    .from("profiles")
    .select("profile_id")
    .eq("user_id", user_id)
    .limit(1)
    .single();

  if (userTargetError) throw userTargetError;

  const { error } = await supabase.functions.invoke("delete-user", {
    body: { user_id: userTarget.profile_id },
  });
  if (error) return handleError(error);
}
