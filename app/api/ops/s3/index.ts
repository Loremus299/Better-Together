import { env } from "@/env";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import { s3 } from "@/lib/s3";
import { DB } from "@/lib/utils";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";

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

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
      }),
    );
    return Result.ok(key);
  } catch (error) {
    log.error({ s3Error: error as string });
    return Result.error("Failed to create file in s3");
  }
}

async function deleteEntry(
  key: string,
  log: Logger,
): Promise<Result<undefined, string>> {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      }),
    );
    return Result.ok(undefined);
  } catch (error) {
    log.error({ s3Error: error as string });
    return Result.error("Could not delete file from s3");
  }
}

export const s3Ops = {
  createEntry,
  deleteEntry,
};
