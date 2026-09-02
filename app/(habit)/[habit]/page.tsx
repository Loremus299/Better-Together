import { habitService } from "@/app/api/habit/service";
import { habitOps } from "@/app/api/ops/habit";
import ImageById from "@/components/imageById";
import MaxWContainer from "@/components/maxWContainer";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Logger } from "@/lib/logger";
import { getSession } from "@/lib/server-util";
import { redirect } from "next/navigation";
import HabitAdminSettings from "./components/habitAdminSettings";
import TaskDisplay from "./components/taskDisplay";
import { InferSelectModel } from "drizzle-orm";
import { habitProofsTable } from "@/db/schema";
import ProofDisplay from "./components/proofDisplay";

export default async function Page({
  params,
}: {
  params: Promise<{ habit: string }>;
}) {
  const log = new Logger();
  const { habit } = await params;
  const session = await getSession();
  if (!session) {
    log.print();
    redirect("/auth/login");
  }

  const isAdmin = await habitOps.isUserAdmin({
    user: session.user.id,
    habit,
    log,
  });
  const isMember = await habitOps.isUserMember({
    user: session.user.id,
    habit,
    log,
  });
  const isChecker = await habitOps.isUserChecker({
    user: session.user.id,
    habit,
    log,
  });
  const habitdata = await habitService.readHabit({ habit, log });
  const members = await habitService.readMembersByHabit({ habit, log });
  const tasks = await habitService.readTasksByHabit({ habit, log });

  if (
    !isAdmin.value.success ||
    !isMember.value.success ||
    !isChecker.value.success ||
    !habitdata.value.success ||
    !members.value.success ||
    !tasks.value.success
  ) {
    log.print();
    redirect(
      `/error?e=${encodeURI("Failed to load initial data")}&id=${log.getId()}`,
    );
  }

  const proofArr: InferSelectModel<typeof habitProofsTable>[] = [];

  for (const task of tasks.value.data) {
    const proof = await habitService.readProofsByTask({ task: task.id, log });
    if (proof.value.success) {
      proof.value.data.forEach((item) => proofArr.push(item));
    }
  }

  if (!isAdmin.value.data && !isMember.value.data && !isChecker.value.data) {
    redirect(
      `/error?e=${encodeURI("You do not have access to this habit")}&id=${log.getId()}`,
    );
  }

  log.print();

  return (
    <MaxWContainer>
      <ResizablePanelGroup
        orientation="vertical"
        className="min-h-screen pt-2 pb-1"
      >
        <ResizablePanel defaultSize={"100px"}>
          {isAdmin.value.data ? (
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel className="p-1 h-full -mt-1">
                <div className="w-full p-4 flex gap-4 bg-card rounded-md h-24 overflow-y-hidden">
                  {habitdata.value.data.header && (
                    <ImageById
                      id={habitdata.value.data.header}
                      css="h-full rounded-lg border hover:drop-shadow-2xl transition duration-300 hover:scale-105"
                    />
                  )}
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      {habitdata.value.data.name}
                    </h1>
                    <h2 className="text-muted-foreground">
                      {habitdata.value.data.description}
                    </h2>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel className="p-1" defaultSize={"85px"}>
                <HabitAdminSettings
                  checker={false}
                  name={habitdata.value.data.name}
                  description={habitdata.value.data.description}
                  habit={habit}
                  members={members.value.data}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="w-full h-full p-1">
              <div className="w-full h-full p-4 flex gap-4 bg-card rounded-md">
                {habitdata.value.data.header && (
                  <ImageById
                    id={habitdata.value.data.header}
                    css="h-full rounded-lg border hover:drop-shadow-2xl transition duration-300 hover:scale-105"
                  />
                )}
                <div>
                  <h1 className="text-5xl font-bold tracking-tight">
                    {habitdata.value.data.name}
                  </h1>
                  <h2 className="text-muted-foreground">
                    {habitdata.value.data.description}
                  </h2>
                </div>
              </div>
            </div>
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <ResizablePanelGroup>
            <ResizablePanel defaultSize={"75%"} className="p-1">
              <div className="p-4 grid gap-4 bg-card w-full h-full rounded-md">
                <div className="flex flex-col gap-2">
                  {tasks.value.data.map((task) => (
                    <TaskDisplay
                      habit={habit}
                      key={task.id}
                      task={task.id}
                      description={task.description}
                      name={task.task}
                    />
                  ))}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="m-1">
              <div className="rounded-md bg-card">
                <div className="flex flex-wrap gap-4 p-4">
                  {proofArr.map((item) => (
                    <ProofDisplay
                      id={item.id}
                      currentUser={session.user.id}
                      proofTime={item.timeStamp}
                      task={item.task}
                      userid={item.user}
                      key={item.id}
                      proofStatus={item.proofStatus}
                      description={item.description}
                      media={item.media}
                    />
                  ))}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </MaxWContainer>
  );
}
