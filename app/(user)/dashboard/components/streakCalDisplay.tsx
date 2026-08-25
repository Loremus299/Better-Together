import { habitService } from "@/app/api/habit/service";
import { Logger } from "@/lib/logger";
import { redirect } from "next/navigation";
import StreakCalClient from "./streakCalClient";

export default async function StreakCalDisplay({ user }: { user: string }) {
  const log = new Logger();
  const heatmap = await habitService.userHeatmap({ user, log });

  if (!heatmap.value.success) {
    log.print();
    redirect(`/error?e=${heatmap.value.error}&id=${log.getId()}`);
  }

  return <StreakCalClient data={heatmap.value.data} />;
}
