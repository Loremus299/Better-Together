"use server";

import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";

export async function updateDetailsAction({
  name,
  description,
  habit,
}: {
  name: string;
  description: string;
  habit: string;
}) {
  const log = new Logger();
  log.trace({ layer: "update details of habit action" });
  log.data({ name, description, habit });
  try {
    return (
      await habitService.updateHabit({ name, description, habit, log })
    ).type();
  } finally {
    log.print();
  }
}

export async function updateHeader({
  habit,
  header,
}: {
  habit: string;
  header: string;
}) {
  const log = new Logger();
  log.trace({ layer: "update header action" });
  log.data({ habit, header });
  try {
    return (await habitService.updateHeader({ habit, header, log })).type();
  } finally {
    log.print();
  }
}
