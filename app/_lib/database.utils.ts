import {
  Arrayable,
  RequireAtLeastOne,
  Simplify,
  SimplifyDeep,
} from "type-fest";
import { Tables } from "./database.types";

interface SupabaseFilterOptions {
  ascending?: boolean;
  foreignTable?: boolean;
  nullsFirst?: boolean;
}

interface SingleOrderBy<T> {
  column: keyof Partial<T>;
  options?: RequireAtLeastOne<
    SupabaseFilterOptions,
    keyof SupabaseFilterOptions
  >;
}

type OrderBy<T> = SimplifyDeep<Arrayable<SingleOrderBy<T>>>;

const example: MultiSelectQuery<Tables<"materials">> = {
  limit: 200,
  orderBy: [{ column: "material_code", options: { ascending: true } }],
};

export type MultiSelectQuery<Table> = Simplify<{
  limit: number;
  page?: number;
  search?: string;
  orderBy?: OrderBy<Table>;
}>;
