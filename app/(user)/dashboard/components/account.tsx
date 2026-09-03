"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { authClient, useSession } from "@/lib/auth-client";
import { IconCopy, IconLogout, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Account() {
  const session = useSession();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full h-full grid place-items-center bg-card rounded-md">
        <IconUser />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-sm w-full p-2">
        <DropdownMenuGroup className={"flex flex-col items-start gap-2"}>
          <div className="flex items-center text-sm p-2 border border-dashed rounded-xl bg-muted ">
            <p className="font-mono">{session.data?.user.email}</p>
            <Button
              variant={"ghost"}
              className={"cursor-copy"}
              size={"icon-xs"}
              onClick={() => {
                navigator.clipboard.writeText(session.data!.user.email);
                toast.info("Email copied to clipboard.");
              }}
            >
              <IconCopy />
            </Button>
          </div>
          <Button
            variant={"ghost"}
            className={"text-destructive"}
            onClick={async () => {
              await authClient.signOut();
              router.refresh();
            }}
          >
            <IconLogout /> Log Out.
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
