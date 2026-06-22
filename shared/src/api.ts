// Zod request/response DTOs. Server validates inputs; client can reuse for forms.
import { z } from 'zod';

export const dateParam = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const monthParam = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'expected YYYY-MM');

export const foodSchema = z.enum(['control', 'lost']).nullable();
export const moodSchema = z.enum(['good', 'ok', 'low']).nullable();

export const dayInputSchema = z.object({
  work: z.boolean(),
  wake: z.boolean(),
  move: z.boolean(),
  food: foodSchema,
  mood: moodSchema,
  screen_ok: z.boolean(),
  blocks: z.array(z.boolean()).max(24),
  survival_mode: z.boolean(),
});
export type DayInputDTO = z.infer<typeof dayInputSchema>;

export const settingsInputSchema = z.object({
  wake_target: z.string().regex(/^\d{2}:\d{2}$/),
  steps_target: z.number().int().min(0).max(100000),
  work_blocks: z.number().int().min(1).max(12),
  block_length_hrs: z.number().int().min(1).max(12),
  monthly_savings_target: z.number().int().min(0),
});
export type SettingsInputDTO = z.infer<typeof settingsInputSchema>;

export const monthInputSchema = z.object({
  budget: z.number().int().min(0),
  savings: z.number().int().min(0),
  expenses: z.number().int().min(0),
});
export type MonthInputDTO = z.infer<typeof monthInputSchema>;

export const goalInputSchema = z.object({
  scope: z.enum(['month', 'quarter', 'year']),
  period: z.string().nullable().optional(),
  text: z.string().min(1).max(200),
  progress: z.number().int().min(0).max(100),
});
export type GoalInputDTO = z.infer<typeof goalInputSchema>;

export const rewardInputSchema = z.object({
  emoji: z.string().max(8).nullable().optional(),
  label: z.string().min(1).max(120),
  threshold: z.union([z.literal(70), z.literal(90)]),
});
export type RewardInputDTO = z.infer<typeof rewardInputSchema>;

export const taskInputSchema = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(['todo', 'doing', 'done', 'blocked']).optional(),
  priority: z.number().int().min(0).max(3).nullable().optional(),
  project: z.string().max(80).nullable().optional(),
  block: z.string().max(20).nullable().optional(),
  estimate: z.string().max(20).nullable().optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
    .nullable()
    .optional(),
});
export type TaskInputDTO = z.infer<typeof taskInputSchema>;

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});
export type LoginDTO = z.infer<typeof loginSchema>;
