import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
    server: {
        BETTER_AUTH_SECRET: z.base64().length(32).default('KoWndF16ygEvCKiEv5iLrKauH8X3cYIr'),
        BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
        DATABASE_URL: z.url().default('postgres://testing:queer@localhost:5432/testing')
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});