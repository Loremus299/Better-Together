import { habitMembersTable, habitTable, Roles } from "@/db/schema";
import { Logger } from "@/lib/logger";
import { Result } from "@/lib/result";
import drizzleOps from "../ops/drizzle";
import { eq, getColumns, InferSelectModel, or } from "drizzle-orm";
import { db } from "@/db";

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

  return await drizzleOps.insert(habitTable, { name, description }, log.nest());
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

  const allData = await Result.settle([
    isAdmin({ user, habit, log: log.nest() }),
    readHabitById({ id: habit, log: log.nest() }),
  ]);

  if (!allData.value.success)
    return Result.error("Failed to fetch necessary data for updating habit");

  if (!allData.value.data[0])
    return Result.error("You don't have the authority to perform this action");

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

  const admin = await isAdmin({ user, habit, log: log.nest() });

  if (!admin.value.success) return Result.error(admin.value.error);
  if (!admin.value.data)
    return Result.error("You don't have the authority to perform this action");

  return await drizzleOps.delete(
    habitTable,
    (t) => eq(t.id, habit),
    log.nest(),
  );
}

const auth = { isUserInHabit, isAdmin, isMember, isChecker };
const habitService = {
  createHabit,
  readHabitById,
  readHabitsByUser,
  updateHabitById,
  deleteHabitById,
  auth,
};
export default habitService;
