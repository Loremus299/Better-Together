import { Logger } from "@/lib/logger";
import { drizzleOps } from "../drizzle";
import { habitMembersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Result } from "@/lib/result";

async function isUserMember({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<boolean, string>> {
  log.trace({ layer: "habit is member op" });
  log.debug({ user, habit });
  return (
    await drizzleOps.readAllWithCondition(
      habitMembersTable,
      (habitMembersTable) =>
        and(
          eq(habitMembersTable.habit, habit),
          eq(habitMembersTable.member, user),
          eq(habitMembersTable.role, "member"),
        ),
      log,
    )
  ).mapOk((t) => {
    log.debug({ record: t });
    if (t.length == 0) {
      return false;
    } else {
      return true;
    }
  });
}

async function isUserAdmin({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}) {
  log.trace({ layer: "habit is admin op" });
  log.debug({ user, habit });
  return (
    await drizzleOps.readAllWithCondition(
      habitMembersTable,
      (habitMembersTable) =>
        and(
          eq(habitMembersTable.habit, habit),
          eq(habitMembersTable.member, user),
          eq(habitMembersTable.role, "admin"),
        ),
      log,
    )
  ).mapOk((t) => {
    log.debug({ record: t });
    if (t.length == 0) {
      return false;
    } else {
      return true;
    }
  });
}

async function isUserChecker({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}) {
  log.trace({ layer: "habit is checker op" });
  log.debug({ user, habit });
  return (
    await drizzleOps.readAllWithCondition(
      habitMembersTable,
      (habitMembersTable) =>
        and(
          eq(habitMembersTable.habit, habit),
          eq(habitMembersTable.member, user),
          eq(habitMembersTable.role, "checker"),
        ),
      log,
    )
  ).mapOk((t) => {
    log.debug({ record: t });
    if (t.length == 0) {
      return false;
    } else {
      return true;
    }
  });
}

export const habitOps = {
  isUserAdmin,
  isUserMember,
  isUserChecker,
};
