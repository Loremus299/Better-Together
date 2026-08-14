"use server";

import { habitService } from "@/app/api/habit/service";
import { habitOps } from "@/app/api/ops/habit";
import { Logger } from "@/lib/logger";
import { Result, ResultType } from "@/lib/result";
import { getSession } from "@/lib/server-util";

export async function updateDetailsAction({
  name,
  description,
  habit,
}: {
  name: string;
  description: string;
  habit: string;
  user: string;
}): Promise<ResultType<void, string>> {
  const log = new Logger();
  log.trace({ layer: "update details of habit action" });
  log.data({ name, description, habit });
  try {
    const session = await getSession();
    if (!session) {
      return Result.error<void, string>("No user session found").type();
    }

    const isAdmin = await habitOps.isUserAdmin({
      user: session.user.id,
      habit,
      log,
    });
    if (!isAdmin.value.success) {
      return Result.error<void, string>(
        "Could not determine authority over action",
      ).type();
    }

    if (!isAdmin.value.data) {
      return Result.error<void, string>(
        "You don't have authority to perform this action",
      ).type();
    }

    return (
      await habitService.updateHabit({ name, description, habit, log })
    ).type();
  } finally {
    log.print();
  }
}

export async function updateHeaderAction({
  habit,
  header,
}: {
  habit: string;
  header: string;
}): Promise<ResultType<void, string>> {
  const log = new Logger();
  log.trace({ layer: "update header action" });
  log.data({ habit, header });
  try {
    const session = await getSession();
    if (!session) {
      return Result.error<void, string>("No user session found").type();
    }

    const isAdmin = await habitOps.isUserAdmin({
      user: session.user.id,
      habit,
      log,
    });
    if (!isAdmin.value.success) {
      return Result.error<void, string>(
        "Could not determine authority over action",
      ).type();
    }

    if (!isAdmin.value.data) {
      return Result.error<void, string>(
        "You don't have authority to perform this action",
      ).type();
    }

    return (await habitService.updateHeader({ habit, header, log })).type();
  } finally {
    log.print();
  }
}

export async function deleteHabitAction({
  habit,
}: {
  habit: string;
  user: string;
}): Promise<ResultType<void, string>> {
  const log = new Logger();
  log.trace({ layer: "delete habit action" });
  try {
    const session = await getSession();
    if (!session) {
      return Result.error<void, string>("No user session found").type();
    }

    const isAdmin = await habitOps.isUserAdmin({
      user: session.user.id,
      habit,
      log,
    });
    if (!isAdmin.value.success) {
      return Result.error<void, string>(
        "Could not determine authority over action",
      ).type();
    }

    if (!isAdmin.value.data) {
      return Result.error<void, string>(
        "You don't have authority to perform this action",
      ).type();
    }

    return (await habitService.deleteHabit({ habit, log })).type();
  } finally {
    log.print();
  }
}
