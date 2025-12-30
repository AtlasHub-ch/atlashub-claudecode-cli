import { z } from 'zod';

export const GitConfigSchema = z.object({
  branches: z.object({
    main: z.string().default('main'),
    develop: z.string().default('develop'),
  }),
  remote: z.string().default('origin'),
  mergeStrategy: z.string().default('--no-ff'),
  tagPrefix: z.string().default('v'),
});

export const EfCoreConfigSchema = z.object({
  enabled: z.boolean().default(true),
  projectPath: z.string().default('auto-detect'),
  contextName: z.string().default('ApplicationDbContext'),
  migrationsFolder: z.string().default('Migrations'),
  generateScript: z.boolean().default(true),
  scriptOutputPath: z.string().default('./scripts'),
});

export const WorkflowConfigSchema = z.object({
  requireConfirmation: z.boolean().default(true),
  autoDeleteBranch: z.boolean().default(false),
  createCheckpoints: z.boolean().default(true),
  verboseLogging: z.boolean().default(false),
});

export const ProjectConfigSchema = z.object({
  git: GitConfigSchema.default({}),
  efcore: EfCoreConfigSchema.default({}),
  workflow: WorkflowConfigSchema.default({}),
});

export type GitConfig = z.infer<typeof GitConfigSchema>;
export type EfCoreConfig = z.infer<typeof EfCoreConfigSchema>;
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
