"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { cache } from "react";

async function session() {
  const head = await headers();
  return await auth.api.getSession({ headers: head });
}

export const getSession = cache(session);
