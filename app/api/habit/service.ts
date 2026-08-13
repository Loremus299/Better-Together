import { habitMembersTable, habitTable, habitTasksTable } from "@/db/schema";
import { drizzleOps } from "../ops/drizzle";
import { Logger } from "@/lib/logger";
import { eq, InferSelectModel } from "drizzle-orm";
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
}): Promise<Result<void, string>> {
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
  const habits: InferSelectModel<typeof habitTable>[] = [];
  const query = (
    await drizzleOps.readAllWithCondition(
      habitMembersTable,
      (habitMembersTable) => eq(habitMembersTable.member, user),
      log,
    )
  ).mapOk(async (t) => {
    for (const i of t) {
      (
        await drizzleOps.readWithCondition(
          habitTable,
          (habitTable) => eq(habitTable.id, i.habit),
          log,
        )
      ).match(
        (t) => {
          habits.push(t);
        },
        (e) => {
          log.warn({ error: e });
        },
      );
    }
  });

  return query.value.success
    ? Result.ok(habits)
    : Result.error(query.value.error);
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

export const habitService = {
  create,
  readHabitsByUser,
  readHabit,
  updateHeader,
  updateHabit,
  deleteHabit,
};
