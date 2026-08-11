import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import { DB } from "@/lib/utils";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { PgTable, TableConfig } from "drizzle-orm/pg-core";

async function insert<T extends PgTable<TableConfig>>(
  table: T,
  data: InferInsertModel<T>,
  tx: DB,
  log: Logger,
): Promise<Result<InferSelectModel<T>, string>> {
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

export const drizzleService = {
  insert,
};
