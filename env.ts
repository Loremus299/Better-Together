import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
    server: {
        BETTER_AUTH_SECRET: z.url(),
        BETTER_AUTH_URL: z.url(),
        DATABASE_URL: z.url()
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});