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
  const habitdata = await habitService.readHabit({ habit, log });

  if (
    !isAdmin.value.success ||
    !isMember.value.success ||
    !habitdata.value.success
  ) {
    log.print();
    redirect(
      `/error?e=${encodeURI("Failed to load initial data")}&id=${log.getId()}`,
    );
  }

  if (!isAdmin.value.data && !isMember.value.data) {
    redirect(
      `/error?e=${encodeURI("You do not have access to this habit")}&id=${log.getId()}`,
    );
  }

  log.print();

  return (
    <MaxWContainer>
      <main className="border border-muted-background">
        <ResizablePanelGroup orientation="vertical" className="min-h-screen">
          <ResizablePanel defaultSize={"96px"}>
            {isAdmin.value.data ? (
              <ResizablePanelGroup>
                <ResizablePanel>
                  <div className="w-full h-full p-4 flex gap-4">
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
                <ResizablePanel defaultSize={"76px"}>
                  <HabitAdminSettings
                    name={habitdata.value.data.name}
                    description={habitdata.value.data.description}
                    habit={habit}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className="w-full h-full p-4 flex gap-4">
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
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup>
              <ResizablePanel defaultSize={"75%"}></ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>Hi</ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </MaxWContainer>
  );
}
