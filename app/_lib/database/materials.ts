"use client";

import { Tables, TablesInsert, TablesUpdate } from "@lib/database.types";
import { OrderBy } from "@lib/database.utils";
import { createClient } from "@lib/supabase/client";
import { Arrayable, SetRequired, Writable } from "type-fest";

const supabase = createClient();

export async function getMaterial(
  material_code: Tables<"materials">["material_code"],
) {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("material_code", material_code)
    .single();

  if (error) throw error;

  return data;
}

export async function getMaterials(
  page: number = 1,
  limit: number = 10,
  search?: string,
  order?: OrderBy<Tables<"materials">>,
) {
  let query = supabase.from("materials").select("*");

  if (search && search.trim() !== "") {
    query = query.textSearch("name_description", search, {
      type: "websearch",
    });
  }

  if (order) {
    const orderList = order instanceof Array ? order : [order];

    for (let it of orderList) {
      const { column, options } = it;
      query = query.order(column, options);
    }
  }

  const { data, error } = await query.range(
    (page - 1) * limit,
    page * limit - 1,
  );

  if (error) {
    throw error;
  }
  return data;
}

export async function insertMaterial(
  material: Writable<Arrayable<TablesInsert<"materials">>>,
) {
  const materialList = material instanceof Array ? material : [material];

  const { data, error } = await supabase
    .from("materials")
    .insert(materialList)
    .select()
    .returns<Tables<"materials">[]>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMaterial(
  material: Arrayable<SetRequired<TablesUpdate<"materials">, "material_code">>,
) {
  const materialList = material instanceof Array ? material : [material];

  for (const it of materialList) {
    const { error } = await supabase
      .from("materials")
      .update(it)
      .eq("material_code", it.material_code)
      .single();

    if (error) throw error;
  }
}

export async function deleteMaterial(
  material_code: Arrayable<Tables<"materials">["material_code"]>,
) {
  const { error } = await supabase
    .from("materials")
    .delete()
    .eq("material_code", material_code);

  if (error) {
    throw error;
  }
}
