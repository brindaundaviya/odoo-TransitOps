import { z } from 'zod';

/**
 * Zod is configured and ready for form validation.
 * Domain schemas will be added alongside feature modules.
 */
export const foundationSchema = z.object({
  placeholder: z.string().optional(),
});

export type FoundationSchema = z.infer<typeof foundationSchema>;
