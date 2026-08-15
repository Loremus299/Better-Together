import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .url()
      .default("postgres://testing:queer@localhost:5432/testing"),

    BETTER_AUTH_SECRET: z
      .base64()
      .length(32)
      .default("KoWndF16ygEvCKiEv5iLrKauH8X3cYIr"),

    S3_REGION: z.string().default("us-east-1"),
    S3_ENDPOINT: z.string().default("http://localhost:9000"),
    S3_ACCESSKEYID: z.string().default("testing"),
    S3_SECRETACCESSKEY: z.string().default("queer"),
    S3_BUCKET: z.string().default("mouth"),

    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
