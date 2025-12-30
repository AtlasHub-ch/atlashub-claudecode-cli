import { Command } from 'commander';
import { logger } from '../lib/logger.js';
import { updateCommands, checkInstallation } from '../lib/installer.js';

export const updateCommand = new Command('update')
  .description('Update commands to the latest version')
  .action(async () => {
    logger.header('Updating Claude GitFlow Commands');

    // Check if installed
    const installation = await checkInstallation();

    if (!installation.installed) {
      logger.warning('GitFlow commands are not installed.');
      logger.info('Run: claude-gitflow install');
      return;
    }

    const spinner = logger.spinner('Updating commands...');

    try {
      await updateCommands();
      spinner.succeed('Commands updated successfully!');
    } catch (error) {
      spinner.fail('Update failed');
      logger.error(error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });
