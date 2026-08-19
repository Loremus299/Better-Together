"use client";

import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteHabitAction } from "../action";
import { IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeleteHabitAlert({
  habit,
  open,
  onOpenChange,
}: {
  habit: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        Are you sure ? This will permanently delete the habit and you will not
        be able to recover data after this click. ( ˶°ㅁ°) !!
        <Button
          onClick={async () => {
            const toastID = toast.loading("Processing");
            await deleteHabitAction({ habit }).then(() =>
              router.push("/dashboard"),
            );
            toast.dismiss(toastID);
          }}
        >
          <IconCheck />I am sure
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
