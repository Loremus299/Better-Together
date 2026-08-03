import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:9000",
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESSKEYID,
    secretAccessKey: env.S3_SECRETACCESSKEY,
  },
});
