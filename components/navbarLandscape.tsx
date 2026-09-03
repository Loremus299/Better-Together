import { cn } from "@/lib/utils";
import { IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

export default function NavbarLandscape({
  habits,
  currentTab,
}: {
  habits: { id: string; name: string }[];
  currentTab: string;
}) {
  return (
    <div className="bg-card w-full h-full rounded-md p-2 truncate grid items-center">
      <div className={"flex gap-2"}>
        <Link
          href={"/dashboard"}
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "truncate justify-start",
            "dashboard" === currentTab ? "bg-primary" : "",
          )}
        >
          <IconHome />
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
              <span>{i + 1}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
