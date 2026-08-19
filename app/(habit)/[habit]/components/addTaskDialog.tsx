"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { addTaskAction } from "../action";
import { toast } from "sonner";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

const addTaskSchema = z.object({
  habit: z.string().min(1),
  task: z.string().min(1),
  description: z.string().min(1),
});
type AddTaskValues = z.infer<typeof addTaskSchema>;

export default function AddTaskDialog({
  task,
  description,
  habit,
  open,
  onOpenChange,
}: {
  task: string;
  description: string;
  habit: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      habit,
      task,
      description,
    },
  });

  const onSubmit = async (values: AddTaskValues) => {
    const toastID = toast.loading("Processing");
    const act = await addTaskAction(values);
    toast.dismiss(toastID);
    if (!act.success) {
      toast.error(act.error);
    } else {
      toast.success("Task added successfully");
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add task.</DialogTitle>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
          <FormController
            form={form}
            label="Task"
            name="task"
            placeholder="Execise everyday"
            render={({ field, fieldState, placeholder }) => (
              <Input
                {...field}
                placeholder={placeholder}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            )}
          />
          <FormController
            form={form}
            label="Task Description"
            name="description"
            placeholder="Show screenshot from fitness tracker as proof."
            render={({ field, fieldState, placeholder }) => (
              <Textarea
                {...field}
                placeholder={placeholder}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            )}
          />
          <Button type="submit">
            <IconPlus />
            Add Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
