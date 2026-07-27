import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { mediaTable } from "./media";

export const habitTable = pgTable("habit", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  header: text("header").references(() => mediaTable.id, { onDelete: "cascade" }).notNull(),
  admin: text("admin").references(() => user.id, { onDelete: "restrict" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
})

export const habitMembersTable = pgTable("habitMembers", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  habit: text("habit").references(() => habitTable.id, { onDelete: "cascade" }).notNull(),
  member: text("member").references(() => user.id, { onDelete: "cascade" }).notNull()
})

export const habitTasksTable = pgTable("habitTasks", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  habit: text("habit").references(() => habitTable.id, { onDelete: "cascade" }).notNull(),
  task: text("task").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
})

export const proofStatusEnum = pgEnum("proofStatus", ["pending", "accepted", "declined"])

export const habitProofsTable = pgTable("habitProofs", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  habit: text("habit").references(() => habitTable.id, { onDelete: "cascade" }).notNull(),
  timeStamp: text("timestamp").$defaultFn(() => (Math.floor(Date.now() / 1000).toString())),
  description: text("description"),
  media: text("media").references(() => mediaTable.id, { onDelete: "cascade" }).notNull(),
  proofStatus: proofStatusEnum("proofStatus").notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow().$onUpdate(() => new Date()),
})

