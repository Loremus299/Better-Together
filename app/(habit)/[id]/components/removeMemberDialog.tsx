"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { removeMemberSchema, RemoveMemberValues } from "../common";
import FormController from "@/components/formController";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { removeMemberAction } from "../action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function RemoveMemberDialog({
  open,
  onOpenChange,
  members,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: { id: string; email: string }[];
}) {
  const form = useForm({
    resolver: zodResolver(removeMemberSchema),
    defaultValues: {
      habitId: "",
    },
  });

  const onSubmit = async (value: RemoveMemberValues) => {
    const act = await removeMemberAction(value.habitId);
    if (act.success) {
      toast.success("Member removed from habit.");
    } else {
      toast.error(act.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Remove Member</DialogTitle>
      <DialogContent>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="Remove Member"
            name="habitId"
            placeholder="Select member"
            render={({ field, fieldState, placeholder }) => (
              <Select
                id={field.name}
                {...field}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue
                    aria-invalid={fieldState.invalid}
                    placeholder={placeholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {members.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.email}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Button type="submit">Remove Member</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
