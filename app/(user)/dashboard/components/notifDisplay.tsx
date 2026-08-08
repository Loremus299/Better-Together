import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService } from "@/app/api/notification/service";
import { db } from "@/db";
import { userId } from "@/lib/server-util";
import { redirect } from "next/navigation";
import { IconBell, IconCircleFilled } from "@tabler/icons-react";
import NotifMarkButton from "./notifMarkButton";
import { cn } from "@/lib/utils";

export default async function NotifDisplay() {
  const user = await userId();
  if (!user.success) {
    redirect("/auth/login");
  }
  const notifs = await notificationService.readNotificationsByUser({
    user: user.data,
    tx: db,
  });

  if (!notifs.success) {
    redirect(`/error?e=${notifs.error}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full h-full grid place-items-center">
        <IconBell stroke={1} />
        {notifs.data.filter((item) => item.read === false).length > 0 && (
          <div className="absolute">
            <div className="relative top-2 left-2">
              <IconCircleFilled className="text-red-500 size-4" />
            </div>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-sm w-full">
        <DropdownMenuGroup>
          {notifs.data.reverse().map((item) => (
            <div className="p-2 font-medium" key={item.id}>
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
