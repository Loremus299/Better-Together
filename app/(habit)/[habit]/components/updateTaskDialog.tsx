"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { deleteTaskAction, updateTaskAction } from "../action";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const updateTaskSchema = z.object({
  id: z.string().min(1),
  task: z.string().min(1),
  description: z.string().min(1),
});
type UpdateTaskValues = z.infer<typeof updateTaskSchema>;

export default function UpdateTaskDialog({
  id,
  task,
  description,
}: {
  id: string;
  task: string;
  description: string;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      id,
      task,
      description,
    },
  });

  const onSubmit = async (values: UpdateTaskValues) => {
    const act = await updateTaskAction(values);
    if (!act.success) {
      toast.error(act.error);
    } else {
      router.refresh();
      toast.success("Modified task successfully.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <IconEdit className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Task</DialogTitle>
        <form className="grid gap-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="New Task Name"
            name="task"
            placeholder=""
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            )}
          />
          <FormController
            form={form}
            label="New Task Name"
            name="description"
            placeholder=""
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            )}
          />

          <Button type="submit">
            <IconEdit />
            Update task
          </Button>
          <Button
            variant={"destructive"}
            onClick={async () => {
              const act = await deleteTaskAction({ id });
              if (!act.success) {
                toast.error(act.error);
              } else {
                router.refresh();
                toast.success("Task deleted successfully");
              }
            }}
          >
            <IconTrash />
            Delete Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
