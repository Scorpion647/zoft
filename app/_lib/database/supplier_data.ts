"use client";

import { Tables, TablesInsert, TablesUpdate } from "@lib/database.types";
import { createClient } from "@lib/supabase/client";
import { Arrayable, SetRequired, Writable } from "type-fest";
import { MultiSelectQuery } from "../database.utils";
import { Prettify } from "@lib/utils/types";

const supabase = createClient();

export async function selectSingleSupplierData(
  supplier_data_id: Tables<"supplier_data">["supplier_data_id"],
) {
  const { data, error } = await supabase
    .from("supplier_data")
    .select("*")
    .eq("supplier_data_id", supplier_data_id)
    .single();

  if (error) throw error;

  return data;
}

export async function selectSupplierData(
  params: Prettify<MultiSelectQuery<Tables<"supplier_data">>>,
) {
  let query = supabase.from("supplier_data").select("*");

  if (params.search && params.search.trim().length > 0) {
    query = query.textSearch("supplier_data_search", params.search, {
      type: "websearch",
    });
  }

  if (params.orderBy) {
    const orderList =
      params.orderBy instanceof Array ? params.orderBy : [params.orderBy];

    for (let it of orderList) {
      const { column, options } = it;
      query = query.order(column, options);
    }
  }

  const { page, limit } = params;

  query =
    page ?
      query.range((page - 1) * limit, page * limit - 1)
    : query.limit(limit);

  const { data, error } = await query;

  if (error) {
    throw error;
  }
  return data;
}

export async function insertSupplierData(
  invoice: Writable<Arrayable<TablesInsert<"supplier_data">>>,
) {
  const invoiceList = invoice instanceof Array ? invoice : [invoice];

  const { data, error } = await supabase
    .from("supplier_data")
    .insert(invoiceList)
    .select()
    .returns<Tables<"supplier_data">[]>();

  if (error) {
    throw error;
  }
  return data;
}

export async function updateSupplierData(
  invoice: Arrayable<
    SetRequired<TablesUpdate<"supplier_data">, "supplier_data_id">
  >,
) {
  const invoiceList = invoice instanceof Array ? invoice : [invoice];

  for (const it of invoiceList) {
    const { error } = await supabase
      .from("supplier_data")
      .update(it)
      .eq("supplier_data_id", it.supplier_data_id)
      .single();

    if (error) throw error;
  }
}

export async function deleteSupplierData(
  supplier_data_id: Arrayable<Tables<"supplier_data">["supplier_data_id"]>,
) {
  const { error } = await supabase
    .from("supplier_data")
    .delete()
    .eq("supplier_data_id", supplier_data_id);

  if (error) {
    throw error;
  }
}
