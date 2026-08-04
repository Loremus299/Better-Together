import z from "zod";

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  habitId: z.string().min(1),
  memberEmail: z.email(),
});

export type AddMemberValues = z.infer<typeof addMemberSchema>;
