import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import { s3Ops } from "../ops/s3";
import drizzleOps from "../ops/drizzle";
import { mediaTable } from "@/db/schema";

function isTooLarge(file: File) {
  return file.size > 4_500;
}

async function add({
  user,
  file,
  log,
}: {
  user: string;
  file: File;
  log: Logger;
}): Promise<Result<string, string>> {
  log.trace({ layer: "media service - add" });
  log.debug({ user, fileName: file.name, fileSize: file.size });

  if (isTooLarge(file)) return Result.error("File too large");

  const addS3 = await s3Ops.createEntry(file, log.nest());
  if (!addS3.value.success) return Result.error(addS3.value.error);

  const addDB = await drizzleOps.insert(
    mediaTable,
    {
      key: addS3.value.data,
      owner: user,
    },
    log.nest(),
  );

  if (!addDB.value.success) {
    await s3Ops.deleteEntry(addS3.value.data, log.nest());
    return Result.error(addDB.value.error);
  }

  return Result.ok(addS3.value.data);
}

async function read({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<string, string>> {
  log.trace({ layer: "media service - read" });
  log.debug({ id });

  const keyRow = await drizzleOps.readTableUnique(
    mediaTable,
    { id },
    log.nest(),
  );
  if (!keyRow.value.success) return Result.error(keyRow.value.error);

  return await s3Ops.readEntry(keyRow.value.data.key, log.nest());
}

async function remove({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "media service - remove" });
  log.debug({ id });

  const keyRow = await drizzleOps.readTableUnique(
    mediaTable,
    { id },
    log.nest(),
  );
  if (!keyRow.value.success) return Result.error(keyRow.value.error);

  return await s3Ops.deleteEntry(keyRow.value.data.key, log.nest());
}

const mediaService = {
  add,
  read,
  remove,
};

export default mediaService;
