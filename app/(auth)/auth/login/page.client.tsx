"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import FormController from "@/components/formController";
import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email,
      password,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message ?? "Invalid email or password.");
      return;
    }

    toast.success("Signed in successfully.");
    router.push("/dashboard");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
      <FieldGroup>
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
                autoComplete="current-password"
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
            Sign in
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register">Create one</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
