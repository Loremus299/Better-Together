"use client";

import { formSchema, FormValues } from "./common";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup } from "@/components/ui/field";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { createNewHabitAction } from "./action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NewHabitForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const req = await createNewHabitAction(values);

    if (!req.success) {
      toast.error(req.error);
      return null;
    }

    router.push(`/habit/${req.data}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormController
          form={form}
          label="Habit Name"
          name="name"
          placeholder="Habit Name"
          render={({ field, fieldState, placeholder }) => (
            <Input
              {...field}
              id={field.name}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
            />
          )}
        />
        <FormController
          form={form}
          label="Habit Description"
          name="description"
          placeholder="Habit Description"
          render={({ field, fieldState, placeholder }) => (
            <Textarea
              {...field}
              id={field.name}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
            />
          )}
        />
        <Button type="submit">Create New Habit</Button>
      </FieldGroup>
    </form>
  );
}
