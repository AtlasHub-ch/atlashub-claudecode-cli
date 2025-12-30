import chalk from 'chalk';
import ora, { Ora } from 'ora';

export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),

  header: (title: string) => {
    console.log();
    console.log(chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold(`  ${title}`));
    console.log(chalk.cyan('═'.repeat(60)));
    console.log();
  },

  step: (current: number, total: number, message: string) => {
    console.log(chalk.gray(`[${current}/${total}]`), message);
  },

  spinner: (text: string): Ora => {
    return ora({ text, color: 'cyan' }).start();
  },

  box: (content: string[], type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const colors = {
      info: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
    };
    const color = colors[type];
    const maxLen = Math.max(...content.map((l) => l.length));
    const border = color('─'.repeat(maxLen + 4));

    console.log();
    console.log(border);
    content.forEach((line) => {
      console.log(color('│'), line.padEnd(maxLen), color('│'));
    });
    console.log(border);
    console.log();
  },
};
