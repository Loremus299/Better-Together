"use server";

import { habitService } from "@/app/api/habit/service";
import { drizzleOps } from "@/app/api/ops/drizzle";
import { habitOps } from "@/app/api/ops/habit";
import { habitProofsTable } from "@/db/schema";
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

export async function addMemberAction({
  habit,
  email,
}: {
  habit: string;
  email: string;
}) {
  const log = new Logger();
  log.trace({ layer: "add member by email action" });

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

    return (await habitService.addMember({ habit, email, log })).type();
  } finally {
    log.print();
  }
}

export async function removeMemberAction({
  habit,
  email,
}: {
  habit: string;
  email: string;
}) {
  const log = new Logger();
  log.trace({ layer: "remove member by user id action" });

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
      await habitService.removeMemberByEmail({ habit, log, email })
    ).type();
  } finally {
    log.print();
  }
}

export async function addTaskAction({
  habit,
  task,
  description,
}: {
  habit: string;
  task: string;
  description: string;
}) {
  const log = new Logger();
  log.trace({ layer: "add task action" });

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
      await habitService.addTaskInHabit({ task, description, habit, log })
    ).type();
  } finally {
    log.print();
  }
}

export async function updateTaskAction({
  id,
  task,
  description,
}: {
  id: string;
  task: string;
  description: string;
}) {
  const log = new Logger();
  log.trace({ layer: "update task action" });

  try {
    const session = await getSession();
    if (!session) {
      return Result.error<void, string>("No user session found").type();
    }

    const taskDetails = await habitService.readTaskById({ id, log });

    if (!taskDetails.value.success)
      return Result.error(taskDetails.value.error).type();

    const isAdmin = await habitOps.isUserAdmin({
      user: session.user.id,
      habit: taskDetails.value.data.habit,
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
      await habitService.updateTask({ task, description, id, log })
    ).type();
  } finally {
    log.print();
  }
}

export async function deleteTaskAction({ id }: { id: string }) {
  const log = new Logger();
  log.trace({ layer: "delete task action" });

  try {
    const session = await getSession();
    if (!session) {
      return Result.error<void, string>("No user session found").type();
    }

    const taskDetails = await habitService.readTaskById({ id, log });

    if (!taskDetails.value.success)
      return Result.error(taskDetails.value.error).type();

    const isAdmin = await habitOps.isUserAdmin({
      user: session.user.id,
      habit: taskDetails.value.data.habit,
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

    return (await habitService.deleteTask({ id, log })).type();
  } finally {
    log.print();
  }
}

export async function createProofAction({
  id,
  description,
  media,
}: {
  id: string;
  description?: string;
  media?: string;
}) {
  const log = new Logger();
  log.trace({ layer: "create proof entry" });

  try {
    const session = await getSession();
    if (!session) {
      return Result.error<void, string>("No user session found").type();
    }

    const taskDetails = await habitService.readTaskById({ id, log });

    if (!taskDetails.value.success)
      return Result.error(taskDetails.value.error).type();

    const isMember = await habitOps.isUserMember({
      user: session.user.id,
      habit: taskDetails.value.data.habit,
      log,
    });

    const isAdmin = await habitOps.isUserAdmin({
      user: session.user.id,
      habit: taskDetails.value.data.habit,
      log,
    });

    if (!isMember.value.success || !isAdmin.value.success) {
      return Result.error<void, string>(
        "Could not determine authority over action",
      ).type();
    }

    if (!isMember.value.data && !isAdmin.value.data) {
      return Result.error<void, string>(
        "You don't have authority to perform this action",
      ).type();
    }

    return (
      await drizzleOps.insert(
        habitProofsTable,
        {
          task: id,
          proofStatus: "pending",
          user: session.user.id,
          description,
          media,
        },
        log,
      )
    ).type();
  } finally {
    log.print();
  }
}

export async function updateProofStatusAction({
  id,
  updatedStatus,
}: {
  id: string;
  updatedStatus: boolean;
}): Promise<ResultType<void, string>> {
  const log = new Logger();
  log.trace({ layer: "update proof entry" });

  try {
    const session = await getSession();
    if (!session) {
      return Result.error<void, string>("No user session found").type();
    }

    const proofDetails = await habitService.readProofById({ id, log });

    if (!proofDetails.value.success)
      return Result.error<void, string>(proofDetails.value.error).type();

    const taskDetails = await habitService.readTaskById({
      id: proofDetails.value.data.task,
      log,
    });

    if (!taskDetails.value.success)
      return Result.error<void, string>(taskDetails.value.error).type();

    const isMember = await habitOps.isUserMember({
      user: session.user.id,
      habit: taskDetails.value.data.habit,
      log,
    });

    const isAdmin = await habitOps.isUserAdmin({
      user: session.user.id,
      habit: taskDetails.value.data.habit,
      log,
    });

    const isChecker = await habitOps.isUserChecker({
      user: session.user.id,
      habit: taskDetails.value.data.habit,
      log,
    });

    if (
      !isMember.value.success ||
      !isAdmin.value.success ||
      !isChecker.value.success
    ) {
      return Result.error<void, string>(
        "Could not determine authority over action",
      ).type();
    }

    if (
      !isMember.value.data &&
      !isAdmin.value.data &&
      !isChecker.value.success
    ) {
      return Result.error<void, string>(
        "You don't have authority to perform this action",
      ).type();
    }

    if (session.user.id === proofDetails.value.data.user) {
      return Result.error<void, string>(
        "WOW DUDE ??!! Cheating ???!!! BADDDDD GIRL ˙◠˙",
      ).type();
    }

    return (
      await habitService.updateProofStatus({
        proof: id,
        status: updatedStatus,
        log,
      })
    ).type();
  } finally {
    log.print();
  }
}
