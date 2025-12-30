import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../lib/logger.js';
import {
  validateKeyFormat,
  validateLicenseOnline,
  saveLicense,
  deleteLicense,
} from '../lib/license.js';

export const activateCommand = new Command('activate')
  .description('Activate your license')
  .argument('[key]', 'License key (CGFW-XXXX-XXXX-XXXX)')
  .option('--deactivate', 'Remove current license')
  .action(async (key, options) => {
    logger.header('License Activation');

    // Deactivate
    if (options.deactivate) {
      await deleteLicense();
      logger.success('License deactivated.');
      return;
    }

    // Prompt for key if not provided
    if (!key) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'licenseKey',
          message: 'Enter your license key:',
          validate: (input) => {
            if (validateKeyFormat(input)) {
              return true;
            }
            return 'Invalid format. Expected: CGFW-XXXX-XXXX-XXXX';
          },
        },
      ]);
      key = answer.licenseKey;
    }

    // Validate format locally
    if (!validateKeyFormat(key)) {
      logger.error('Invalid license key format.');
      logger.info('Expected format: CGFW-XXXX-XXXX-XXXX');
      return;
    }

    // Validate online
    const spinner = logger.spinner('Validating license...');

    try {
      const result = await validateLicenseOnline(key);
      spinner.stop();

      if (result.valid && result.plan && result.expiresAt) {
        await saveLicense(key, result.plan, result.expiresAt);

        console.log();
        logger.box(
          [
            chalk.green.bold('License activated successfully!'),
            '',
            `Plan:    ${chalk.cyan(result.plan)}`,
            `Expires: ${chalk.cyan(new Date(result.expiresAt).toLocaleDateString())}`,
          ],
          'success'
        );
      } else {
        console.log();
        logger.error(result.error || 'License validation failed.');
        logger.info(`Purchase at: ${chalk.cyan('https://atlashub.ch/claude-gitflow')}`);
      }
    } catch (error) {
      spinner.stop();
      logger.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
