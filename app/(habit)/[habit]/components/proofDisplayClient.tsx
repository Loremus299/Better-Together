/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IconStarFilled } from "@tabler/icons-react";
import { updateProofStatusAction } from "../action";
import { toast } from "sonner";

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
  const date = new Date(proofTime);
  const today = new Date();

  const isSubmittedToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return (
    <Card>
      <CardHeader>
        {isSubmittedToday ? (
          <IconStarFilled className="text-accent-foreground" />
        ) : (
          ""
        )}
        Proof submitted by {isSelf ? "You" : userName}
        <CardDescription>
          Approval Status: {proofStatus} <br />
          For task: {task}
        </CardDescription>
        <CardAction
          onClick={async () => {
            const act = await updateProofStatusAction({
              id,
              updatedStatus: true,
            });

            if (!act.success) {
              toast.error(act.error);
            } else {
              toast.success("Approved proof");
            }
          }}
        >
          {isSelf ? "Cheat" : "Review"}
        </CardAction>
      </CardHeader>
      <CardContent>{description}</CardContent>
      <CardFooter>
        <img src={url} alt={description ?? ""} className="rounded-xl" />
      </CardFooter>
    </Card>
  );
}
