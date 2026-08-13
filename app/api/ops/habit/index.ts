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
  return (
    await drizzleOps.readAllWithCondition(
      habitMembersTable,
      (habitMembersTable) =>
        and(
          eq(habitMembersTable.id, habit),
          eq(habitMembersTable.member, user),
          eq(habitMembersTable.role, "member"),
        ),
      log,
    )
  ).mapOk((t) => {
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
  return (
    await drizzleOps.readAllWithCondition(
      habitMembersTable,
      (habitMembersTable) =>
        and(
          eq(habitMembersTable.id, habit),
          eq(habitMembersTable.member, user),
          eq(habitMembersTable.role, "admin"),
        ),
      log,
    )
  ).mapOk((t) => {
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
};
