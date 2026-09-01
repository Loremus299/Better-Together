import { createId } from "@paralleldrive/cuid2";
import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const logTable = pgTable("log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  key: text("key").notNull(),
  value: text("value"),
  time: integer("time").notNull(),
});
