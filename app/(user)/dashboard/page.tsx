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
import Account from "./components/account";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("auth/login");
  }

  return (
    <MaxWContainer>
      <ResizablePanelGroup
        orientation="vertical"
        className="min-h-screen pt-1 pb-1"
      >
        <ResizablePanel defaultSize={"4em"}>
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={"4em"} className="p-1">
              <Account />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={"4em"} className="p-1">
              <div className="w-full h-full bg-card rounded-md grid place-items-center">
                <Link href={"/new"}>
                  <IconPlus />
                </Link>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="p-1">
              <div className="h-full w-full grid place-items-center bg-card rounded-md">
                Navbar
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={"4em"} className="p-1">
              <div className="h-full w-full grid place-items-center bg-card rounded-md">
                <NotifDisplay />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel defaultSize={"70%"}>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={"9.25em"} className="p-1">
                  <StreakCalDisplay user={session.user.id} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel className="m-1">
                  <HabitDisplay />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="m-1">
              <IncompleteTaskDisplay user={session.user.id} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </MaxWContainer>
  );
}
