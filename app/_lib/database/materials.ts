"use client";

import { createClient } from "../supabase/client";
import { CustomDataError, manageErrorMessage } from "@/app/_lib/definitions";
import { SetRequired } from "type-fest";
import { Tables, TablesInsert, TablesUpdate } from "@/app/_lib/supabase/db";

const supabase = createClient();

export async function getMaterial(
  material_code: Tables<"materials">["material_code"],
): Promise<Tables<"materials"> | CustomDataError | null> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("material_code", material_code)
    .single();

  if (error) {
    return manageErrorMessage(error);
  }
  return data;
}

export async function getMaterials(
  page: number = 1,
  limit: number = 10,
  search?: string,
  order_by?: [
    keyof Tables<"materials">,
    { ascending?: boolean; foreignTable?: boolean; nullsFirst?: boolean },
  ][],
): Promise<Tables<"materials">[] | CustomDataError | null> {
  const query = supabase.from("materials").select("*");

  if (search && search.trim() !== "") {
    query.textSearch("name_description", search, {
      type: "websearch",
    });
  }

  if (order_by && order_by.length > 0) {
    order_by.forEach(([column, options]) => {
      query.order(column, options);
    });
  }

  const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );

  if (error) {
    return manageErrorMessage(error);
  }
  return data;
}

export async function insertMaterial(
  materials: TablesInsert<"materials">[],
): Promise<CustomDataError | undefined> {
  for (const material of materials) {
    const { data, error } = await supabase
      .from("materials")
      .insert(material)
      .select("material_code")
      .single();

    if (error || !data.material_code) {
      return manageErrorMessage(error);
    }
  }
}

export async function updateMaterial(
  data: SetRequired<TablesUpdate<"materials">, "material_code">,
): Promise<CustomDataError | void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("materials")
    .update(data)
    .eq("material_code", data.material_code)
    .single();
  if (error) {
    return manageErrorMessage(error);
  }
}

export async function deleteMaterial(
  material_code: Tables<"materials">["material_code"],
): Promise<CustomDataError | void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("material_code", material_code);

  if (error) {
    return manageErrorMessage(error);
  }
}

