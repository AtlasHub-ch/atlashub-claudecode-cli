import { createHash } from 'crypto';
import { homedir, hostname, userInfo, platform } from 'os';
import { join } from 'path';
import fs from 'fs-extra';
import {
  validateLicense as validateJwtLicense,
  hasFeature as jwtHasFeature,
  isWithinLimits as jwtIsWithinLimits,
  decodeLicenseUnsafe,
} from '@atlashub/license-validator';
import type { License, LicenseLimits } from '@atlashub/license-validator';
import {
  LicenseKeySchema,
  JwtLicenseKeySchema,
  LegacyLicenseKeySchema,
  LicenseResponse,
  StoredLicense,
  StoredLicenseSchema,
  PRODUCT_FEATURES,
  type ProductFeature,
} from '../types/license.js';
import { logger } from './logger.js';

const PRODUCT_ID = 'smartstack-tools';
const LICENSE_FILE = join(homedir(), '.smartstack-tools-license.json');
const GRACE_PERIOD_DAYS = 7;

/**
 * Generate a unique machine identifier
 */
export function getMachineId(): string {
  const data = `${hostname()}-${userInfo().username}-${platform()}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Detect license key type
 */
export function detectKeyType(key: string): 'jwt' | 'legacy' | 'invalid' {
  if (JwtLicenseKeySchema.safeParse(key).success) return 'jwt';
  if (LegacyLicenseKeySchema.safeParse(key).success) return 'legacy';
  return 'invalid';
}

/**
 * Validate license key format locally
 */
export function validateKeyFormat(key: string): boolean {
  return LicenseKeySchema.safeParse(key).success;
}

/**
 * Validate a JWT license key
 */
export function validateJwt(licenseKey: string): LicenseResponse {
  const result = validateJwtLicense(licenseKey, {
    productId: PRODUCT_ID,
    gracePeriodDays: GRACE_PERIOD_DAYS,
  });

  if (result.valid && result.license) {
    return {
      valid: true,
      plan: result.license.edition,
      edition: result.license.edition,
      company: result.license.company,
      features: result.license.features,
      expiresAt: result.license.expiresAt.toISOString(),
      daysRemaining: result.license.daysRemaining,
    };
  }

  return {
    valid: false,
    error: result.error || 'Invalid license',
  };
}

/**
 * Save license to local file
 */
export async function saveLicense(
  key: string,
  response: LicenseResponse
): Promise<void> {
  const keyType = detectKeyType(key);

  const license: StoredLicense = {
    key,
    type: keyType === 'jwt' ? 'jwt' : 'legacy',
    plan: response.plan || response.edition || 'unknown',
    edition: response.edition,
    company: response.company,
    features: response.features,
    expiresAt: response.expiresAt || new Date().toISOString(),
    validatedAt: new Date().toISOString(),
    machineId: getMachineId(),
  };

  await fs.writeJson(LICENSE_FILE, license, { spaces: 2 });
}

/**
 * Load license from local file
 */
export async function loadLicense(): Promise<StoredLicense | null> {
  try {
    if (!(await fs.pathExists(LICENSE_FILE))) {
      return null;
    }

    const data = await fs.readJson(LICENSE_FILE);
    return StoredLicenseSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Delete local license
 */
export async function deleteLicense(): Promise<void> {
  if (await fs.pathExists(LICENSE_FILE)) {
    await fs.remove(LICENSE_FILE);
  }
}

/**
 * Check if license is valid (with local cache)
 */
export async function checkLicense(): Promise<{
  valid: boolean;
  plan?: string;
  edition?: string;
  company?: string;
  features?: string[];
  daysRemaining?: number;
  error?: string;
}> {
  const stored = await loadLicense();

  if (!stored) {
    return {
      valid: false,
      error: 'No license found. Run: smartstack-tools activate',
    };
  }

  // For JWT licenses, re-validate the signature
  if (stored.type === 'jwt') {
    const result = validateJwt(stored.key);

    if (!result.valid) {
      return {
        valid: false,
        error: result.error || 'License validation failed',
      };
    }

    return {
      valid: true,
      plan: result.plan,
      edition: result.edition,
      company: result.company,
      features: result.features,
      daysRemaining: result.daysRemaining,
    };
  }

  // Legacy license - check expiration only
  const expiresAt = new Date(stored.expiresAt);
  const now = new Date();

  if (now > expiresAt) {
    return {
      valid: false,
      error: 'License expired',
    };
  }

  return {
    valid: true,
    plan: stored.plan,
    features: stored.features,
  };
}

/**
 * Check if a specific feature is enabled
 */
export async function hasFeature(feature: ProductFeature): Promise<boolean> {
  const result = await checkLicense();

  if (!result.valid) return false;
  if (!result.features) return false;

  // '*' means all features enabled
  if (result.features.includes('*')) return true;

  return result.features.includes(feature);
}

/**
 * Get the validated license details (for display)
 */
export async function getLicenseInfo(): Promise<{
  active: boolean;
  company?: string;
  edition?: string;
  features?: string[];
  expiresAt?: string;
  daysRemaining?: number;
}> {
  const stored = await loadLicense();

  if (!stored) {
    return { active: false };
  }

  const result = await checkLicense();

  return {
    active: result.valid,
    company: result.company || stored.company,
    edition: result.edition || stored.edition,
    features: result.features || stored.features,
    expiresAt: stored.expiresAt,
    daysRemaining: result.daysRemaining,
  };
}

/**
 * Decode license without validation (for debugging)
 */
export function decodeLicense(key: string): Record<string, unknown> | null {
  const keyType = detectKeyType(key);

  if (keyType === 'jwt') {
    return decodeLicenseUnsafe(key) as Record<string, unknown> | null;
  }

  return null;
}

// Re-export feature constants
export { PRODUCT_FEATURES };
