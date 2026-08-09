import { habitService } from "@/app/api/habit/service";
import ImageById from "@/components/imageById";
import MaxWContainer from "@/components/maxWContainer";

import { db } from "@/db";
import { userId } from "@/lib/server-util";

import { redirect } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import HabitAdminSettings from "./components/habitAdminSettings";
import TaskDisplay from "./components/taskDisplay";

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

  const members = await habitService.readAllHabitLinks({
    userId: uid.data,
    tx: db,
    habitId: id,
  });

  if (!members.success) redirect(`/error?e=${members.error}`);

  return (
    <MaxWContainer>
      <main className="border border-muted-background">
        <ResizablePanelGroup orientation="vertical" className="min-h-screen">
          <ResizablePanel defaultSize={"120px"}>
            {isAdmin.data ? (
              <ResizablePanelGroup>
                <ResizablePanel>
                  <div className="w-full h-full p-4 flex gap-4">
                    {habit.data.header && (
                      <ImageById
                        id={habit.data.header}
                        css="h-full rounded-lg border hover:drop-shadow-2xl transition duration-300 hover:scale-105"
                      />
                    )}
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight">
                        {habit.data.name}
                      </h1>
                      <h2 className="text-muted-foreground">
                        {habit.data.description}
                      </h2>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={"80px"}>
                  <HabitAdminSettings
                    habitId={habit.data.id}
                    userId={uid.data}
                    name={habit.data.name}
                    description={habit.data.description}
                    oldHeader={habit.data.header}
                    members={members.data}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className="w-full h-full p-4 flex gap-4">
                {habit.data.header && (
                  <ImageById
                    id={habit.data.header}
                    css="h-full rounded-lg border hover:drop-shadow-2xl transition duration-300 hover:scale-105"
                  />
                )}
                <div>
                  <h1 className="text-5xl font-bold tracking-tight">
                    {habit.data.name}
                  </h1>
                  <h2 className="text-muted-foreground">
                    {habit.data.description}
                  </h2>
                </div>
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup>
              <ResizablePanel defaultSize={"75%"}>
                <TaskDisplay
                  userId={uid.data}
                  habitId={habit.data.id}
                  isAdmin={isAdmin.data}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>Hi</ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </MaxWContainer>
  );
}
