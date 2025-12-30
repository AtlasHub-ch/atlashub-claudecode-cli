import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { logger } from '../lib/logger.js';
import { checkLicense, loadLicense } from '../lib/license.js';
import { checkInstallation } from '../lib/installer.js';
import { detectProject } from '../lib/detector.js';

export const statusCommand = new Command('status')
  .alias('s')
  .description('Show installation and license status')
  .action(async () => {
    logger.header('Claude GitFlow Status');

    // License status
    const license = await loadLicense();
    const licenseCheck = await checkLicense();

    const licenseTable = new Table({
      head: [chalk.cyan('License')],
      style: { head: [], border: [] },
    });

    if (license && licenseCheck.valid) {
      licenseTable.push(
        [`Status: ${chalk.green('Active')}`],
        [`Plan: ${chalk.cyan(license.plan)}`],
        [`Expires: ${new Date(license.expiresAt).toLocaleDateString()}`],
        [`Machine: ${license.machineId.substring(0, 8)}...`]
      );
    } else {
      licenseTable.push(
        [`Status: ${chalk.yellow('Not activated')}`],
        [`Run: ${chalk.cyan('claude-gitflow activate')}`]
      );
    }

    console.log(licenseTable.toString());
    console.log();

    // Installation status
    const installation = await checkInstallation();

    const installTable = new Table({
      head: [chalk.cyan('Commands'), chalk.cyan('Status')],
      style: { head: [], border: [] },
    });

    for (const cmd of installation.commands) {
      const status = cmd.installed ? chalk.green('✓ Installed') : chalk.gray('Not installed');
      installTable.push([`/${cmd.name}`, status]);
    }

    console.log(installTable.toString());
    console.log();

    // Project info
    const project = await detectProject();

    const projectTable = new Table({
      head: [chalk.cyan('Project')],
      style: { head: [], border: [] },
    });

    projectTable.push(
      [`Git: ${project.isGitRepo ? chalk.green('Yes') : chalk.yellow('No')}`],
      [`Branch: ${project.currentBranch || chalk.gray('N/A')}`],
      [`.NET: ${project.hasDotNet ? chalk.green('Yes') : chalk.gray('No')}`],
      [`EF Core: ${project.hasEfCore ? chalk.green('Yes') : chalk.gray('No')}`]
    );

    if (installation.plansCount > 0) {
      projectTable.push([`Pending plans: ${chalk.yellow(installation.plansCount)}`]);
    }

    console.log(projectTable.toString());
  });
