"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { addCheckerAction, addMemberAction } from "../action";
import { toast } from "sonner";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconMailPlus } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const addMemberSchema = z.object({
  habit: z.string().min(1),
  email: z.string().min(1),
  checker: z.boolean(),
});
type AddMemberValues = z.infer<typeof addMemberSchema>;

export default function AddMemberDialog({
  open,
  onOpenChange,
  habit,
  email,
  checker,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: string;
  email: string;
  checker: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      habit,
      email,
      checker,
    },
  });

  const onSubmit = async (values: AddMemberValues) => {
    const toastID = toast.loading("Processing");
    if (values.checker == true) {
      const act = await addCheckerAction(values);
      toast.dismiss(toastID);
      if (act.success) {
        toast.success("Added user to habit as checker");
      } else {
        toast.error(act.error);
      }
    } else {
      const act = await addMemberAction(values);
      toast.dismiss(toastID);
      if (act.success) {
        toast.success("Added user to habit");
      } else {
        toast.error(act.error);
      }
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
                type="new-email"
              />
            )}
          />
          <FormController
            form={form}
            label="Add as checker ?"
            name="checker"
            placeholder=""
            render={({ field, fieldState }) => (
              <div className="flex gap-2 items-center">
                <Checkbox
                  aria-invalid={fieldState.invalid}
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Add user as Checker</Label>
              </div>
            )}
          />
          <Button type="submit">
            <IconMailPlus /> Add user
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
