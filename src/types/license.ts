import { z } from 'zod';

export const LicenseKeySchema = z.string().regex(
  /^CGFW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
  'Invalid license key format. Expected: CGFW-XXXX-XXXX-XXXX'
);

export const LicensePlanSchema = z.enum(['trial', 'pro', 'team', 'enterprise']);

export const LicenseResponseSchema = z.object({
  valid: z.boolean(),
  plan: LicensePlanSchema.optional(),
  expiresAt: z.string().optional(),
  features: z.array(z.string()).optional(),
  error: z.string().optional(),
});

export const StoredLicenseSchema = z.object({
  key: z.string(),
  plan: LicensePlanSchema,
  expiresAt: z.string(),
  validatedAt: z.string(),
  machineId: z.string(),
});

export type LicenseKey = z.infer<typeof LicenseKeySchema>;
export type LicensePlan = z.infer<typeof LicensePlanSchema>;
export type LicenseResponse = z.infer<typeof LicenseResponseSchema>;
export type StoredLicense = z.infer<typeof StoredLicenseSchema>;
