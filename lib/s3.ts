import { env } from "@/env";
import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    endpoint: 'https://localhost:9000',
    credentials: {
        accessKeyId: env.S3_ACCESSKEYID,
        secretAccessKey: env.S3_SECRETACCESSKEY
    }
})

export default function createS3Bucket() {
    s3.send(new CreateBucketCommand({Bucket: env.S3_BUCKET}))
}