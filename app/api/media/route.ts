import { auth } from "@/lib/auth";
import { Logger } from "@/lib/logger";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { s3Ops } from "../ops/s3";
import { drizzleOps } from "../ops/drizzle";
import { mediaTable } from "@/db/schema";

export async function POST(req: NextRequest) {
  const log = new Logger();
  log.info({ layer: "api/media POST" });
  try {
    const head = await headers();
    log.debug({ headers: head });
    const session = await auth.api.getSession({ headers: head });

    if (!session) {
      log.error({ error: "No user session found" });
      return NextResponse.json(
        {
          error: "No user session found",
          request: log.getId(),
        },
        { status: 401 },
      );
    }
    log.info({ user: session.user.id });

    const data = await req.formData();
    const file = data.get("file") as File;
    if (
      !(
        ["image/png", "image/jpeg", "image/gif"].includes(file.type) &&
        file.size < 4.5 * 1024 * 1024
      )
    ) {
      log.error({ error: "File validation failed" });
      return NextResponse.json(
        {
          error: "Invalid file, must be png, jpeg, gif smaller than 10mb",
          request: log.getId(),
        },
        {
          status: 400,
        },
      );
    }
    log.info({ file: `${file.name}-${file.size}-${file.type}` });

    const key = await s3Ops.createEntry({ file, log });
    if (!key.value.success)
      return NextResponse.json({
        error: key.value.error,
        request: log.getId(),
      });

    const mediaTableLog = await drizzleOps.insert(
      mediaTable,
      {
        key: key.value.data,
        owner: session.user.id,
      },
      log,
    );

    if (!mediaTableLog.value.success) {
      (await s3Ops.deleteEntry({ key: key.value.data, log: log })).mapError(
        () =>
          log.error({
            error: "media table log failed, s3 delete failed as well",
          }),
      );
      return NextResponse.json(
        {
          error: mediaTableLog.value.error,
          request: log.getId(),
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      { id: mediaTableLog.value.data.id, request: log.getId() },
      { status: 200 },
    );
  } catch {
    log.error({ error: "Internal Server error" });
    return NextResponse.json(
      {
        error: "Internal Server Error",
        request: log.getId(),
      },
      { status: 500 },
    );
  } finally {
    log.print();
  }
}
