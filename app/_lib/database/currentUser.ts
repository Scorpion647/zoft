import { createClient } from "@lib/supabase/client";

const supabase = createClient();

export async function currentData() {
  return await supabase.auth.getUser();
}
