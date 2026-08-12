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

async function del({
  user,
  id,
  log,
}: {
  user: string;
  id: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "media service" });
  const key = await drizzleService.readWithCondition(
    mediaTable,
    (mediaTable) => eq(mediaTable.id, id),
    db,
    log,
  );
  if (!key.value.success) return Result.error(key.value.error);
  log.info({ selectedIdData: key });

  if (key.value.data.owner !== user) {
    log.error({ accessError: "User cannot access the media." });
    return Result.error("User cannot access the media");
  }

  const delFromS3 = await s3Ops.deleteEntry(key.value.data.key, log);

  if (!delFromS3.value.success) return Result.error(delFromS3.value.error);
  const x = await drizzleService.remove(
    mediaTable,
    (mediaTable) => eq(mediaTable.id, id),
    db,
    log,
  );

  if (!x.value.success) return Result.error(x.value.error);

  return Result.ok(undefined);
}

export const mediaService = {
  read,
  del,
};
