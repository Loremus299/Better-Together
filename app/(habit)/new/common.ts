import z from "zod";

export const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1)
})

export type FormValues = z.infer<typeof formSchema>;