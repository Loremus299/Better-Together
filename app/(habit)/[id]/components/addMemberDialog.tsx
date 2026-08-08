"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { addMemberSchema, AddMemberValues } from "../common";
import { zodResolver } from "@hookform/resolvers/zod";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addMemberAction } from "../action";
import { toast } from "sonner";
import { IconUserPlus } from "@tabler/icons-react";

export default function AddMemberDialog({
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
  const form = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId,
      habitId,
      memberEmail: "",
    },
  });

  const onSubmit = async (values: AddMemberValues) => {
    const action = await addMemberAction(values);
    if (!action.success) {
      toast.error(action.error);
    } else {
      toast.success("Member added successfully.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add Member.</DialogTitle>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="User Email"
            name="memberEmail"
            placeholder="jane@example.com"
            render={({ field, fieldState, placeholder }) => (
              <Input
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
                type="email"
                autoComplete="email"
                id={field.name}
                {...field}
              />
            )}
          />
          <Button type="submit">
            <IconUserPlus />
            Add member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
