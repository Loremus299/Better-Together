"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { addMemberAction } from "../action";
import { toast } from "sonner";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconMailPlus } from "@tabler/icons-react";

const addMemberSchema = z.object({
  habit: z.string().min(1),
  email: z.string().min(1),
});
type AddMemberValues = z.infer<typeof addMemberSchema>;

export default function AddMemberDialog({
  open,
  onOpenChange,
  habit,
  email,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: string;
  email: string;
}) {
  const form = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      habit,
      email,
    },
  });

  const onSubmit = async (values: AddMemberValues) => {
    const act = await addMemberAction(values);
    if (act.success) {
      toast.success("Added user to habit");
    } else {
      toast.error(act.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add member</DialogTitle>
        <form className="grid gap-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="Email"
            name="email"
            placeholder="jane@doe.com"
            render={({ field, fieldState }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                type="email"
              />
            )}
          />
          <Button type="submit">
            <IconMailPlus /> Add user as member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
