import { tipc } from '@egoist/tipc/main';
import { eq } from 'drizzle-orm';
import { getDatabase } from '@main/database';
import { projects } from '@app/shared/models';

// Project input types
interface CreateProjectInput {
  name: string;
  description?: string;
  icon?: string;
}

interface UpdateProjectInput {
  id: number;
  name?: string;
  description?: string;
  icon?: string;
}

// Define your IPC routes with full type safety
export const router = {
  // Get all projects
  getProjects: tipc.create().procedure.action(async () => {
    const db = getDatabase();
    const result = await db.select().from(projects).orderBy(projects.createdAt);
    return result;
  }),

  // Get single project by ID
  getProject: tipc
    .create()
    .procedure.input<{ id: number }>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id));
      return result[0] ?? null;
    }),

  // Create new project
  createProject: tipc
    .create()
    .procedure.input<CreateProjectInput>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description ?? null,
          icon: input.icon ?? '📁',
        })
        .returning();
      const created = result[0];
      if (!created) throw new Error('Failed to create project');
      return created;
    }),

  // Update project
  updateProject: tipc
    .create()
    .procedure.input<UpdateProjectInput>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .update(projects)
        .set({
          name: input.name,
          description: input.description,
          icon: input.icon,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, input.id))
        .returning();
      return result[0] ?? null;
    }),

  // Delete project
  deleteProject: tipc
    .create()
    .procedure.input<{ id: number }>()
    .action(async ({ input }) => {
      const db = getDatabase();
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),

  // Open project (update lastOpenedAt)
  openProject: tipc
    .create()
    .procedure.input<{ id: number }>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .update(projects)
        .set({ lastOpenedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning();
      return result[0] ?? null;
    }),
};

export type AppRouter = typeof router;
