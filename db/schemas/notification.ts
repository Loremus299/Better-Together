import { createId } from "@paralleldrive/cuid2";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const notificationTable = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  user: text("user")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});
