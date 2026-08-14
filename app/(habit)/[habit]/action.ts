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
  try {
    return (
      await habitService.updateHabit({ name, description, habit, log })
    ).type();
  } finally {
    log.print();
  }
}
