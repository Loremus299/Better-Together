"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Result } from "@/lib/result";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { updateHeaderAction } from "../action";
import FormController from "@/components/formController";
import { Button } from "@/components/ui/button";
import { IconPhoto } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import ImageInput from "@/components/badcn/imageInput";

const updateHeaderSchema = z.object({
  file: z.file().refine((file) => file.size < 4.5 * 1024 * 1024),
  habit: z.string().min(1),
});
type UpdateHeaderValues = z.infer<typeof updateHeaderSchema>;

export default function UpdateHeaderDialog({
  habit,
  open,
  onOpenChange,
}: {
  habit: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(updateHeaderSchema),
    defaultValues: {
      habit,
      file: undefined,
    },
  });

  const onSubmit = async (values: UpdateHeaderValues) => {
    const toastID = toast.loading("Processing");
    const q = await Result.tryCatch({}, async () => {
      const data = new FormData();
      data.append("file", values.file);
      return fetch("/api/media", {
        method: "POST",
        body: data,
      });
    });
    if (!q.value.success) {
      toast.error("Could not make fetch request successfully");
    } else {
      const data = await q.value.data.json();
      if (q.value.data.ok) {
        const act = await updateHeaderAction({ habit, header: data.id });
        if (!act.success) {
          toast.dismiss(toastID);
          toast.error(act.error);
        } else {
          toast.dismiss(toastID);
          router.refresh();
        }
      } else {
        toast.dismiss(toastID);
        toast.error(data.error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Update header image</DialogTitle>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
          <FormController
            form={form}
            label="New image"
            name="file"
            placeholder=""
            render={({ field, fieldState }) => (
              <ImageInput
                aria-invalid={fieldState.invalid}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  field.onChange(file);
                }}
              />
            )}
          />
          <Button type="submit">
            <IconPhoto /> Update image
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
