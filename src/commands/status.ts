import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { logger } from '../lib/logger.js';
import { checkLicense, loadLicense } from '../lib/license.js';
import { checkInstallation, listInstalledCommands } from '../lib/installer.js';
import { detectProject } from '../lib/detector.js';

export const statusCommand = new Command('status')
  .alias('s')
  .description('Show installation and license status')
  .option('-g, --global', 'Check user directory ~/.claude (default)', true)
  .option('-l, --local', 'Check project directory ./.claude')
  .option('-v, --verbose', 'Show detailed command list')
  .action(async (options) => {
    logger.header('Claude Tools Status');

    const isGlobal = !options.local;

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
        [`Run: ${chalk.cyan('claude-tools activate <KEY>')}`]
      );
    }

    console.log(licenseTable.toString());
    console.log();

    // Installation status
    const installation = await checkInstallation({ global: isGlobal });

    const installTable = new Table({
      head: [chalk.cyan('Installation'), chalk.cyan('Status')],
      style: { head: [], border: [] },
    });

    installTable.push(
      ['Location', chalk.cyan(installation.location)],
      [''],
      [
        'Commands',
        installation.components.commands.installed
          ? chalk.green(`✓ ${installation.components.commands.count} files`)
          : chalk.gray('Not installed'),
      ],
      [
        'Agents',
        installation.components.agents.installed
          ? chalk.green(`✓ ${installation.components.agents.count} files`)
          : chalk.gray('Not installed'),
      ],
      [
        'Hooks',
        installation.components.hooks.installed
          ? chalk.green(`✓ Configured`)
          : chalk.gray('Not installed'),
      ],
      [''],
      [
        'GitFlow Config',
        installation.gitflow.configExists
          ? chalk.green('✓ Configured')
          : chalk.gray('Not configured'),
      ],
      [
        'Active Plans',
        installation.gitflow.plansCount > 0
          ? chalk.yellow(installation.gitflow.plansCount.toString())
          : chalk.gray('0'),
      ]
    );

    console.log(installTable.toString());
    console.log();

    // Verbose: list all commands
    if (options.verbose && installation.components.commands.installed) {
      const commands = await listInstalledCommands({ global: isGlobal });

      const cmdTable = new Table({
        head: [chalk.cyan('Installed Commands')],
        style: { head: [], border: [] },
      });

      // Group commands
      const groups: Record<string, string[]> = {};
      for (const cmd of commands) {
        const parts = cmd.split('/');
        const group = parts.length > 1 ? parts[0] : 'root';
        if (!groups[group]) groups[group] = [];
        groups[group].push('/' + cmd);
      }

      for (const [group, cmds] of Object.entries(groups)) {
        if (group !== 'root') {
          cmdTable.push([chalk.bold(group)]);
        }
        for (const cmd of cmds.slice(0, 10)) {
          cmdTable.push([`  ${chalk.cyan(cmd)}`]);
        }
        if (cmds.length > 10) {
          cmdTable.push([chalk.gray(`  ... and ${cmds.length - 10} more`)]);
        }
      }

      console.log(cmdTable.toString());
      console.log();
    }

    // Project info
    const project = await detectProject();

    const projectTable = new Table({
      head: [chalk.cyan('Current Project')],
      style: { head: [], border: [] },
    });

    projectTable.push(
      [`Git: ${project.isGitRepo ? chalk.green('Yes') : chalk.yellow('No')}`],
      [`Branch: ${project.currentBranch || chalk.gray('N/A')}`],
      [`.NET: ${project.hasDotNet ? chalk.green('Yes') : chalk.gray('No')}`],
      [`EF Core: ${project.hasEfCore ? chalk.green('Yes') : chalk.gray('No')}`]
    );

    console.log(projectTable.toString());

    // Quick help
    if (!installation.installed) {
      console.log();
      logger.info(`Run ${chalk.cyan('claude-tools install')} to install commands`);
    }
  });
