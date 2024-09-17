import { Arrayable, PickDeep, RequireAtLeastOne, Writable } from "type-fest";
import type { Database, Tables } from "./database.types";
interface SupabaseFilterOptions {
  ascending?: boolean;
  foreignTable?: boolean;
  nullsFirst?: boolean;
}

export interface SingleOrderBy<T> {
  column: keyof Partial<T>;
  options: RequireAtLeastOne<
    SupabaseFilterOptions,
    keyof SupabaseFilterOptions
  >;
}

const pa: SingleOrderBy<Tables<"materials">> = {
  column: "material_code",
  options: {
    ascending: true,
  },
};

export type OrderBy<T> = Arrayable<SingleOrderBy<T>>;
export type SelectQuery<T, K extends keyof T> =
  | {
      key: K;
      value: Arrayable<T[K]>;
    }[]
  | {
      page: number;
      limit: number;
      search?: string;
      order?: OrderBy<T>;
    };
