import z from "zod";

export const createHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
export type CreateHabitValues = z.infer<typeof createHabitSchema>;
