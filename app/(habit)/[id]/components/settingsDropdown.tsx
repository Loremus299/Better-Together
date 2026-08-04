"use client";

import { Button } from "@/components/ui/button";
import {
  IconMail,
  IconPencil,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUserCancel,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AddMemberDialog from "./addMemberDialog";
import { useState } from "react";
export default function SettingsDropdown({
  userId,
  habitId,
}: {
  userId: string;
  habitId: string;
}) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant={"ghost"} className={"size-8"} />}
        >
          <IconSettings />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={"w-fit"}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setAddMemberOpen(true)}>
              <IconMail /> Add member
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconPlus /> Add task
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconPencil /> Edit details
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className={"text-destructive"}>
              <IconTrash /> Delete habit
            </DropdownMenuItem>
            <DropdownMenuItem className={"text-destructive"}>
              <IconUserCancel /> Remove member
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        userId={userId}
        habitId={habitId}
      />
    </>
  );
}
