import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region: "queer",
    endpoint: 'https://localhost:9000',
    credentials: {
        accessKeyId: env.S3_ACCESSKEYID,
        secretAccessKey: env.S3_SECRETACCESSKEY
    }
})