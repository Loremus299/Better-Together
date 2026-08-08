"use server";

import { headers } from "next/headers";
import { isError, isOk, Result } from "./result";
import { auth } from "./auth";
import { cache } from "react";

async function getUserId(): Promise<Result<string, null>> {
  const head = await headers();
  const session = await auth.api.getSession({ headers: head });

  if (session?.user) {
    return isOk(session.user.id);
  }
  return isError(null);
}

export const userId = cache(getUserId);
