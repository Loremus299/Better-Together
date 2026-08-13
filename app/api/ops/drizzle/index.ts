import { db } from "@/db";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import { and, InferInsertModel, InferSelectModel, or, SQL } from "drizzle-orm";
import { AnyPgTable } from "drizzle-orm/pg-core";

async function insert<T extends AnyPgTable>(
  table: T,
  data: InferInsertModel<T>,
  log: Logger,
): Promise<Result<InferSelectModel<T>, string>> {
  log.trace({ layer: "drizzle ops insert" });
  log.data({ ...data });
  return (
    await Result.tryCatch({}, async () => {
      return (await db
        .insert(table)
        .values(data)
        .returning()) as InferSelectModel<T>;
    })
  ).match(
    (t) => {
      log.debug({ ...t });
      return Result.ok(t);
    },
    (e) => {
      log.error({ dbError: e as string });
      return Result.error("DB operation failed - failed to insert data");
    },
  );
}

async function readAllWithCondition<T extends AnyPgTable>(
  table: T,
  condition: (t: T) => SQL | ReturnType<typeof and> | ReturnType<typeof or>,
  log: Logger,
): Promise<Result<InferSelectModel<T>[], string>> {
  log.trace({ layer: "drizzle ops read all with condition" });
  return (
    await Result.tryCatch({}, async () => {
      return (await db
        .select()
        .from(table as AnyPgTable)
        .where(condition(table))) as InferSelectModel<T>[];
    })
  ).match(
    (t) => {
      log.debug({ allData: t.toString() });
      return Result.ok(t);
    },
    (e) => {
      log.error({ dbError: e as string });
      return Result.error("DB operation failed - failed to read data");
    },
  );
}

async function readWithCondition<T extends AnyPgTable>(
  table: T,
  condition: (t: T) => SQL | ReturnType<typeof and> | ReturnType<typeof or>,
  log: Logger,
): Promise<Result<InferSelectModel<T>, string>> {
  log.trace({ layer: "drizzle ops read with condition" });
  return (
    await Result.tryCatch({}, async () => {
      return await db
        .select()
        .from(table as AnyPgTable)
        .where(condition(table));
    })
  ).match(
    (t) => {
      log.debug({ ...t });
      if (t.length == 0) {
        log.error({ dbError: "read with condition returned an empty array" });
        return Result.error("DB operation failed - Could not find data");
      } else {
        return Result.ok(t[0] as InferSelectModel<T>);
      }
    },
    (e) => {
      log.error({ dbError: e as string });
      return Result.error("DB operation failed - failed to read data");
    },
  );
}

async function update<T extends AnyPgTable>(
  table: AnyPgTable,
  data: Partial<InferInsertModel<T>>,
  condition: (
    t: AnyPgTable,
  ) => SQL | ReturnType<typeof and> | ReturnType<typeof or>,
  log: Logger,
): Promise<Result<undefined, string>> {
  log.trace({ layer: "drizzle ops update" });
  log.data({ ...data });
  return (
    await Result.tryCatch({}, async () => {
      return await db.update(table).set(data).returning();
    })
  ).match(
    (t) => {
      log.debug({ ...t });
      return Result.ok(undefined);
    },
    (e) => {
      log.error({ dbError: e as string });
      return Result.error("DB Operation failed - failed to update data");
    },
  );
}

async function remove<T extends AnyPgTable>(
  table: T,
  condition: (t: T) => SQL | ReturnType<typeof and>,
  log: Logger,
): Promise<Result<undefined, string>> {
  log.trace({ layer: "drizzle ops remove" });
  return (
    await Result.tryCatch({}, async () => {
      return await db.delete(table).where(condition(table)).returning();
    })
  ).match(
    (t) => {
      log.debug({ ...t });
      return Result.ok(undefined);
    },
    (e) => {
      log.error({ dbError: e as string });
      return Result.error("DB Operation failed - failed to update data");
    },
  );
}

export const drizzleService = {
  insert,
  readAllWithCondition,
  readWithCondition,
  update,
  remove,
};
