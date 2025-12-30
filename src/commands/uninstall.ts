import { Command } from 'commander';
import inquirer from 'inquirer';
import { logger } from '../lib/logger.js';
import { uninstallCommands } from '../lib/installer.js';

export const uninstallCommand = new Command('uninstall')
  .alias('u')
  .description('Remove GitFlow commands from the current project')
  .option('--keep-plans', 'Keep existing plans')
  .option('--keep-config', 'Keep configuration file')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (options) => {
    logger.header('Uninstalling Claude GitFlow Commands');

    // Confirm
    if (!options.yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to uninstall GitFlow commands?',
          default: false,
        },
      ]);

      if (!confirm) {
        logger.info('Cancelled.');
        return;
      }
    }

    try {
      await uninstallCommands({
        keepPlans: options.keepPlans,
        keepConfig: options.keepConfig,
      });

      console.log();
      logger.success('Uninstalled successfully.');
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Uninstallation failed');
      process.exit(1);
    }
  });
