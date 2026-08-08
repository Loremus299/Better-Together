import { useForm } from "react-hook-form";
import { editDetailsSchema, EditDetailsValues } from "../common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { editHabitAction } from "../action";
import { useRouter } from "next/navigation";

export default function EditDetailsDialog({
  open,
  onOpenChange,
  userId,
  habitId,
  name,
  description,
  oldHeader,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  habitId: string;
  name: string;
  description: string;
  oldHeader: string | null;
}) {
  const router = useRouter();
  const form = useForm<EditDetailsValues>({
    resolver: zodResolver(editDetailsSchema),
    defaultValues: {
      userId,
      habitId,
      name,
      description,
      header: undefined,
    },
  });

  const onSubmit = async (values: EditDetailsValues) => {
    const { header, ...restValues } = values;
    let log = oldHeader;

    if (header) {
      const form = new FormData();
      form.append("file", header);

      const req = await fetch("/api/media", {
        method: "POST",
        body: form,
      });

      const res = await req.json();

      if (!req.ok) {
        toast.error(res.error);
      } else {
        log = res.log as string;
      }
    }

    const act = await editHabitAction({
      ...restValues,
      finalHeader: log,
    });

    if (!act.success) {
      toast.error(act.error);
    } else {
      toast.success("Habit updated successfully.");
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Details.</DialogTitle>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="Header image"
            name="header"
            placeholder="image/jpeg,image/png,image/gif"
            render={({ field, fieldState }) => (
              <Input
                aria-invalid={fieldState.invalid}
                type="file"
                accept=""
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  field.onChange(file);
                }}
              />
            )}
          />

          <FormController
            form={form}
            label="New name"
            name="name"
            placeholder="Habit Name..."
            render={({ field, fieldState, placeholder }) => (
              <Input
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
                id={field.name}
                {...field}
              />
            )}
          />

          <FormController
            form={form}
            label="New Description"
            name="description"
            placeholder="Habit Description"
            render={({ field, fieldState, placeholder }) => (
              <Textarea
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
                id={field.name}
                {...field}
              />
            )}
          />
          <Button type="submit">Update habit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
