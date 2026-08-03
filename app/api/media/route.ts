import { db } from "@/db";
import { mediaTable } from "@/db/schema";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { useLogger, withEvlog } from "@/lib/evlog";
import { s3 } from "@/lib/s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const GET = withEvlog(async (request: NextRequest) => {
  const log = useLogger();
  const head = await headers();
  const session = await auth.api.getSession({ headers: head });
  if (!session) {
    return NextResponse.json(
      { error: "User session does not exist" },
      { status: 401 },
    );
  }
  log.set({ user: session.user.id });

  const schema = z.object({
    id: z.string().min(1),
  });
  const data = await request.formData();
  const parsedData = schema.safeParse({ id: data.get("id") });
  if (!parsedData.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsedData.error) },
      { status: 400 },
    );
  }
  log.set({ id: parsedData.data.id });

  const key = await db
    .select({ key: mediaTable.key })
    .from(mediaTable)
    .where(
      and(
        eq(mediaTable.id, parsedData.data.id),
        eq(mediaTable.owner, session.user.id),
      ),
    );
  if (!key[0]) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  log.set({ key: key[0].key });

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key[0].key,
    }),
    { expiresIn: 3600 },
  );
  return NextResponse.json({ log: url }, { status: 200 });
});

export const POST = withEvlog(
  async (request: NextRequest): Promise<NextResponse> => {
    const log = useLogger();
    const head = await headers();
    const session = await auth.api.getSession({ headers: head });
    if (!session) {
      return NextResponse.json(
        { error: "User session does not exist" },
        { status: 401 },
      );
    }
    log.set({ user: session.user.id });

    const schema = z.object({
      file: z.file(),
    });
    const data = await request.formData();
    const parsedData = schema.safeParse({ id: data.get("file") });
    if (!parsedData.success) {
      return NextResponse.json(
        { error: z.treeifyError(parsedData.error) },
        { status: 400 },
      );
    }
    log.set({ fileName: parsedData.data.file.name });

    const key = `${createId()}-${parsedData.data.file.type.replaceAll("/", "-")}`;
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
          Body: Buffer.from(await parsedData.data.file.arrayBuffer()),
        }),
      );
      const dbLog = await db
        .insert(mediaTable)
        .values({ key: key, owner: session.user.id })
        .returning({ id: mediaTable.id });
      if (dbLog.length == 0) {
        throw new Error("DB log for uploaded file failed");
      }
      log.set({ id: dbLog[0].id, key: key });
      return NextResponse.json({ log: dbLog[0].id }, { status: 200 });
    } catch (e) {
      log.set({ error: e });
      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
        }),
      );
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withEvlog(
  async (request: NextRequest): Promise<NextResponse> => {
    const log = useLogger();
    const head = await headers();
    const session = await auth.api.getSession({ headers: head });
    if (!session) {
      return NextResponse.json(
        { error: "User session does not exist" },
        { status: 401 },
      );
    }
    log.set({ user: session.user.id });

    const schema = z.object({
      id: z.string().min(1),
    });
    const data = await request.formData();
    const parsedData = schema.safeParse({ id: data.get("id") });
    if (!parsedData.success) {
      return NextResponse.json(
        { error: z.treeifyError(parsedData.error) },
        { status: 400 },
      );
    }
    log.set({ id: parsedData.data.id });

    const key = await db
      .delete(mediaTable)
      .where(
        and(
          eq(mediaTable.id, parsedData.data.id),
          eq(mediaTable.owner, session.user.id),
        ),
      )
      .returning({ key: mediaTable.key });

    if (!key[0]) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    log.set({ key: key[0].key });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key[0].key,
      }),
    );

    return NextResponse.json(
      { log: "successfully deleted file" },
      { status: 200 },
    );
  },
);
