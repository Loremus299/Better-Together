import MaxWContainer from "@/components/maxWContainer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import NotifDisplay from "./components/notifDisplay";
import { getSession } from "@/lib/server-util";
import { redirect } from "next/navigation";
import HabitDisplay from "./components/habitDisplay";
import IncompleteTaskDisplay from "./components/incompleteTaskDisplay";
import StreakCalDisplay from "./components/streakCalDisplay";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("auth/login");
  }

  return (
    <MaxWContainer>
      <main className="border">
        <ResizablePanelGroup orientation="vertical" className="min-h-screen">
          <ResizablePanel defaultSize={"4em"}>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel
                defaultSize={"4em"}
                className="hover:border hover:border-chart-2"
              >
                <div className="h-full w-full grid place-items-center">
                  Account
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel className="hover:border hover:border-chart-2">
                <div className="h-full w-full grid place-items-center">
                  Navbar
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={"4em"}
                className="hover:border hover:border-chart-2"
              >
                <div className="h-full w-full grid place-items-center">
                  <NotifDisplay />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel
                defaultSize={"70%"}
                className="hover:border hover:border-chart-2"
              >
                <ResizablePanelGroup orientation="vertical">
                  <ResizablePanel defaultSize={"8.5em"}>
                    <StreakCalDisplay user={session.user.id} />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel>
                    <HabitDisplay />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <IncompleteTaskDisplay user={session.user.id} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </MaxWContainer>
  );
}
