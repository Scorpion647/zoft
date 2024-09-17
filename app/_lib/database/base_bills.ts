"use client";
import { createClient } from "@lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { Arrayable, Writable } from "type-fest";
import { Tables, TablesInsert, TablesUpdate } from "../database.types";
import { SelectQuery } from "../database.utils";

const supabase = createClient();

export async function insertBills(
  bill: Writable<Arrayable<TablesInsert<"base_bills">>>,
) {
  const billList = bill instanceof Array ? bill : [bill];

  const { data, error } = await supabase
    .from("base_bills")
    .insert(billList)
    .select();

  if (error) throw error;

  return data;
}

export async function updateBills(
  bills: Writable<Arrayable<TablesUpdate<"base_bills">>>,
) {
  const billList = bills instanceof Array ? bills : [bills];

  const errors: PostgrestError[] = [];
  for (const it of billList) {
    const { error } = await supabase.from("base_bills").update(it);

    if (error) errors.push(error);
  }

  if (errors.length > 0) throw errors;
}

export async function deleteBills(billID: Arrayable<Tables<"base_bills">>) {
  const { data, error } = await supabase
    .from("base_bills")
    .delete()
    .eq("base_bill_id", billID);
}

export async function selectBills(
  params: SelectQuery<Tables<"base_bills">, keyof Tables<"base_bills">>,
) {
  let query = supabase.from("base_bills").select();

  if (params instanceof Array) {
    for (const it of params) {
      const valueList = it.value instanceof Array ? it.value : [it.value];

      query = query.in(
        it.key,
        valueList.filter((value) => !!value),
      );
    }
  } else {
    if (params.search && params.search.trim().length > 0) {
      query = query.textSearch("base_bill_search", params.search, {
        type: "websearch",
      });
    }

    if (params.order) {
      const orderList =
        params.order instanceof Array ? params.order : [params.order];

      for (const order of orderList) {
        query = query.order(order.column, order.options);
      }
    }
    const { page, limit } = params;
    query = query.range((page - 1) * limit, page * limit - 1);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}
