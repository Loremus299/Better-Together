import { env } from "@/env";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import { s3 } from "@/lib/s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function createEntry({
  file,
  log,
}: {
  file: File;
  log: Logger;
}): Promise<Result<string, string>> {
  log.trace({ layer: "ops s3 service" });

  const key = `${createId()}-${file.type.replaceAll("/", "-")}`;
  log.info({ key });

  const x = await Result.tryCatch({}, async () => {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
      }),
    );
  });

  if (x.value.success) {
    return Result.ok(key);
  } else {
    log.error({ s3Error: x.value.error });
    return Result.error("Could not create");
  }
}

async function readEntry(
  key: string,
  log: Logger,
): Promise<Result<string, string>> {
  log.trace({ layer: "ops s3 service" });
  log.debug({ key });
  const x = await Result.tryCatch({}, async () => {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
      { expiresIn: 3600 },
    );
  });

  if (x.value.success) {
    return Result.ok(key);
  } else {
    log.error({ s3Error: x.value.error });
    return Result.error("Could not read");
  }
}

async function deleteEntry(
  key: string,
  log: Logger,
): Promise<Result<undefined, string>> {
  log.trace({ layer: "ops s3 service" });
  log.debug({ key });
  const x = await Result.tryCatch({}, async () => {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
    );
  });

  if (x.value.success) {
    return Result.ok(undefined);
  } else {
    log.error({ s3Error: x.value.error });
    return Result.error("Could not delete");
  }
}

export const s3Ops = {
  createEntry,
  readEntry,
  deleteEntry,
};
