import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from './commands/install.js';
import { uninstallCommand } from './commands/uninstall.js';
import { activateCommand } from './commands/activate.js';
import { statusCommand } from './commands/status.js';
import { updateCommand } from './commands/update.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('claude-tools')
  .description(chalk.cyan('Claude Code automation toolkit by Atlashub'))
  .version(pkg.version, '-v, --version');

// Register commands
program.addCommand(installCommand);
program.addCommand(uninstallCommand);
program.addCommand(activateCommand);
program.addCommand(statusCommand);
program.addCommand(updateCommand);

// Default action (no command)
program.action(() => {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${chalk.bold('Claude Tools')} by Atlashub - v${pkg.version}                  ║
║   GitFlow, APEX, EF Core, Prompts & more                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));
  program.outputHelp();
});

program.parse();
