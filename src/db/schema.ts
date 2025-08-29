import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  created_at: timestamp().notNull().defaultNow(),
});

export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed"]);

export const tasksTable = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  status: taskStatusEnum().notNull().default('pending'),
  authorId: uuid().notNull().references(() => usersTable.id),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
})
