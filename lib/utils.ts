import { clsx, type ClassValue } from "clsx";
import { EmptyRelations } from "drizzle-orm";
import {
  NodePgDatabase,
  NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import { PgAsyncTransaction } from "drizzle-orm/pg-core";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DB =
  | NodePgDatabase<EmptyRelations>
  | PgAsyncTransaction<NodePgQueryResultHKT, EmptyRelations>;
