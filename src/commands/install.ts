import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../lib/logger.js';
import { checkLicense } from '../lib/license.js';
import { installCommands } from '../lib/installer.js';
import { detectProject } from '../lib/detector.js';

export const installCommand = new Command('install')
  .alias('i')
  .description('Install GitFlow commands in the current project')
  .option('-f, --force', 'Overwrite existing commands')
  .option('--no-config', 'Skip config file creation')
  .option('--skip-license', 'Skip license check (for testing)')
  .action(async (options) => {
    logger.header('Installing Claude GitFlow Commands');

    // Check license (unless skipped)
    if (!options.skipLicense) {
      const license = await checkLicense();

      if (!license.valid) {
        logger.box(
          [
            'No valid license found.',
            '',
            'To activate your license:',
            `  ${chalk.cyan('claude-gitflow activate <YOUR-KEY>')}`,
            '',
            'To purchase a license:',
            `  ${chalk.cyan('https://atlashub.ch/claude-gitflow')}`,
          ],
          'warning'
        );
        return;
      }

      logger.success(`License valid (${license.plan})`);
    }

    // Detect project
    const spinner = logger.spinner('Detecting project...');
    const project = await detectProject();
    spinner.stop();

    console.log();
    logger.info(`Git repository: ${project.isGitRepo ? chalk.green('Yes') : chalk.yellow('No')}`);
    logger.info(`.NET project: ${project.hasDotNet ? chalk.green('Yes') : chalk.gray('No')}`);
    logger.info(`EF Core: ${project.hasEfCore ? chalk.green('Yes') : chalk.gray('No')}`);
    console.log();

    if (!project.isGitRepo) {
      logger.warning('Not a Git repository. GitFlow commands may not work correctly.');
    }

    // Install
    try {
      await installCommands({
        force: options.force,
        skipConfig: !options.config,
      });

      console.log();
      logger.box(
        [
          chalk.green.bold('Installation complete!'),
          '',
          'Available commands in Claude Code:',
          `  ${chalk.cyan('/gf-plan')}   - Generate integration plan`,
          `  ${chalk.cyan('/gf-exec')}   - Execute a plan`,
          `  ${chalk.cyan('/gf-status')} - Show GitFlow status`,
          `  ${chalk.cyan('/gf-abort')}  - Abort a plan`,
        ],
        'success'
      );
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'Installation failed');
      process.exit(1);
    }
  });
