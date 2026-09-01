import {
  habitMembersTable,
  habitTable,
  habitTasksTable,
  Roles,
  user,
} from "@/db/schema";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import drizzleOps from "../ops/drizzle";
import {
  and,
  EmptyRelations,
  eq,
  getColumns,
  inArray,
  InferSelectModel,
  ne,
  or,
} from "drizzle-orm";
import { db } from "@/db";
import { PgAsyncTransaction, PgQueryResultHKT } from "drizzle-orm/pg-core";

async function isUserInHabit({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<Roles, string>> {
  log.trace({ layer: "habit service - get user role" });
  log.debug({ user, habit });

  return (
    await drizzleOps.readTableUnique(
      habitMembersTable,
      { habit, member: user },
      log.nest(),
    )
  ).mapOk((e) => e.role as Roles);
}

async function isAdmin({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<boolean, string>> {
  return (await isUserInHabit({ user, habit, log })).mapOk((t) => t == "admin");
}

async function isMember({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<boolean, string>> {
  return (await isUserInHabit({ user, habit, log })).mapOk(
    (t) => t == "checker",
  );
}

async function isChecker({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<boolean, string>> {
  return (await isUserInHabit({ user, habit, log })).mapOk(
    (t) => t == "member",
  );
}

async function createHabit({
  name,
  description,
  admin,
  log,
}: {
  name: string;
  description: string;
  admin: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - create habit" });
  log.debug({ name, description, admin });

  log.trace({ trace: "adding habit" });
  const habit = await drizzleOps.insert(
    habitTable,
    { name, description },
    log.nest(),
  );
  if (!habit.value.success) return Result.error(habit.value.error);
  const habitId = habit.value.data.id;

  log.trace({ trace: "adding member as admin" });
  const addAdmin = await drizzleOps.insert(
    habitMembersTable,
    { habit: habitId, member: admin, role: Roles.admin },
    log.nest(),
  );
  if (!addAdmin.value.success) return Result.error(addAdmin.value.error);

  log.trace({ trace: "adding default tasks" });
  const addTask = (
    task: string,
    description: string,
    tx: PgAsyncTransaction<PgQueryResultHKT, EmptyRelations>,
  ) => {
    return drizzleOps.insert(
      habitTasksTable,
      {
        task,
        description,
        habit: habitId,
      },
      log.nest(),
      tx,
    );
  };

  (
    await Result.tryCatch({}, async () => {
      db.transaction(async (tx) => {
        await addTask(
          "Add Task",
          "Add task in habit to do everyday with your members.",
          tx,
        );
        await addTask(
          "Invite partners",
          "Invite partners as members to participate with you or checkers to hold you accountable.",
          tx,
        );
      });
    })
  ).mapError((e) => log.warn({ error: e as string }));

  return Result.ok(habit.value.data);
}

async function readHabitById({
  id,
  log,
}: {
  id: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - read habit by d" });
  log.debug({ id });

  return await drizzleOps.readTableUnique(habitTable, { id }, log.nest());
}

async function readHabitsByUser({
  user,
  roles,
  log,
}: {
  user: string;
  roles?: Roles[];
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>[], string>> {
  log.trace({ layer: "habit service - read habits by user" });
  log.debug({ user, roles });

  if (roles) {
    const condition = roles.map((role) => eq(habitMembersTable.role, role));
    return await drizzleOps.executeQuery(
      db
        .select(getColumns(habitTable))
        .from(habitTable)
        .innerJoin(habitMembersTable, eq(habitMembersTable.member, user))
        .where(or(...condition)),
      log.nest(),
    );
  } else {
    return await drizzleOps.executeQuery(
      db
        .select(getColumns(habitTable))
        .from(habitTable)
        .innerJoin(habitMembersTable, eq(habitMembersTable.member, user)),
      log.nest(),
    );
  }
}

async function updateHabitById({
  user,
  habit,
  name,
  description,
  log,
}: {
  user: string;
  habit: string;
  name?: string;
  description?: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - update habit by id" });
  log.debug({ user, habit, name, description });

  log.trace({ trace: "fetching essential data" });
  const allData = await Result.settle([
    isAdmin({ user, habit, log: log.nest() }),
    readHabitById({ id: habit, log: log.nest() }),
  ]);

  log.trace({ trace: "doing auth check" });
  if (!allData.value.success)
    return Result.error("Failed to fetch necessary data for updating habit");

  if (!allData.value.data[0])
    return Result.error("You don't have the authority to perform this action");

  log.trace({ trace: "updating habit" });
  return await drizzleOps.update(
    habitTable,
    {
      name: name ?? allData.value.data[1].name,
      description: description ?? allData.value.data[1].description,
    },
    (t) => eq(t.id, habit),
    log.nest(),
  );
}

async function deleteHabitById({
  user,
  habit,
  log,
}: {
  user: string;
  habit: string;
  log: Logger;
}): Promise<Result<InferSelectModel<typeof habitTable>, string>> {
  log.trace({ layer: "habit service - delete habit by id" });
  log.debug({ user, habit });

  log.trace({ trace: "doing auth check" });
  const admin = await isAdmin({ user, habit, log: log.nest() });

  if (!admin.value.success) return Result.error("auth check failed");
  if (!admin.value.data)
    return Result.error("You don't have the authority to perform this action");

  log.trace({ trace: "deleting habit" });
  return await drizzleOps.delete(
    habitTable,
    (t) => eq(t.id, habit),
    log.nest(),
  );
}

async function addEmailToHabit({
  admin,
  habit,
  email,
  log,
  role,
}: {
  admin: string;
  habit: string;
  email: string;
  log: Logger;
  role: Roles;
}): Promise<Result<InferSelectModel<typeof habitMembersTable>, string>> {
  log.trace({ layer: "habit service - add email to habit" });
  log.debug({ user, habit, email });

  log.trace({ trace: "necessary data" });
  const allData = await Result.settle([
    drizzleOps.readTableUnique(user, { email }, log.nest()),
    isAdmin({ habit, user: admin, log: log.nest() }),
  ]);
  if (!allData.value.success)
    return Result.error("Could not fetch essential data to update task");

  const [userDetails, isUserAdmin] = allData.value.data;

  log.trace({ trace: "Duplication check" });
  const memberExists = await drizzleOps.readTableUnique(
    habitMembersTable,
    {
      habit: habit,
      member: userDetails.id,
    },
    log,
  );
  if (memberExists.value.success)
    return Result.error("Member already exists in habit");

  log.trace({ trace: "doing auth check" });
  if (!isUserAdmin)
    return Result.error("You don't have the authority to add a member");

  log.trace({ trace: "Adding member" });
  return await drizzleOps.insert(
    habitMembersTable,
    {
      habit: habit,
      member: userDetails.id,
      role,
    },
    log,
  );
}

async function readMembersInHabit({
  user,
  habit,
  roles = [],
  log,
  excludeSelf,
}: {
  user: string;
  habit: string;
  roles: Roles[];
  log: Logger;
  excludeSelf?: boolean;
}): Promise<Result<InferSelectModel<typeof habitMembersTable>[], string>> {
  log.trace({ layer: "habit service - read members in habit" });
  log.debug({ user, habit, roles });

  const conditions = [
    eq(habitMembersTable.habit, habit),
    ...(roles.length > 0 ? [inArray(habitMembersTable.role, roles)] : []),
    ...(excludeSelf ? [ne(habitMembersTable.member, user)] : []),
  ];

  return await drizzleOps.executeQuery(
    db
      .select()
      .from(habitMembersTable)
      .where(and(...conditions)),
    log,
  );
}

const auth = { isUserInHabit, isAdmin, isMember, isChecker };
const members = { addEmailToHabit, readMembersInHabit };
const habitService = {
  createHabit,
  readHabitById,
  readHabitsByUser,
  updateHabitById,
  deleteHabitById,
  auth,
  members,
};
export default habitService;
