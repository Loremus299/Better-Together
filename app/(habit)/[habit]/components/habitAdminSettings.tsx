"use client";

import { Button } from "@/components/ui/button";
import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import EditDetailsDialog from "./editDetailsDialog";

export default function HabitAdminSettings({
  name,
  description,
  habit,
}: {
  name: string;
  description: string;
  habit: string;
}) {
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  return (
    <div>
      <Button
        variant={"ghost"}
        className="border hover:border-accent border-muted-background rounded-none"
        onClick={() => setEditDetailsOpen(true)}
      >
        <IconPencil />
      </Button>

      <EditDetailsDialog
        open={editDetailsOpen}
        onOpenChange={setEditDetailsOpen}
        name={name}
        description={description}
        habit={habit}
      />
    </div>
  );
}
