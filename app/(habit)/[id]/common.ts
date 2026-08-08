import z from "zod";

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  habitId: z.string().min(1),
  memberEmail: z.email(),
});

export type AddMemberValues = z.infer<typeof addMemberSchema>;

export const addTaskSchema = z.object({
  userId: z.string().min(1),
  habitId: z.string().min(1),
  taskName: z.string().min(1),
  taskDescription: z.string().min(1),
});

export type AddTaskValues = z.infer<typeof addTaskSchema>;

export const editDetailsSchema = z.object({
  userId: z.string().min(1),
  habitId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  header: z
    .file()
    .refine((item) =>
      ["image/png", "image/jpeg", "image/gif"].includes(item.type),
    )
    .optional(),
});

export type EditDetailsValues = z.infer<typeof editDetailsSchema>;
