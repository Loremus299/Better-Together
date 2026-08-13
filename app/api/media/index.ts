import { Logger } from "@/lib/logger";
import { drizzleOps } from "../ops/drizzle";
import { mediaTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Result } from "@/lib/result";
import { s3Ops } from "../ops/s3";

async function readFile({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<string, string>> {
  log.trace({ layer: "media ops read file" });
  log.debug({ id });
  const key = await drizzleOps.readWithCondition(
    mediaTable,
    (mediaTable) => eq(mediaTable.id, id),
    log,
  );
  if (!key.value.success) return Result.error(key.value.error);

  return await s3Ops.readEntry({ key: key.value.data.key, log });
}

async function deleteFile({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "media ops delete file" });
  log.debug({ id });

  const key = await drizzleOps.readWithCondition(
    mediaTable,
    (mediaTable) => eq(mediaTable.id, id),
    log,
  );
  if (!key.value.success) return Result.error(key.value.error);

  const s3 = await s3Ops.deleteEntry({ key: key.value.data.key, log });
  const db = await drizzleOps.remove(
    mediaTable,
    (mediaTable) => eq(mediaTable.id, id),
    log,
  );

  if (s3.value.success && db.value.success) {
    return Result.ok(undefined);
  } else {
    return Result.error("Could not delete files entirely");
  }
}

export const mediaOps = {
  readFile,
  deleteFile,
};
