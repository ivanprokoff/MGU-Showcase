import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const widgetsTable = pgTable("widgets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWidgetSchema = createInsertSchema(widgetsTable).omit({ id: true, createdAt: true });
export type InsertWidget = z.infer<typeof insertWidgetSchema>;
export type Widget = typeof widgetsTable.$inferSelect;
