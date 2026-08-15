import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { removeMemberAction } from "../action";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormController from "@/components/formController";
import { Button } from "@/components/ui/button";
import { IconMailMinus } from "@tabler/icons-react";

const removeFormSchema = z.object({
  habit: z.string().min(1),
  member: z.string().min(1),
});
type RemoveFormValues = z.infer<typeof removeFormSchema>;

export default function RemoveMemberDialog({
  open,
  onOpenChange,
  members,
  habit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: string;
  members: {
    name: string;
    id: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
}) {
  const form = useForm({
    resolver: zodResolver(removeFormSchema),
    defaultValues: {
      habit,
      member: "",
    },
  });

  const onSubmit = async (values: RemoveFormValues) => {
    const act = await removeMemberAction(values);
    if (act.success) {
      toast.success("Removed member successfully");
    } else {
      toast.error(act.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Remove member</DialogTitle>
        <form className="grid gap-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="Choose member to remove"
            name="member"
            placeholder=""
            render={({ field, fieldState }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue
                    aria-invalid={fieldState.invalid}
                    placeholder="Select member"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Button type="submit">
            <IconMailMinus />
            Remove Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
