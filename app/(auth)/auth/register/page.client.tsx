"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { formSchema } from "./common";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import FormController from "@/components/formController";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

type FormValues = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    toast.success("Account created successfully.");
    router.push("/dashboard");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormController
          form={form}
          label="Name"
          name="name"
          placeholder="Jane Doe"
          render={({ field, fieldState, placeholder }) => (
            <Input
              {...field}
              id={field.name}
              type="text"
              autoComplete="name"
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
            />
          )}
        />

        <FormController
          form={form}
          label="Email"
          name="email"
          placeholder="jane@example.com"
          render={({ field, fieldState, placeholder }) => (
            <Input
              {...field}
              id={field.name}
              type="email"
              autoComplete="email"
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
            />
          )}
        />

        <FormController
          form={form}
          label="Password"
          name="password"
          placeholder=""
          render={({ field, fieldState }) => (
            <div className="flex gap-2">
              <Input
                {...field}
                id={field.name}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              <Button
                variant={"outline"}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </Button>
            </div>
          )}
        />

        <Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Create account
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
