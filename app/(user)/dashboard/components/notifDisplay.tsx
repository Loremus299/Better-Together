import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService } from "@/app/api/notification/service";
import { redirect } from "next/navigation";
import { IconBell, IconCircleFilled } from "@tabler/icons-react";
import NotifMarkButton from "./notifMarkButton";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/server-util";
import { Logger } from "@/lib/logger";

export default async function NotifDisplay() {
  const log = new Logger();

  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const notifs = await notificationService.readByUser({
    user: session.user.id,
    log,
  });
  if (!notifs.value.success)
    redirect(`/error?e=${notifs.value.error}&id=${log.getId()}`);

  log.print();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full h-full grid place-items-center">
        <IconBell stroke={1} />
        {notifs.value.data.filter((item) => item.read === false).length > 0 && (
          <div className="absolute">
            <div className="relative top-2 left-2">
              <IconCircleFilled className="text-red-500 size-4" />
            </div>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-sm w-full">
        <DropdownMenuGroup>
          {notifs.value.data.reverse().map((item) => (
            <div className="p-2 font-medium grid gap-1" key={item.id}>
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    "text-sm",
                    item.read ? "line-through text-muted-foreground" : "",
                  )}
                >
                  {item.title}
                </p>
                {!item.read && <NotifMarkButton id={item.id} />}
              </div>
              <p className="text-sm font-normal text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
