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
  log.trace({ layer: "create entry - s3 ops" });

  const key = `${createId()}-${file.type.replaceAll("/", "-")}`;
  log.data({ key });

  return (
    await Result.tryCatch({}, async () => {
      await s3.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
          Body: Buffer.from(await file.arrayBuffer()),
        }),
      );
    })
  ).match(
    () => {
      return Result.ok(key);
    },
    (e) => {
      log.error({ s3Error: e as string });
      return Result.error("Could not put data into s3");
    },
  );
}

async function readEntry({
  key,
  log,
}: {
  key: string;
  log: Logger;
}): Promise<Result<string, string>> {
  log.trace({ layer: "read entry - s3 ops" });
  log.info({ key });

  return (
    await Result.tryCatch({}, async () => {
      return await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
        }),
        { expiresIn: 3600 },
      );
    })
  ).match(
    (t) => {
      log.data({ url: t });
      return Result.ok(t);
    },
    (e) => {
      log.error({ s3Error: e as string });
      return Result.error("Could not read data from s3");
    },
  );
}

async function deleteEntry({
  key,
  log,
}: {
  key: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "delete entry - s3 ops" });
  log.info({ key });

  return (
    await Result.tryCatch({}, async () => {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
        }),
      );
    })
  ).match(
    () => {
      return Result.ok(undefined);
    },
    (e) => {
      log.error({ s3Error: e as string });
      return Result.error("Could not delete data from s3");
    },
  );
}

export const s3Ops = {
  createEntry,
  readEntry,
  deleteEntry,
};
