"use client";

import { Button } from "@/components/ui/button";
import { IconEye } from "@tabler/icons-react";
import { markNotificationAsReadAction } from "../action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotifMarkButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <Button
      size={"xs"}
      variant={"ghost"}
      onClick={async () => {
        const act = await markNotificationAsReadAction(id);
        if (act.success) {
          toast.success("Notification marked as read");
          router.refresh();
        } else {
          router.replace(`/error?e=${act.error.error}&id=${act.error.request}`);
        }
      }}
    >
      <IconEye />
    </Button>
  );
}
