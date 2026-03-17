import { z } from 'zod';

export const classificationSchema = z.object({
  type: z.enum(['order', 'support', 'query', 'other']),
  confidence: z.number().min(0).max(1).default(0.5),
  reason: z.string().min(1)
});

export const extractionSchema = z.object({
  customerName: z.string().nullable().optional().default(null),
  phone: z.string().nullable().optional().default(null),
  product: z.string().nullable().optional().default(null),
  quantity: z.union([z.number().int().positive(), z.null()]).optional().default(null),
  address: z.string().nullable().optional().default(null),
  city: z.string().nullable().optional().default(null),
  notes: z.string().nullable().optional().default(null),
  subject: z.string().nullable().optional().default(null),
  issueSummary: z.string().nullable().optional().default(null),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  email: z.string().nullable().optional().default(null),
  organization: z.string().nullable().optional().default(null),
  topic: z.string().nullable().optional().default(null)
});

export const replySchema = z.object({
  reply: z.string().min(1)
});

export const validateWithSchema = (schema, payload) => {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    };
  }

  return { success: true, data: parsed.data, error: null };
};
