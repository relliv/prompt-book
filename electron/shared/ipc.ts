import { tipc } from '@egoist/tipc/main';
import { eq, desc } from 'drizzle-orm';
import { getDatabase } from '@main/database';
import { projects, prompts } from '@app/shared/models';

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

// Prompt input types
interface CreatePromptInput {
  projectId: number;
  prompt: string;
}

interface UpdatePromptInput {
  id: number;
  prompt: string;
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

  // ==================== Prompt CRUD Operations ====================

  // Get all prompts for a project
  getPromptsByProject: tipc
    .create()
    .procedure.input<{ projectId: number }>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .select()
        .from(prompts)
        .where(eq(prompts.projectId, input.projectId))
        .orderBy(desc(prompts.createdAt));
      return result;
    }),

  // Get single prompt by ID
  getPrompt: tipc
    .create()
    .procedure.input<{ id: number }>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .select()
        .from(prompts)
        .where(eq(prompts.id, input.id));
      return result[0] ?? null;
    }),

  // Create new prompt
  createPrompt: tipc
    .create()
    .procedure.input<CreatePromptInput>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .insert(prompts)
        .values({
          projectId: input.projectId,
          prompt: input.prompt,
        })
        .returning();
      const created = result[0];
      if (!created) throw new Error('Failed to create prompt');
      return created;
    }),

  // Update prompt
  updatePrompt: tipc
    .create()
    .procedure.input<UpdatePromptInput>()
    .action(async ({ input }) => {
      const db = getDatabase();
      const result = await db
        .update(prompts)
        .set({
          prompt: input.prompt,
          updatedAt: new Date(),
        })
        .where(eq(prompts.id, input.id))
        .returning();
      return result[0] ?? null;
    }),

  // Delete prompt
  deletePrompt: tipc
    .create()
    .procedure.input<{ id: number }>()
    .action(async ({ input }) => {
      const db = getDatabase();
      await db.delete(prompts).where(eq(prompts.id, input.id));
      return { success: true };
    }),

  // Increment copy count
  incrementPromptCopyCount: tipc
    .create()
    .procedure.input<{ id: number }>()
    .action(async ({ input }) => {
      const db = getDatabase();
      // Get current prompt
      const current = await db
        .select()
        .from(prompts)
        .where(eq(prompts.id, input.id));
      if (!current[0]) return null;

      const result = await db
        .update(prompts)
        .set({ copyCount: current[0].copyCount + 1 })
        .where(eq(prompts.id, input.id))
        .returning();
      return result[0] ?? null;
    }),
};

export type AppRouter = typeof router;
