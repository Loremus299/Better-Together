import { auth } from "@/lib/auth";
import { Logger } from "@/lib/logger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { notificationService } from "./service";

export async function GET() {
  const log = new Logger();
  log.info({ layer: "GET on /api/notification" });
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json(
        {
          error: "No session found",
          requestId: log.getId(),
        },
        { status: 401 },
      );
    }
    log.info({ session });

    const data = await notificationService.getUnreadNotifsForUser({
      user: session.user.id,
      log,
    });

    if (!data.value.success)
      return NextResponse.json(
        { error: data.value.error, requestId: log.getId() },
        { status: 500 },
      );

    return NextResponse.json(
      { data: data.value.data, requestId: log.getId() },
      { status: 200 },
    );
  } finally {
    log.print();
  }
}
