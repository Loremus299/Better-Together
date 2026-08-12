import { Logger } from "@/lib/logger";
import { drizzleService } from "../ops/drizzle";
import { mediaTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { Result } from "@/lib/result";
import { s3Ops } from "../ops/s3";

async function read({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<string, string>> {
  log.trace({ layer: "media service" });
  const key = await drizzleService.readWithCondition(
    mediaTable,
    (mediaTable) => eq(mediaTable.id, id),
    db,
    log,
  );
  if (!key.value.success) return Result.error(key.value.error);
  log.info({ selectedIdData: key });

  const url = await s3Ops.readEntry(key.value.data.key, log);
  if (!url.value.success) return Result.error(url.value.error);

  log.info({ url: url.value.data });
  return Result.ok(url.value.data);
}

export const mediaService = {
  read,
};
