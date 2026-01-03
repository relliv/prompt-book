import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { projects } from './project.model';

export const features = sqliteTable('project_features', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  copyCount: integer('copy_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;
