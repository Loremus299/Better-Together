"use client";

import { FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createHabitAction } from "./action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@tabler/icons-react";
import z from "zod";

const createHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
type CreateHabitValues = z.infer<typeof createHabitSchema>;

export default function CreateHabitForm({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(createHabitSchema),
    defaultValues: { name, description },
  });

  const onSubmit = async (values: CreateHabitValues) => {
    const action = await createHabitAction(values);
    if (action.success) {
      router.replace(`/${action.data}`);
    } else {
      toast.error(action.error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid">
      <FieldGroup>
        <FormController
          form={form}
          label="Name"
          name="name"
          placeholder="Fit Together"
          render={({ field, fieldState, placeholder }) => (
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              id={field.name}
              placeholder={placeholder}
            />
          )}
        />
        <FormController
          form={form}
          label="Description"
          name="description"
          placeholder="Getting fit together"
          render={({ field, fieldState, placeholder }) => (
            <Textarea
              {...field}
              aria-invalid={fieldState.invalid}
              id={field.name}
              placeholder={placeholder}
            />
          )}
        />
        <Button type="submit">
          <IconCheck />
          Create Habit
        </Button>
      </FieldGroup>
    </form>
  );
}
