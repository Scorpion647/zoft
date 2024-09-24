"use client";

import { Tables, TablesInsert, TablesUpdate } from "@lib/database.types";
import { createClient } from "@lib/supabase/client";
import { Arrayable, SetRequired, Writable } from "type-fest";
import { MultiSelectQuery } from "../database.utils";
import { Prettify } from "@lib/utils/types";
import { selectSingleSupplierEmployee } from "./supplier_employee";
import { insertInvoice, selectInvoice_data } from "./invoice_data";

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

export async function selectSupplierDataByInvoiceID(
  invoiceID: Tables<"invoice_data">["invoice_id"],
  page: number = 1,
  pageSize: number = 10,
) {
  const { data, error } = await supabase
    .from("supplier_data")
    .select()
    .eq("invoice_id", invoiceID)
    .range((page - 1) * pageSize, page * pageSize - 1);
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
  supplierData: Writable<Arrayable<TablesInsert<"supplier_data">>>,
  supplier_target?: Tables<"suppliers">["supplier_id"],
) {
  let inferedInvoice: Tables<"invoice_data">["invoice_id"] | undefined;

  const supplierDataList = (supplierData =
    supplierData instanceof Array ? supplierData : [supplierData]);

  let idx = 0;

  for (let item of supplierDataList) {
    if (!item.invoice_id) {
      // If there is no infered invoice, create it
      if (!inferedInvoice) {
        let invoiceData: Tables<"invoice_data">[] | undefined;

        if (!supplier_target) {
          if (!item.supplier_employee_id) {
            throw Error(`No supplier employee set for item ${item}`);
          }

          const employeeData = await selectSingleSupplierEmployee(
            item.supplier_employee_id,
          );
          invoiceData = await insertInvoice({
            supplier_id: employeeData.supplier_id,
          });
        } else {
          invoiceData = await insertInvoice({
            supplier_id: supplier_target,
          });
        }

        inferedInvoice = invoiceData[0].invoice_id;
      }

      // Associate the infered invoice with the item whithout invoice
      if (inferedInvoice) {
        item.invoice_id = inferedInvoice;
      }
    }

    idx++;
  }

  const { data, error } = await supabase
    .from("supplier_data")
    .insert(supplierDataList)
    .select();

  if (error) {
    throw error;
  }
  return data;
}

export async function updateSupplierData(
  supplierData: Arrayable<
    SetRequired<TablesUpdate<"supplier_data">, "supplier_data_id">
  >,
) {
  const supplierDataList =
    supplierData instanceof Array ? supplierData : [supplierData];

  for (const it of supplierDataList) {
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
