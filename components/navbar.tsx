import { cn } from "@/lib/utils";
import { IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { ViewTransition } from "react";

export default async function Navbar({
  habits,
  currentTab,
  landscape,
}: {
  habits: { id: string; name: string }[];
  currentTab: string;
  landscape?: boolean;
}) {
  return (
    <ViewTransition name="navbar" default={"none"} share={"morph"}>
      <div
        className={cn(
          landscape ? "grid items-center " : "",
          "bg-card w-full h-full rounded-md p-2 truncate",
        )}
      >
        <div className={cn(landscape ? "flex" : "grid", "gap-2")}>
          <Link
            href={"/dashboard"}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "truncate justify-start",
              "dashboard" === currentTab ? "bg-primary" : "",
            )}
          >
            <IconHome />{" "}
            {landscape ? "" : <span className="ml-1.5">Dashboard</span>}
          </Link>
          {habits.map((t, i) => (
            <Link
              key={t.id}
              href={`/${t.id}`}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "truncate justify-start",
                t.id === currentTab ? "bg-primary" : "",
              )}
            >
              <div>
                <span className={landscape ? "" : "ml-1 mr-4"}>
                  {landscape ? t.name : i + 1}
                </span>
                {landscape ? "" : <span>{t.name}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ViewTransition>
  );
}
