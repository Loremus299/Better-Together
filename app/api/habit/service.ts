import {
  habitMembersTable,
  habitTable,
  habitTasksTable,
  user,
} from "@/db/schema";
import { drizzleOps } from "../ops/drizzle";
import { Logger } from "@/lib/logger";
import { and, eq, InferSelectModel } from "drizzle-orm";
import { Result } from "@/lib/result";

async function create({
  user,
  name,
  description,
  header,
  log,
}: {
  user: string;
  name: string;
  description: string;
  header?: string;
  log: Logger;
}): Promise<Result<string, string>> {
  log.trace({ layer: "habit service create" });
  log.info({ user, name, description, header });
  return (
    await drizzleOps.insert(habitTable, { name, description, header }, log)
  ).mapOk((t) => {
    drizzleOps.insert(
      habitMembersTable,
      {
        habit: t.id,
        member: user,
        role: "admin",
      },
      log,
    );
    drizzleOps.insert(
      habitTasksTable,
      {
        habit: t.id,
        task: "Invite partner",
        description: "Invite your partner to hold each other accountable",
      },
      log,
    );
    drizzleOps.insert(
      habitTasksTable,
      {
        habit: t.id,
        task: "Add habits",
        description: "Add habits to do together everyday.",
      },
      log,
    );
    return t.id;
  });
}

async function readHabit({
  habit,
  log,
}: {
  habit: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service read" });
  log.info({ habit });
  return await drizzleOps.readWithCondition(
    habitTable,
    (habitTable) => eq(habitTable.id, habit),
    log,
  );
}

async function readHabitsByUser({
  user,
  log,
}: {
  user: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  log.trace({ layer: "habit service read all by user" });
  log.info({ user });
  const query = await drizzleOps.readAllWithCondition(
    habitMembersTable,
    (habitMembersTable) => eq(habitMembersTable.member, user),
    log,
  );

  return query.match(
    async (members) => {
      const rows = await Promise.all(
        members.map((m) =>
          drizzleOps.readWithCondition(
            habitTable,
            (habitTable) => eq(habitTable.id, m.habit),
            log,
          ),
        ),
      );

      const habits: InferSelectModel<typeof habitTable>[] = [];
      for (const r of rows) {
        r.match(
          (h) => {
            habits.push(h);
            return;
          },
          (e) => log.warn({ error: e }),
        );
      }
      return Result.ok(habits);
    },
    async (e) => Result.error<InferSelectModel<typeof habitTable>[], string>(e),
  );
}

async function updateHeader({
  header,
  habit,
  log,
}: {
  header: string;
  habit: string;
  log: Logger;
}): Promise<Result<void, string>> {
  log.trace({ layer: "habit service updaet header" });
  log.info({ habit, header });
  return await drizzleOps.update(
    habitTable,
    { header: header },
    (habitTable) => eq(habitTable.id, habit),
    log,
  );
}

async function updateHabit({
  habit,
  name,
  description,
  log,
}: {
  habit: string;
  name: string;
  description: string;
  log: Logger;
}): Promise<Result<void, string>> {
  log.trace({ layer: "habit service update habit" });
  log.info({ habit, name, description });
  return await drizzleOps.update(
    habitTable,
    { name, description },
    (habitTable) => eq(habitTable.id, habit),
    log,
  );
}

async function deleteHabit({ habit, log }: { habit: string; log: Logger }) {
  log.trace({ layer: "habit service update delete" });
  log.info({ habit });

  return await drizzleOps.remove(
    habitTable,
    (habitTable) => eq(habitTable.id, habit),
    log,
  );
}

async function addMember({
  habit,
  email,
  log,
}: {
  habit: string;
  email: string;
  log: Logger;
}) {
  log.trace({ layer: "habit service add member" });
  log.info({ habit, email });
  const userDetails = await drizzleOps.readWithCondition(
    user,
    (user) => eq(user.email, email),
    log,
  );

  if (!userDetails.value.success)
    return Result.error("Could not get data about user");

  return await drizzleOps.insert(
    habitMembersTable,
    { habit, member: userDetails.value.data.id, role: "member" },
    log,
  );
}

async function readMembersByHabit({
  habit,
  log,
}: {
  habit: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof user>[], string>> {
  log.trace({ layer: "habit service read member by id" });
  log.info({ habit });
  const members = await drizzleOps.readAllWithCondition(
    habitMembersTable,
    (habitMembersTable) => eq(habitMembersTable.habit, habit),
    log,
  );

  if (!members.value.success) {
    return Result.error("Could not find habit members");
  }

  const userDetails = [];
  for (const member of members.value.data) {
    const memberDetails = await drizzleOps.readWithCondition(
      user,
      (user) => eq(user.id, member.member),
      log,
    );
    if (!memberDetails.value.success) {
      return Result.error(`could not find user details for link ${member.id}`);
    }

    userDetails.push(memberDetails.value.data);
  }
  return Result.ok(userDetails);
}

async function removeMemberById({
  habit,
  user,
  log,
}: {
  habit: string;
  user: string;
  log: Logger;
}) {
  log.trace({ layer: "habit service remove member by id" });
  log.info({ habit, user });
  return await drizzleOps.remove(
    habitMembersTable,
    (habitMembersTable) =>
      and(
        eq(habitMembersTable.habit, habit),
        eq(habitMembersTable.member, user),
        eq(habitMembersTable.role, "member"),
      ),
    log,
  );
}

export const habitService = {
  create,
  readHabitsByUser,
  readHabit,
  updateHeader,
  updateHabit,
  deleteHabit,

  addMember,
  readMembersByHabit,
  removeMemberById,
};
