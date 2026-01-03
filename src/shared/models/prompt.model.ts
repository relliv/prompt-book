import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { projects } from './project.model';
import { features } from './feature.model';

export const prompts = sqliteTable('project_prompts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  featureId: integer('feature_id')
    .notNull()
    .references(() => features.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  copyCount: integer('copy_count').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
