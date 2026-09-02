import {
  habitMembersTable,
  habitProofsTable,
  habitTable,
  habitTasksTable,
  user,
} from "@/db/schema";
import { drizzleOps } from "../ops/drizzle";
import { Logger } from "@/lib/logger";
import { and, eq, InferSelectModel, notInArray } from "drizzle-orm";
import { Result } from "@/lib/result";
import { notifOps } from "../ops/notification";

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
  excludeRoles,
}: {
  user: string;
  log: Logger;
  excludeRoles?: ("admin" | "member" | "checker")[];
}): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  log.trace({ layer: "habit service read all by user" });
  log.info({ user });

  const condition =
    excludeRoles && excludeRoles.length > 0
      ? (t: typeof habitMembersTable) =>
          and(eq(t.member, user), notInArray(t.role, excludeRoles))
      : (t: typeof habitMembersTable) => eq(t.member, user);

  const query = await drizzleOps.readAllWithCondition(
    habitMembersTable,
    condition,
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
}): Promise<
  Result<
    {
      habit: string;
      id: string;
      role: "member" | "admin" | "checker";
      member: string;
    },
    string
  >
> {
  log.trace({ layer: "habit service add member" });
  log.info({ habit, email });
  const userDetails = await drizzleOps.readWithCondition(
    user,
    (user) => eq(user.email, email),
    log,
  );

  if (!userDetails.value.success)
    return Result.error("Could not get data about user");

  const ud = userDetails.value.data;

  const duplication = await drizzleOps.readWithCondition(
    habitMembersTable,
    (t) => and(eq(t.habit, habit), eq(t.member, ud.id)),
    log,
  );

  if (!duplication.value.success) {
    log.trace({ error: "User already exists" });
    return Result.error("User is already in habit.");
  }

  const data = await drizzleOps.insert(
    habitMembersTable,
    { habit, member: userDetails.value.data.id, role: "member" },
    log,
  );

  if (!data.value.success) return Result.error(data.value.error);

  const habitData = await readHabit({ habit, log });
  if (!habitData.value.success) return Result.error(habitData.value.error);

  await notifOps.addNotif({
    user: userDetails.value.data.id,
    title: `You were added in habit "${habitData.value.data.name}"`,
    body: "If not you, ask to removed and check how your email was added. This can be dangerous. (ᵕ•́ -•̀)",
    log,
  });

  return Result.ok(data.value.data);
}

async function addMemberAsChecker({
  habit,
  email,
  log,
}: {
  habit: string;
  email: string;
  log: Logger;
}): Promise<
  Result<
    {
      habit: string;
      id: string;
      role: "member" | "admin" | "checker";
      member: string;
    },
    string
  >
> {
  log.trace({ layer: "habit service add member" });
  log.info({ habit, email });
  const userDetails = await drizzleOps.readWithCondition(
    user,
    (user) => eq(user.email, email),
    log,
  );

  if (!userDetails.value.success)
    return Result.error("Could not get data about user");

  const data = await drizzleOps.insert(
    habitMembersTable,
    { habit, member: userDetails.value.data.id, role: "checker" },
    log,
  );

  if (!data.value.success) return Result.error(data.value.error);

  const habitData = await readHabit({ habit, log });
  if (!habitData.value.success) return Result.error(habitData.value.error);

  await notifOps.addNotif({
    user: userDetails.value.data.id,
    title: `You were added in habit "${habitData.value.data.name} as a checker"`,
    body: "If not you, ask to removed and check how your email was added. This can be dangerous. (ᵕ•́ -•̀)",
    log,
  });

  return Result.ok(data.value.data);
}

