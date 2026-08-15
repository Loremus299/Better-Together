"use client";

import { Button } from "@/components/ui/button";
import {
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

export default function HabitAdminSettings({
  name,
  description,
  habit,
}: {
  name: string;
  description: string;
  habit: string;
}) {
  const [updateDetailsOpen, setUpdateDetailsOpen] = useState(false);
  const [updateHeaderOpen, setUpdateHeaderOpen] = useState(false);
  const [deleteHabitOpen, setDeleteHabitOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

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
        email=""
        habit={habit}
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />
    </div>
  );
}
