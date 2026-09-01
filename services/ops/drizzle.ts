import { db } from "@/db";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
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
  ) => Promise<Result<TResult, string>>;

  insert: <T extends AnyPgTable>(
    table: T,
    data: InferInsertModel<T>,
    log: Logger,
    tx?: DB,
  ) => Promise<Result<InferSelectModel<T>, string>>;

  readTable: <T extends AnyPgTable>(
    table: T,
    data: Partial<InferInsertModel<T>>,
    log: Logger,
    tx?: DB,
  ) => Promise<Result<InferSelectModel<T>[], string>>;

  readTableUnique: <T extends AnyPgTable>(
    table: T,
    data: Partial<InferInsertModel<T>>,
    log: Logger,
    tx?: DB,
  ) => Promise<Result<InferSelectModel<T>, string>>;

  update: <T extends AnyPgTable>(
    table: T,
    data: Partial<InferInsertModel<T>>,
    condition: Condition<T>,
    log: Logger,
    tx?: DB,
  ) => Promise<Result<InferSelectModel<T>, string>>;

  delete: <T extends AnyPgTable>(
    table: T,
    condition: Condition<T>,
    log: Logger,
    tx?: DB,
  ) => Promise<Result<InferSelectModel<T>, string>>;
}

const drizzleOps: DrizzleOpsInterface = {
  async executeQuery(query, log) {
    log.trace({ layer: "execute query - drizzle ops" });
    try {
      const { sql, params } = query.toSQL();
      log.debug({ query: sql });
      log.debug({ params: params });

      const rows = await query.execute();
      log.debug({ rows });
      return Result.ok(rows);
    } catch (error) {
      log.error({ dbError: error as string });
      return Result.error("could not execute query");
    }
  },

  async insert(table, data, log, tx) {
    log.trace({ layer: "insert - drizzle ops" });
    try {
      const t = tx ?? db;
      log.data({ data: data });

      const [row] = (await drizzleOps.executeQuery(
        t.insert(table).values(data).returning(),
        log.nest(),
      )) as unknown as InferSelectModel<typeof table>[];

      log.debug({ rows: row });
      return Result.ok(row as InferSelectModel<typeof table>);
    } catch (error) {
      log.error({ dbError: error as string });
      return Result.error("could not insert");
    }
  },

  async readTable(table, data, log, tx) {
    log.trace({ layer: "read table - drizzle ops" });
    try {
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

      return Result.ok(
        (await drizzleOps.executeQuery(
          t
            .select()
            .from(table as AnyPgTable)
            .where(and(...conditions)),
          log.nest(),
        )) as unknown as InferSelectModel<typeof table>[],
      );
    } catch (error) {
      log.error({ dbError: error as string });
      return Result.error("could not read table");
    }
  },

  async readTableUnique(table, data, log, tx) {
    log.trace({ layer: "read table unique - drizzle ops" });
    try {
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
      )) as unknown as InferSelectModel<typeof table>[];

      if (rows.length !== 1) {
        return Result.ok(rows[0] as InferSelectModel<typeof table>);
      } else {
        log.error({ dbError: "the data is not unique or unavailable." });
        return Result.error("the data is not unique or unavailable.");
      }
    } catch (error) {
      log.error({ dbError: error as string });
      return Result.error("could not read table unique");
    }
  },

  async update(table, data, condition, log, tx) {
    log.trace({ layer: "update - drizzle ops" });
    try {
      const t = tx ?? db;
      log.info({ data });

      const [row] = (await drizzleOps.executeQuery(
        t.update(table).set(data).where(condition(table)).returning(),
        log,
      )) as unknown as InferSelectModel<typeof table>[];

      return Result.ok(row as InferSelectModel<typeof table>);
    } catch (error) {
      log.error({ dbError: error as string });
      return Result.error("could not update");
    }
  },

  async delete(table, condition, log, tx) {
    log.trace({ layer: "update - drizzle ops" });
    try {
      const t = tx ?? db;

      const [row] = (await drizzleOps.executeQuery(
        t.delete(table).where(condition(table)).returning(),
        log.nest(),
      )) as unknown as InferSelectModel<typeof table>[];

      return Result.ok(row as InferSelectModel<typeof table>);
    } catch (error) {
      log.error({ dbError: error as string });
      return Result.error("could not delete");
    }
  },
};

export default drizzleOps;
