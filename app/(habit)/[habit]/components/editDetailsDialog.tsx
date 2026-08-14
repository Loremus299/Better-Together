"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { updateDetailsAction } from "../action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconPencil } from "@tabler/icons-react";

const editDetailsSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  habit: z.string().min(1),
});
type EditDetailsValue = z.infer<typeof editDetailsSchema>;

export default function EditDetailsDialog({
  open,
  onOpenChange,
  name,
  description,
  habit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  description: string;
  habit: string;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(editDetailsSchema),
    defaultValues: {
      name,
      description,
      habit,
    },
  });

  const onSubmit = async (values: EditDetailsValue) => {
    console.log("hi");
    const act = await updateDetailsAction(values);
    if (act.success) {
      toast.success("Successfully updated details");
      router.refresh();
    } else {
      toast.error(act.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit details.</DialogTitle>
        <form className="grid gap-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="New name"
            name="name"
            placeholder=""
            render={({ field, fieldState }) => (
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id={field.name}
              />
            )}
          />
          <FormController
            form={form}
            label="New description"
            name="description"
            placeholder=""
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                id={field.name}
              />
            )}
          />
          <Button type="submit">
            <IconPencil />
            Update details
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
