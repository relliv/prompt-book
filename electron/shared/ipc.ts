import { tipc } from '@egoist/tipc/main';
import os from 'os';
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
  // Example: Get app version
  getAppVersion: tipc.create().procedure.action(async () => {
    const { app } = await import('electron');
    return app.getVersion();
  }),

  // Example: Complex operation with error handling
  saveData: tipc
    .create()
    .procedure.input<{ key: string; value: unknown }>()
    .action(async ({ input }) => {
      try {
        // In a real app, you might save to a database or file
        console.log(
          `Saving data: ${input.key} = ${JSON.stringify(input.value)}`
        );
        return {
          success: true,
          message: `Data saved successfully for key: ${input.key}`,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  // Example: Get system info
  getSystemInfo: tipc.create().procedure.action(async () => {
    return {
      platform: os.platform(),
      arch: os.arch(),
      version: os.release(),
      hostname: os.hostname(),
    };
  }),

  // Get process versions (Electron, Chrome, Node)
  getVersions: tipc.create().procedure.action(async () => {
    return {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    };
  }),

  // ==================== Project CRUD Operations ====================

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
};

export type AppRouter = typeof router;
