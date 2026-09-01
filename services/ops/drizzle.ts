import { db } from "@/db";
import { Logger } from "@/lib/logger";
import {
  and,
  eq,
  getColumns,
  type AnyColumn,
  type EmptyRelations,
  type InferInsertModel,
  type InferSelectModel,
  type or,
  type SQL,
} from "drizzle-orm";
import type {
  AnyPgTable,
  PgAsyncTransaction,
  PgQueryResultHKT,
} from "drizzle-orm/pg-core";

type DB = PgAsyncTransaction<PgQueryResultHKT, EmptyRelations>;
type Condition<T> = (
  t: T,
) => SQL | ReturnType<typeof and> | ReturnType<typeof or>;
type ExecutableQuery<TResult> = {
  execute(): Promise<TResult>;
  toSQL(): {
    sql: string;
    params: unknown[];
  };
};

interface DrizzleOpsInterface {
  executeQuery: <TResult>(
    query: ExecutableQuery<TResult>,
    log: Logger,
  ) => Promise<TResult>;

  insert: <T extends AnyPgTable>(
    table: T,
    data: InferInsertModel<T>,
    log: Logger,
    tx?: DB,
  ) => Promise<InferSelectModel<T>>;

  readTable: <T extends AnyPgTable>(
    table: T,
    data: Partial<InferInsertModel<T>>,
    log: Logger,
    tx?: DB,
  ) => Promise<InferSelectModel<T>[]>;

  readTableUnique: <T extends AnyPgTable>(
    table: T,
    data: Partial<InferInsertModel<T>>,
    log: Logger,
    tx?: DB,
  ) => Promise<InferSelectModel<T>>;

  update: <T extends AnyPgTable>(
    table: T,
    data: Partial<InferInsertModel<T>>,
    condition: Condition<T>,
    log: Logger,
    tx?: DB,
  ) => Promise<InferSelectModel<T>>;

  delete: <T extends AnyPgTable>(
    table: T,
    condition: Condition<T>,
    log: Logger,
    tx?: DB,
  ) => Promise<InferSelectModel<T>>;
}

const drizzleOps: DrizzleOpsInterface = {
  async executeQuery(query, log) {
    log.trace({ layer: "execute query - drizzle ops" });

    const { sql, params } = query.toSQL();
    log.debug({ query: sql });
    log.debug({ params: params });

    const rows = await query.execute();
    log.debug({ rows });
    return rows;
  },

  async insert(table, data, log, tx) {
    log.trace({ layer: "insert - drizzle ops" });
    const t = tx ?? db;
    log.data({ data: data });

    const [row] = (await drizzleOps.executeQuery(
      t.insert(table).values(data).returning(),
      log.nest(),
    )) as InferSelectModel<typeof table>[];

    log.debug({ rows: row });
    return row as InferSelectModel<typeof table>;
  },

  async readTable(table, data, log, tx) {
    log.trace({ layer: "read table - drizzle ops" });
    const t = tx ?? db;
    log.info({ data });

    const columns = getColumns(table);
    const conditions: SQL[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key in columns) {
        const column = columns[key as keyof typeof columns];
        const k = column?.name ?? "";
        log.info({ params: `${k} - ${value}` });
        conditions.push(eq(column as AnyColumn, value as never));
      }
    }

    return (await drizzleOps.executeQuery(
      t
        .select()
        .from(table as AnyPgTable)
        .where(and(...conditions)),
      log.nest(),
    )) as InferSelectModel<typeof table>[];
  },

  async readTableUnique(table, data, log, tx) {
    log.trace({ layer: "read table unique - drizzle ops" });
    const t = tx ?? db;
    log.info({ data });

    const columns = getColumns(table);
    const conditions: SQL[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key in columns) {
        const column = columns[key as keyof typeof columns];
        const k = column?.name ?? "";
        log.info({ params: `${k} - ${value}` });
        conditions.push(eq(column as AnyColumn, value as never));
      }
    }

    const rows = (await drizzleOps.executeQuery(
      t
        .select()
        .from(table as AnyPgTable)
        .where(and(...conditions)),
      log.nest(),
    )) as InferSelectModel<typeof table>[];

    if (rows.length !== 1) {
      return rows[0] as InferSelectModel<typeof table>;
    } else {
      throw new Error("The data is not unique or unavailable.");
    }
  },

  async update(table, data, condition, log, tx) {
    log.trace({ layer: "update - drizzle ops" });
    const t = tx ?? db;
    log.info({ data });

    const [row] = (await drizzleOps.executeQuery(
      t.update(table).set(data).where(condition(table)).returning(),
      log,
    )) as InferSelectModel<typeof table>[];

    return row as InferSelectModel<typeof table>;
  },

  async delete(table, condition, log, tx) {
    log.trace({ layer: "update - drizzle ops" });
    const t = tx ?? db;

    const [row] = (await drizzleOps.executeQuery(
      t.delete(table).where(condition(table)).returning(),
      log.nest(),
    )) as InferSelectModel<typeof table>[];

    return row as InferSelectModel<typeof table>;
  },
};

export default drizzleOps;
