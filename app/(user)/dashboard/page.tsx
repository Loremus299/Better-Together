import MaxWContainer from "@/components/maxWContainer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Page() {
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
                  Notifs
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
                <div className="h-full w-full grid place-items-center">
                  Habits
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel>
                <ResizablePanelGroup orientation="vertical">
                  <ResizablePanel className="hover:border hover:border-chart-2">
                    <div className="h-full w-full grid place-items-center">
                      Streak Cal
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel
                    defaultSize={"75%"}
                    className="hover:border hover:border-chart-2"
                  >
                    <div className="h-full w-full grid place-items-center">
                      Todos
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </MaxWContainer>
  );
}
