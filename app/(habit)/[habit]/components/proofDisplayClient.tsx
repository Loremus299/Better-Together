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
import { updateProofStatusAction } from "../action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
          <span
            className={cn(
              proofStatus === "pending" && "text-yellow-500",
              proofStatus === "accepted" && "text-green-500",
              proofStatus === "rejected" && "text-red-500",
            )}
          >
            {proofStatus}
          </span>{" "}
          <br />
          For task: {task} <br />
          Submitted on: {isSubmittedToday ? "today" : date.getDate()}
        </CardDescription>
      </CardHeader>
      <CardContent className="wrap-anywhere">{description}</CardContent>
      <CardFooter className="grid gap-2">
        <img
          src={url}
          alt={description ?? ""}
          className="rounded-xl wrap-anywhere"
        />
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
