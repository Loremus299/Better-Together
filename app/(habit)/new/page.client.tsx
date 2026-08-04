"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createHabitSchema, CreateHabitValues } from "./common";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { CreateHabitAction } from "./action";
import { useRouter } from "next/navigation";

export default function CreateHabitForm({ admin }: { admin: string }) {
  const router = useRouter();
  const form = useForm<CreateHabitValues>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      admin,
      header: undefined,
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateHabitValues) => {
    const form = new FormData();
    form.append("file", values.header);

    const req = await fetch("/api/media", {
      method: "POST",
      body: form,
    });

    const res = await req.json();

    if (!req.ok) {
      toast.error(res.error);
      return null;
    }

    const action = await CreateHabitAction({
      name: values.name,
      admin: values.admin,
      description: values.description,
      log: res.log,
    });

    if (!action.success) {
      toast.error(action.error);
    } else {
      toast.success("Created habit successfully.");
      router.push(`/${action.data}`);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <FormController
        form={form}
        label="Header Image (16:9 encouraged)"
        name="header"
        placeholder=""
        render={({ field, fieldState }) => (
          <Input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            aria-invalid={fieldState.invalid}
            id={field.name}
            onChange={(e) => {
              const file = e.target.files?.[0];
              field.onChange(file);
            }}
          />
        )}
      />
      <FormController
        form={form}
        label="Habit Name"
        name="name"
        placeholder="Getting Fit"
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
        label="Habit Description"
        name="description"
        placeholder="Getting fit together."
        render={({ field, fieldState, placeholder }) => (
          <Textarea
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            id={field.name}
            {...field}
          />
        )}
      />
      <Button type="submit">
        <IconCheck />
        Create Habit
      </Button>
    </form>
  );
}
