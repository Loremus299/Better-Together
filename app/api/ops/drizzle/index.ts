import { db } from "@/db";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import { DB } from "@/lib/utils";
import { and, InferInsertModel, InferSelectModel, or, SQL } from "drizzle-orm";
import { AnyPgTable } from "drizzle-orm/pg-core";

async function insert<T extends AnyPgTable>(
  table: T,
  data: InferInsertModel<T>,
  tx: DB,
  log: Logger,
): Promise<Result<InferSelectModel<T>, string>> {
  log.trace({ layer: "drizzle ops service" });
  try {
    log.debug(data);
    const rows = (await tx
      .insert(table)
      .values(data)
      .returning()) as InferSelectModel<T>[];
    const row = rows[0];
    log.debug({ insertedData: row });
    return Result.ok(row);
  } catch (error) {
    log.error({ dbError: error as string });
    return Result.error("Could not insert data into table");
  }
}

async function readAllWithCondition<T extends AnyPgTable>(
  table: AnyPgTable,
  condition: (
    t: AnyPgTable,
  ) => SQL | ReturnType<typeof and> | ReturnType<typeof or>,
  tx: DB,
  log: Logger,
): Promise<Result<InferSelectModel<T>[], string>> {
  log.trace({ layer: "drizzle ops service" });
  try {
    const data = (await tx
      .select()
      .from(table)
      .where(condition(table))) as InferSelectModel<T>[];
    return Result.ok(data);
  } catch (error) {
    log.error({ dbError: error as string });
    return Result.error("Could not delete from table");
  }
}

async function remove(
  table: AnyPgTable,
  condition: (t: AnyPgTable) => SQL | ReturnType<typeof and>,
  tx: DB,
  log: Logger,
): Promise<Result<undefined, string>> {
  log.trace({ layer: "drizzle ops service" });
  try {
    await tx.delete(table).where(condition(table));
    return Result.ok(undefined);
  } catch (error) {
    log.error({ dbError: error as string });
    return Result.error("Could not delete from table");
  }
}

export const drizzleService = {
  insert,
  remove,
  readAllWithCondition,
};
