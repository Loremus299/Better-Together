import { habitService } from "@/app/api/habit/service";
import ImageById from "@/components/imageById";
import MaxWContainer from "@/components/maxWContainer";
import { db } from "@/db";
import { userId } from "@/lib/server-util";
import { redirect } from "next/navigation";

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
          <h1 className="text-4xl">{habit.data.name}</h1>
          <h3 className="text-muted-foreground">{habit.data.description}</h3>
        </div>
      </div>
    </MaxWContainer>
  );
}
