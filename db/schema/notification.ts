import { createId } from "@paralleldrive/cuid2";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const notificationTable = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  user: text("user").references(() => user.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
