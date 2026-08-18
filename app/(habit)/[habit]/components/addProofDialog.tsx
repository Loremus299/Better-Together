"use client";

import { Result } from "@/lib/result";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createProofAction } from "../action";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconPhotoPlus } from "@tabler/icons-react";
import FormController from "@/components/formController";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const addProofSchema = z.object({
  id: z.string().min(1),
  description: z.string(),
  media: z
    .file()
    .refine((item) => ["image/png", "image/jpeg"].includes(item.type))
    .optional(),
});
type AddProofValues = z.infer<typeof addProofSchema>;

export default function AddProofDialog({
  id,
  description,
}: {
  id: string;
  description: string;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(addProofSchema),
    defaultValues: {
      id,
      description,
      media: undefined,
    },
  });

  const onSubmit = async (values: AddProofValues) => {
    const data = new FormData();

    if (values.media) {
      data.append("file", values.media);

      const q = await Result.tryCatch({}, async () => {
        return fetch("/api/media", {
          method: "POST",
          body: data,
        });
      });

      if (!q.value.success)
        return toast.error("Could not make fetch request successfully");

      const res = await q.value.data.json();

      if (!q.value.data.ok) return toast.error(res.error);

      const act = await createProofAction({
        id: values.id,
        description: values.description,
        media: res.id,
      });

      if (!act.success) {
        toast.error(act.error);
      } else {
        router.refresh();
        toast.success("Added proof for today");
      }
    } else {
      const act = await createProofAction({
        id: values.id,
        description: values.description,
      });

      if (!act.success) {
        toast.error(act.error);
      } else {
        router.refresh();
        toast.success("Added proof for today");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <IconPhotoPlus className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Proof</DialogTitle>
        <form className="grid gap-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormController
            form={form}
            label="Description"
            name="description"
            placeholder="Describe your proof"
            render={({ field, fieldState, placeholder }) => (
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
              />
            )}
          />
          <FormController
            form={form}
            label="Proof Document"
            name="media"
            placeholder=""
            render={({ field, fieldState }) => (
              <Input
                aria-invalid={fieldState.invalid}
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  field.onChange(file);
                }}
              />
            )}
          />
          <Button type="submit">
            <IconPhotoPlus />
            Add Proof
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
