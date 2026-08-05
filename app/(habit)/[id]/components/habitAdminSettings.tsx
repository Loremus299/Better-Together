"use client";

import { Button } from "@/components/ui/button";
import {
  IconMail,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUserCancel,
} from "@tabler/icons-react";
import AddMemberDialog from "./addMemberDialog";
import { useState } from "react";
import AddTaskDialog from "./addTaskDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
export default function HabitAdminSettings({
  userId,
  habitId,
}: {
  userId: string;
  habitId: string;
}) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className={
                  "rounded-none aspect-square border border-muted-background size-10"
                }
                variant={"ghost"}
                onClick={() => setAddMemberOpen(true)}
              >
                <IconMail />
              </Button>
            }
          ></TooltipTrigger>
          <TooltipContent>Add member</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className={
                  "rounded-none aspect-square border border-muted-background size-10"
                }
                variant={"ghost"}
                onClick={() => setAddTaskOpen(true)}
              >
                <IconPlus />
              </Button>
            }
          ></TooltipTrigger>
          <TooltipContent>Add task</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className={
                  "rounded-none aspect-square border border-muted-background size-10"
                }
                variant={"ghost"}
              >
                <IconPencil />
              </Button>
            }
          ></TooltipTrigger>
          <TooltipContent>Edit details</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className={
                  "rounded-none aspect-square border border-muted-background size-10"
                }
                variant={"ghost"}
              >
                <IconUserCancel className="text-destructive" />
              </Button>
            }
          ></TooltipTrigger>
          <TooltipContent>Remove member</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className={
                  "rounded-none aspect-square border border-muted-background size-10"
                }
                variant={"ghost"}
              >
                <IconTrash className="text-destructive" />
              </Button>
            }
          ></TooltipTrigger>
          <TooltipContent>Delete habit</TooltipContent>
        </Tooltip>
      </div>
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        userId={userId}
        habitId={habitId}
      />

      <AddTaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        habitId={habitId}
        userId={userId}
      />
    </div>
  );
}
