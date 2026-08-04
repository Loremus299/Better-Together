import { useForm } from "react-hook-form";
import { addTaskSchema, AddTaskValues } from "../common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { addTaskAction } from "../action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";

export default function AddTaskDialog({
  open,
  onOpenChange,
  userId,
  habitId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  habitId: string;
}) {
  const form = useForm<AddTaskValues>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      habitId,
      userId,
      taskName: "",
      taskDescription: "",
    },
  });

  const onSubmit = async (values: AddTaskValues) => {
    const action = await addTaskAction(values);

    if (!action.success) {
      toast.error(action.error);
    } else {
      toast.success("Task created successfully.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add Task.</DialogTitle>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="Task name"
            name="taskName"
            placeholder="Run 1km everyday..."
            render={({ field, fieldState, placeholder }) => (
              <Input
                aria-invalid={fieldState.invalid}
                id={field.name}
                placeholder={placeholder}
                {...field}
              />
            )}
          />

          <FormController
            form={form}
            label="Task Description"
            name="taskDescription"
            placeholder="Show screenshot from your fitness tracker app as a method of proof."
            render={({ field, fieldState, placeholder }) => (
              <Textarea
                aria-invalid={fieldState.invalid}
                id={field.name}
                placeholder={placeholder}
                {...field}
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
