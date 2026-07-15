import z from "zod";

export const formSchema = z.object({
  name: z.string().min(1),
  email: z.string(),
  password: z.string()
});
