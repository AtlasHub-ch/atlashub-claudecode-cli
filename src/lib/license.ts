import { createHash } from 'crypto';
import { homedir, hostname, userInfo, platform } from 'os';
import { join } from 'path';
import fs from 'fs-extra';
import {
  LicenseKeySchema,
  LicenseResponse,
  LicenseResponseSchema,
  StoredLicense,
  StoredLicenseSchema,
} from '../types/license.js';
import { logger } from './logger.js';

const API_URL = process.env.LICENSE_API_URL || 'https://api.atlashub.ch/api/licenses';
const LICENSE_FILE = join(homedir(), '.claude-gitflow-license.json');
const SECRET_SALT = 'atlashub-cgf-2024';

/**
 * Generate a unique machine identifier
 */
export function getMachineId(): string {
  const data = `${hostname()}-${userInfo().username}-${platform()}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Validate license key format locally (checksum verification)
 */
export function validateKeyFormat(key: string): boolean {
  const result = LicenseKeySchema.safeParse(key);
  if (!result.success) return false;

  const parts = key.split('-');
  const expectedChecksum = generateChecksum(parts[1] + parts[2]);
  return parts[3] === expectedChecksum;
}

/**
 * Generate checksum for license key validation
 */
function generateChecksum(input: string): string {
  return createHash('sha256')
    .update(input + SECRET_SALT)
    .digest('base64')
    .replace(/[+/=]/g, '')
    .substring(0, 4)
    .toUpperCase();
}

/**
 * Validate license via API
 */
export async function validateLicenseOnline(licenseKey: string): Promise<LicenseResponse> {
  try {
    const response = await fetch(`${API_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        machineId: getMachineId(),
      }),
    });

    const data = await response.json();
    return LicenseResponseSchema.parse(data);
  } catch (error) {
    return {
      valid: false,
      error: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Save license to local file
 */
export async function saveLicense(
  key: string,
  plan: string,
  expiresAt: string
): Promise<void> {
  const license: StoredLicense = {
    key,
    plan: plan as StoredLicense['plan'],
    expiresAt,
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
 * LICENSE DISABLED - Always returns valid
 */
export async function checkLicense(): Promise<{
  valid: boolean;
  plan?: string;
  error?: string;
  offline?: boolean;
}> {
  // License validation disabled - always return valid
  return { valid: true, plan: 'enterprise' };
}
