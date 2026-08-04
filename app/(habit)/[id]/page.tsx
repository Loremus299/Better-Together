import { habitService } from "@/app/api/habit/service";
import ImageById from "@/components/imageById";
import MaxWContainer from "@/components/maxWContainer";

import { db } from "@/db";
import { userId } from "@/lib/server-util";

import { redirect } from "next/navigation";
import SettingsDropdown from "./settingsDropdown";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const uid = await userId();
  if (!uid.success) {
    redirect("/auth/login");
  }

  const isAdmin = await habitService.isUserAdmin({
    habitId: id,
    tx: db,
    userId: uid.data,
  });

  if (!isAdmin.success) {
    redirect(`/error?e=${isAdmin.error}`);
  }

  const habit = await habitService.readHabitById({
    habitId: id,
    tx: db,
    userId: uid.data,
  });

  if (!habit.success) {
    redirect(`/error?e=${habit.error}`);
  }

  return (
    <MaxWContainer>
      {habit.data.header && (
        <ImageById
          id={habit.data.header}
          css="w-full h-[50vh] object-cover drop-shadow-2xl rounded-b-xl"
        />
      )}
      <div className="p-4">
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl tracking-tight font-bold">
              {habit.data.name}
            </h1>
            {isAdmin.data && <SettingsDropdown />}
          </div>
          <h2 className="text-muted-foreground">{habit.data.description}</h2>
        </div>
      </div>
    </MaxWContainer>
  );
}
