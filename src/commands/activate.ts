import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../lib/logger.js';
import {
  validateKeyFormat,
  detectKeyType,
  validateJwt,
  saveLicense,
  deleteLicense,
  getLicenseInfo,
  decodeLicense,
} from '../lib/license.js';

export const activateCommand = new Command('activate')
  .description('Activate your license')
  .argument('[key]', 'License key (JWT token)')
  .option('--deactivate', 'Remove current license')
  .option('--status', 'Show current license status')
  .option('--decode', 'Decode license key without validation (debug)')
  .action(async (key, options) => {
    logger.header('License Management');

    // Show status
    if (options.status) {
      const info = await getLicenseInfo();

      if (!info.active) {
        logger.warn('No active license.');
        logger.info(`Activate with: ${chalk.cyan('smartstack-tools activate <key>')}`);
        logger.info(`Purchase at: ${chalk.cyan('https://atlashub.ch/smartstack-tools')}`);
        return;
      }

      console.log();
      logger.box(
        [
          chalk.green.bold('License Active'),
          '',
          `Company:  ${chalk.cyan(info.company || 'N/A')}`,
          `Edition:  ${chalk.cyan(info.edition || 'N/A')}`,
          `Features: ${chalk.cyan(info.features?.join(', ') || '*')}`,
          `Expires:  ${chalk.cyan(info.expiresAt ? new Date(info.expiresAt).toLocaleDateString() : 'N/A')}`,
          info.daysRemaining !== undefined
            ? `Remaining: ${chalk.yellow(info.daysRemaining + ' days')}`
            : '',
        ].filter(Boolean),
        'success'
      );
      return;
    }

    // Deactivate
    if (options.deactivate) {
      await deleteLicense();
      logger.success('License deactivated.');
      return;
    }

    // Decode only (debug)
    if (options.decode && key) {
      const decoded = decodeLicense(key);
      if (decoded) {
        console.log();
        console.log(chalk.yellow('Decoded license (unverified):'));
        console.log(JSON.stringify(decoded, null, 2));
      } else {
        logger.error('Could not decode license key.');
      }
      return;
    }

    // Prompt for key if not provided
    if (!key) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'licenseKey',
          message: 'Enter your license key (JWT):',
          validate: (input) => {
            if (validateKeyFormat(input)) {
              return true;
            }
            return 'Invalid license key format.';
          },
        },
      ]);
      key = answer.licenseKey;
    }

    // Validate format locally
    if (!validateKeyFormat(key)) {
      logger.error('Invalid license key format.');
      logger.info('Expected: JWT token (eyJ...)');
      return;
    }

    // Detect key type
    const keyType = detectKeyType(key);
    const spinner = logger.spinner('Validating license...');

    try {
      let result;

      if (keyType === 'jwt') {
        // Validate JWT locally (no API call needed)
        result = validateJwt(key);
      } else {
        spinner.stop();
        logger.error('Legacy license keys are no longer supported.');
        logger.info('Please obtain a new JWT license key.');
        return;
      }

      spinner.stop();

      if (result.valid) {
        await saveLicense(key, result);

        console.log();
        logger.box(
          [
            chalk.green.bold('✓ License activated successfully!'),
            '',
            `Company:  ${chalk.cyan(result.company || 'N/A')}`,
            `Edition:  ${chalk.cyan(result.edition || result.plan || 'N/A')}`,
            `Features: ${chalk.cyan(result.features?.join(', ') || '*')}`,
            `Expires:  ${chalk.cyan(result.expiresAt ? new Date(result.expiresAt).toLocaleDateString() : 'N/A')}`,
            result.daysRemaining !== undefined
              ? `Remaining: ${chalk.yellow(result.daysRemaining + ' days')}`
              : '',
          ].filter(Boolean),
          'success'
        );
      } else {
        console.log();
        logger.error(result.error || 'License validation failed.');
        logger.info(`Purchase at: ${chalk.cyan('https://atlashub.ch/smartstack-tools')}`);
      }
    } catch (error) {
      spinner.stop();
      logger.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
