/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IconMoodTongueWink, IconStarFilled } from "@tabler/icons-react";
import { updateProofStatusAction } from "../../../(habit)/[habit]/action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function ProofDisplayClient({
  id,
  proofTime,
  isSelf,
  proofStatus,
  userName,
  description,
  task,
  url,
}: {
  id: string;
  proofTime: string;
  isSelf: boolean;
  proofStatus: string;
  userName: string;
  description: string | null;
  task: string;
  url?: string;
}) {
  const router = useRouter();
  const date = new Date(Number(proofTime) * 1000);
  const today = new Date();

  const isSubmittedToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isSelf) {
    return "";
  }

  if (proofStatus !== "pending") {
    return "";
  }

  return (
    <Card
      className={cn("w-full", proofStatus !== "pending" ? "opacity-25" : "")}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {isSubmittedToday ? (
            <IconStarFilled className="text-accent size-4" />
          ) : (
            ""
          )}
          Proof submitted by {isSelf ? "You" : userName}
        </div>
        <CardDescription>
          Approval Status:{" "}
          <span className={"text-yellow-500"}>{proofStatus}</span> <br />
          For task: <span className="text-foreground">{task}</span> <br />
          Submitted on:{" "}
          <span className="text-foreground">
            {isSubmittedToday
              ? "Today"
              : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} `}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="wrap-anywhere">{description}</CardContent>
      <CardFooter className="grid gap-2">
        {url && (
          <Dialog>
            <DialogTrigger
              nativeButton={true}
              render={
                <img
                  src={url}
                  alt={description ?? "Proof image"}
                  className="cursor-crosshair rounded-xl wrap-anywhere"
                />
              }
            />

            <DialogContent className={"w-2xl"}>
              <img
                src={url}
                alt={description ?? "Proof image"}
                className="w-full"
              />
            </DialogContent>
          </Dialog>
        )}
        {proofStatus !== "pending" ? null : isSelf ? (
          <Button
            onClick={async () => {
              const toastID = toast.loading("Processing");
              const act = await updateProofStatusAction({
                id,
                updatedStatus: true,
              });
              toast.dismiss(toastID);

              if (!act.success) {
                toast.error(act.error);
              } else {
                router.refresh();
                toast.success(
                  "what are we ? some kinda unintentionally functionality",
                );
              }
            }}
          >
            <IconMoodTongueWink />
            Approve Yourself
          </Button>
        ) : (
          <div className="grid gap-2 grid-cols-2">
            <Button
              className="w-full"
              onClick={async () => {
                const toastID = toast.loading("Processing");
                const act = await updateProofStatusAction({
                  id,
                  updatedStatus: true,
                });
                toast.dismiss(toastID);

                if (!act.success) {
                  toast.error(act.error);
                } else {
                  router.refresh();
                  toast.success("Approved Proof");
                }
              }}
            >
              Approve
            </Button>
            <Button
              className="w-full"
              onClick={async () => {
                const toastID = toast.loading("Processing");
                const act = await updateProofStatusAction({
                  id,
                  updatedStatus: false,
                });
                toast.dismiss(toastID);

                if (!act.success) {
                  toast.error(act.error);
                } else {
                  router.refresh();
                  toast.success("Rejected Proof");
                }
              }}
            >
              Reject
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
