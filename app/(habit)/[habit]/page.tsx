import { habitService } from "@/app/api/habit/service";
import { habitOps } from "@/app/api/ops/habit";
import { Logger } from "@/lib/logger";
import { getSession } from "@/lib/server-util";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ habit: string }>;
}) {
  const log = new Logger();
  const { habit } = await params;
  const session = await getSession();
  if (!session) {
    log.print();
    redirect("/auth/login");
  }

  const isAdmin = await habitOps.isUserAdmin({
    user: session.user.id,
    habit,
    log,
  });
  const isMember = await habitOps.isUserMember({
    user: session.user.id,
    habit,
    log,
  });
  const habitdata = await habitService.readHabit({ habit, log });

  if (
    !isAdmin.value.success ||
    !isMember.value.success ||
    !habitdata.value.success
  ) {
    log.print();
    redirect(
      `/error?e=${encodeURI("Failed to load initial data")}&id=${log.getId()}`,
    );
  }

  if (!isAdmin.value.data && !isMember.value.data) {
    redirect(
      `/error?e=${encodeURI("You do not have access to this habit")}&id=${log.getId()}`,
    );
  }

  log.print();

  return <div>Hi</div>;
}
