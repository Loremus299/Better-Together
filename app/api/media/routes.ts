import { db } from "@/db";
import { mediaTable } from "@/db/schema";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import { s3 } from "@/lib/s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const head = await headers()
  const session = await auth.api.getSession({ headers: head })
  if (!session) {
    return NextResponse.json({ error: "User session does not exist" }, { status: 401 })
  }

  const schema = z.object({
    file: z.file()
  })
  const parsedData = schema.safeParse({
    file: request.formData().then((f) => f.get("file"))
  })
  if (!parsedData.success) {
    return NextResponse.json({ error: z.treeifyError(parsedData.error) }, { status: 400 })
  }

  const key = createId()
  try {
    await s3.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: parsedData.data.file
    }))
    const dbLog = await db.insert(mediaTable).values({ key: key, owner: session.user.id }).returning({ id: mediaTable.id })
    if (!dbLog[0]) {
      throw new Error("DB log for uploaded file failed")
    }
  } catch (e) {
    await s3.send(new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key
    }))
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
  return NextResponse.json({ message: `Successfully uploaded file ${parsedData.data.file.name}` }, { status: 200 })
}