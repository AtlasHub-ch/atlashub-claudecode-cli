import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from './commands/install.js';
import { uninstallCommand } from './commands/uninstall.js';
import { activateCommand } from './commands/activate.js';
import { statusCommand } from './commands/status.js';
import { updateCommand } from './commands/update.js';
import { docsCommand } from './commands/docs.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// CommonJS compatible __dirname
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('smartstack-tools')
  .description(chalk.cyan('SmartStack Tools - Claude Code automation toolkit'))
  .version(pkg.version, '-v, --version');

// Register commands
program.addCommand(installCommand);
program.addCommand(uninstallCommand);
program.addCommand(activateCommand);
program.addCommand(statusCommand);
program.addCommand(updateCommand);
program.addCommand(docsCommand);

// Default action (no command)
program.action(() => {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${chalk.bold('SmartStack Tools')} - v${pkg.version}                         ║
║   GitFlow, APEX, EF Core, Prompts & more                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));
  program.outputHelp();
});

program.parse();
