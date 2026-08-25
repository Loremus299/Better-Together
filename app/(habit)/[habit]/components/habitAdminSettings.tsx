"use client";

import { Button } from "@/components/ui/button";
import {
  IconCircleCheck,
  IconMailMinus,
  IconMailPlus,
  IconPencil,
  IconPhotoPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import UpdateDetailsDialog from "./updateDetailsDialog";
import UpdateHeaderDialog from "./updateHeaderDialog";
import DeleteHabitAlert from "./deleteHabitDialog";
import AddMemberDialog from "./addMemberDialog";
import RemoveMemberDialog from "./removeMemberDialog";
import AddTaskDialog from "./addTaskDialog";

export default function HabitAdminSettings({
  name,
  description,
  habit,
  members,
  checker,
}: {
  name: string;
  description: string;
  habit: string;
  members: {
    name: string;
    id: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  checker: boolean;
}) {
  const [updateDetailsOpen, setUpdateDetailsOpen] = useState(false);
  const [updateHeaderOpen, setUpdateHeaderOpen] = useState(false);
  const [deleteHabitOpen, setDeleteHabitOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  return (
    <div>
      <Button
        variant={"ghost"}
        className="border hover:border-accent border-muted-background rounded-none"
        onClick={() => setUpdateDetailsOpen(true)}
      >
        <IconPencil />
      </Button>

      <Button
        variant={"ghost"}
        className="border hover:border-accent border-muted-background rounded-none"
        onClick={() => setUpdateHeaderOpen(true)}
      >
        <IconPhotoPlus />
      </Button>

      <Button
        variant={"ghost"}
        className="border hover:border-accent border-muted-background rounded-none"
        onClick={() => setAddMemberOpen(true)}
      >
        <IconMailPlus />
      </Button>

      <Button
        variant={"ghost"}
        className="border hover:border-accent border-muted-background rounded-none"
        onClick={() => setAddTaskOpen(true)}
      >
        <IconCircleCheck />
      </Button>

      <Button
        variant={"ghost"}
        className="border hover:border-accent border-muted-background rounded-none"
        onClick={() => setRemoveMemberOpen(true)}
      >
        <IconMailMinus className="text-destructive" />
      </Button>

      <Button
        variant={"ghost"}
        className="border hover:border-accent border-muted-background rounded-none"
        onClick={() => setDeleteHabitOpen(true)}
      >
        <IconTrash className="text-destructive" />
      </Button>

      <UpdateDetailsDialog
        open={updateDetailsOpen}
        onOpenChange={setUpdateDetailsOpen}
        name={name}
        description={description}
        habit={habit}
      />

      <UpdateHeaderDialog
        habit={habit}
        open={updateHeaderOpen}
        onOpenChange={setUpdateHeaderOpen}
      />

      <DeleteHabitAlert
        open={deleteHabitOpen}
        onOpenChange={setDeleteHabitOpen}
        habit={habit}
      />

      <AddMemberDialog
        checker={checker}
        email=""
        habit={habit}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />

      <RemoveMemberDialog
        habit={habit}
        members={members}
        onOpenChange={setRemoveMemberOpen}
        open={removeMemberOpen}
      />

      <AddTaskDialog
        description=""
        habit={habit}
        task=""
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
      />
    </div>
  );
}