async function readMembersByHabit({
  habit,
  log,
  checksAndAdmins,
}: {
  habit: string;
  log: Logger;
  checksAndAdmins?: boolean;
}): Promise<Result<InferSelectModel<typeof user>[], string>> {
  log.trace({ layer: "habit service read member by id" });
  log.info({ habit });
  const membersFunction = async () => {
    if (checksAndAdmins) {
      return await drizzleOps.readAllWithCondition(
        habitMembersTable,
        (habitMembersTable) => eq(habitMembersTable.habit, habit),

        log,
      );
    } else {
      return await drizzleOps.readAllWithCondition(
        habitMembersTable,
        (habitMembersTable) =>
          and(
            eq(habitMembersTable.habit, habit),
            eq(habitMembersTable.role, "member"),
          ),
        log,
      );
    }
  };
  const members = await membersFunction();

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

async function removeMemberByEmail({
  habit,
  email,
  log,
}: {
  habit: string;
  email: string;
  log: Logger;
}) {
  log.trace({ layer: "habit service remove member by id" });
  log.info({ habit, email });

  const userDetails = await drizzleOps.readWithCondition(
    user,
    (user) => eq(user.email, email),
    log,
  );

  if (!userDetails.value.success) {
    return Result.error(userDetails.value.error);
  }

  const x = userDetails.value.data;

  return await drizzleOps.remove(
    habitMembersTable,
    (habitMembersTable) =>
      and(
        eq(habitMembersTable.habit, habit),
        eq(habitMembersTable.member, x.id),
        eq(habitMembersTable.role, "member"),
      ),
    log,
  );
}

async function addTaskInHabit({
  task,
  description,
  habit,
  log,
}: {
  task: string;
  description: string;
  habit: string;
  log: Logger;
}): Promise<
  Result<
    {
      id: string;
      habit: string;
      description: string;
      createdAt: Date;
      updatedAt: Date;
      task: string;
    },
    string
  >
> {
  log.trace({ layer: "habit service add task in habit" });
  log.info({ habit, task, description });

  const taskDetails = await drizzleOps.insert(
    habitTasksTable,
    { task, description, habit },
    log,
  );

  if (!taskDetails.value.success) return Result.error(taskDetails.value.error);

  const members = await readMembersByHabit({
    habit,
    log,
    checksAndAdmins: false,
  });
  const habitData = await readHabit({ habit, log });

  if (!members.value.success) return Result.error(members.value.error);
  if (!habitData.value.success) return Result.error(habitData.value.error);

  for (const member of members.value.data) {
    await notifOps.addNotif({
      user: member.id,
      title: `Task added in "${habitData.value.data.name}"`,
      body: `Admin added task "${task}" in "${habitData.value.data.name}" (ó﹏ò｡) More work comes your way.`,
      log,
    });
  }

  return Result.ok(taskDetails.value.data);
}

async function readTasksByHabit({
  habit,
  log,
}: {
  habit: string;
  log: Logger;
}) {
  log.trace({ layer: "habit service read tasks by habit" });
  log.info({ habit });

  return await drizzleOps.readAllWithCondition(
    habitTasksTable,
    (habitTasksTable) => eq(habitTasksTable.habit, habit),
    log,
  );
}

async function readTaskById({ id, log }: { id: string; log: Logger }) {
  log.trace({ layer: "habit service read tasks by habit" });
  log.info({ id });

  return await drizzleOps.readWithCondition(
    habitTasksTable,
    (habitTasksTable) => eq(habitTasksTable.id, id),
    log,
  );
}

async function readTaskByUser({
  user,
  log,
}: {
  user: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTasksTable>[][], string>> {
  log.trace({ layer: "habit service read tasks by user" });
  log.info({ user });

  const habits = await readHabitsByUser({
    user,
    log,
    excludeRoles: ["checker"],
  });

  if (!habits.value.success) return Result.error(habits.value.error);

  const tasks: InferSelectModel<typeof habitTasksTable>[][] = [];
  for (const habit of habits.value.data) {
    const habitTasks = await readTasksByHabit({ habit: habit.id, log });
    if (!habitTasks.value.success) return Result.error(habitTasks.value.error);
    tasks.push(habitTasks.value.data);
  }

  return Result.ok(tasks);
}

async function updateTask({
  task,
  description,
  id,
  log,
}: {
  task: string;
  description: string;
  id: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "habit service update task" });
  log.info({ id, task, description });

  const oldtask = await readTaskById({ id, log });

  const updateTask = await drizzleOps.update(
    habitTasksTable,
    { task, description },
    (habitTasksTable) => eq(habitTasksTable.id, id),
    log,
  );

  if (!oldtask.value.success) return Result.error(oldtask.value.error);
  if (!updateTask.value.success) return Result.error(updateTask.value.error);

  const members = await readMembersByHabit({
    habit: oldtask.value.data.habit,
    log,
    checksAndAdmins: false,
  });
  const habitData = await readHabit({ habit: oldtask.value.data.habit, log });

  if (!members.value.success) return Result.error(members.value.error);
  if (!habitData.value.success) return Result.error(habitData.value.error);

  for (const member of members.value.data) {
    await notifOps.addNotif({
      user: member.id,
      title: `Task updated in "${habitData.value.data.name}"`,
      body: `Admin added task "${task}" in "${habitData.value.data.name}". Might wanna check it out ( ◡̀_◡́)ᕤ`,
      log,
    });
  }
  return Result.ok(undefined);
}

async function deleteTask({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<undefined, string>> {
  log.trace({ layer: "habit service delete task" });
  log.info({ id });

  const oldtask = await readTaskById({ id, log });

  const deleteTask = await drizzleOps.remove(
    habitTasksTable,
    (habitTasksTable) => eq(habitTasksTable.id, id),
    log,
  );

  if (!oldtask.value.success) return Result.error(oldtask.value.error);
  if (!deleteTask.value.success) return Result.error(deleteTask.value.error);

  const members = await readMembersByHabit({
    habit: oldtask.value.data.habit,
    log,
    checksAndAdmins: false,
  });
  const habitData = await readHabit({ habit: oldtask.value.data.habit, log });

  if (!members.value.success) return Result.error(members.value.error);
  if (!habitData.value.success) return Result.error(habitData.value.error);

  for (const member of members.value.data) {
    await notifOps.addNotif({
      user: member.id,
      title: `Task deleted in "${habitData.value.data.name}"`,
      body: `Admin deleted task "${oldtask.value.data.task}" in "${habitData.value.data.name}". Less work now ٩>ᴗ<)و`,
      log,
    });
  }
  return Result.ok(undefined);
}

async function createProof({
  user,
  task,
  media,
  description,
  log,
}: {
  user: string;
  task: string;
  media?: string;
  description?: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitProofsTable>, string>> {
  log.trace({ layer: "habit service create proof" });
  log.info({ user, task, description, media });

  const x = await drizzleOps.insert(
    habitProofsTable,
    {
      user,
      task,
      media,
      proofStatus: "pending",
      description,
    },
    log,
  );

  if (!x.value.success) return x;

  const taskDetails = await readTaskById({ id: task, log });
  if (!taskDetails.value.success) return Result.error(taskDetails.value.error);

  const members = await readMembersByHabit({
    habit: taskDetails.value.data.habit,
    log,
    checksAndAdmins: true,
  });
  if (!members.value.success) return Result.error(members.value.error);

  const habitData = await readHabit({
    habit: taskDetails.value.data.habit,
    log,
  });
  if (!habitData.value.success) return Result.error(habitData.value.error);

  for (const member of members.value.data) {
    await notifOps.addNotif({
      user: member.id,
      title: `Proof added in habit ${habitData.value.data.name}`,
      body: `A new proof was added to habit ${habitData.value.data.name} for task ${taskDetails.value.data.task}. You should go and verify it (˶˃ ᵕ ˂˶) .ᐟ.ᐟ`,
      log,
    });
  }

  return x;
}

async function readProofsByTask({ task, log }: { task: string; log: Logger }) {
  log.trace({ layer: "habit service read proofs by task" });
  log.info({ task });

  return await drizzleOps.readAllWithCondition(
    habitProofsTable,
    (habitProofsTable) => eq(habitProofsTable.task, task),
    log,
  );
}

async function readProofById({ id, log }: { id: string; log: Logger }) {
  log.trace({ layer: "habit service read proof by id" });
  log.info({ id });

  return await drizzleOps.readWithCondition(
    habitProofsTable,
    (habitProofsTable) => eq(habitProofsTable.id, id),
    log,
  );
}

async function userHeatmap({ user, log }: { user: string; log: Logger }) {
  log.trace({ layer: "habit service read user heatmap" });
  log.info({ user });

  return await drizzleOps.readAllWithCondition(
    habitProofsTable,
    (habitProofsTable) =>
      and(
        eq(habitProofsTable.user, user),
        eq(habitProofsTable.proofStatus, "accepted"),
      ),
    log,
  );
}

async function updateProofStatus({
  proof,
  status,
  log,
}: {
  proof: string;
  status: boolean;
  log: Logger;
}) {
  log.trace({ layer: "habit service update proof status" });
  log.info({ status, proof });

  return await drizzleOps.update(
    habitProofsTable,
    {
      proofStatus: status ? "accepted" : "declined",
    },
    (habitProofsTable) => eq(habitProofsTable.id, proof),
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
  addMemberAsChecker,
  readMembersByHabit,
  removeMemberByEmail,

  addTaskInHabit,
  readTasksByHabit,
  readTaskByUser,
  readTaskById,
  updateTask,
  deleteTask,

  createProof,
  readProofsByTask,
  readProofById,
  userHeatmap,
  updateProofStatus,
};
