import { auth } from "@/lib/auth";
import { Logger } from "@/lib/logger";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { s3Ops } from "../ops/s3";
import { drizzleService } from "../ops/drizzle";
import { mediaTable } from "@/db/schema";
import { db } from "@/db";

export async function POST(req: NextRequest) {
  const log = new Logger();
  try {
    log.trace({ layer: "api/media POST" });

    const head = await headers();
    const session = await auth.api.getSession({ headers: head });
    if (!session) {
      log.error({ "401": "Session not found" });
      return NextResponse.json(
        {
          error: "Could not find active user session",
          request: log.getId(),
        },
        { status: 401 },
      );
    }
    log.info({ user: session.user.id });

    const schema = z.object({
      file: z
        .file()
        .refine(
          (item) =>
            ["image/gif", "image/png", "image/jpeg"].includes(item.type) &&
            item.size < 10 * 1024 * 1024,
          "Invalid file, must be gif, png, jpeg < 10mb",
        ),
    });
    const data = await req.formData();
    const file = data.get("file") as File;
    log.info({ name: file.name, size: file.size, type: file.type });
    const parsedData = schema.safeParse({ file });

    if (!parsedData.success) {
      log.error({ "400": z.treeifyError(parsedData.error) });
      return NextResponse.json(
        {
          error: z.treeifyError(parsedData.error),
          request: log.getId(),
        },
        { status: 400 },
      );
    }

    const s3op = await s3Ops.createEntry({ file, log });
    if (!s3op.value.success) {
      return NextResponse.json(
        { error: s3op.value.error, request: log.getId() },
        { status: 500 },
      );
    }
    log.info({ key: s3op.value.data });

    const drizzleOp = await drizzleService.insert(
      mediaTable,
      {
        key: s3op.value.data,
        owner: session.user.id,
      },
      db,
      log,
    );
    if (!drizzleOp.value.success) {
      const s3op2 = await s3Ops.deleteEntry(s3op.value.data, log);
      s3op2.mapError(async (e) => log.error({ s3Error: e }));
      return NextResponse.json(
        {
          error: drizzleOp.value.error,
          request: log.getId(),
        },
        {
          status: 500,
        },
      );
    }
    log.debug({ ...drizzleOp.value.data });

    return NextResponse.json(
      { key: s3op.value.data, request: log.getId() },
      { status: 200 },
    );
  } catch {
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
