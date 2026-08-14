"use client";

import { Button } from "@/components/ui/button";
import { IconPencil, IconPhotoPlus } from "@tabler/icons-react";
import { useState } from "react";
import UpdateDetailsDialog from "./updateDetailsDialog";
import UpdateHeaderDialog from "./updateHeaderDialog";

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
    </div>
  );
}
