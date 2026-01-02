import { Command } from 'commander';
import { exec } from 'child_process';
import { join } from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { logger } from '../lib/logger.js';

// Get the package root directory (works in compiled CommonJS)
function getPackageRoot(): string {
  // In bundled code, we're in dist/index.js
  // Package root is 1 level up
  return join(__dirname, '..');
}

export const docsCommand = new Command('docs')
  .alias('d')
  .description('Open documentation in browser')
  .option('-l, --list', 'List available documentation pages')
  .argument('[page]', 'Documentation page to open (default: index)')
  .action(async (page: string | undefined, options) => {
    const docRoot = join(getPackageRoot(), '.documentation');

    // Check if documentation exists
    if (!(await fs.pathExists(docRoot))) {
      logger.error('Documentation not found. The package may not be installed correctly.');
      return;
    }

    // List available pages
    if (options.list) {
      logger.header('Available Documentation');
      const files = await fs.readdir(docRoot);
      const htmlFiles = files.filter(f => f.endsWith('.html'));

      console.log();
      for (const file of htmlFiles) {
        const name = file.replace('.html', '');
        const isIndex = name === 'index';
        console.log(`  ${chalk.cyan(name)}${isIndex ? chalk.gray(' (default)') : ''}`);
      }
      console.log();
      logger.info(`Open with: ${chalk.cyan('claude-tools docs <page>')}`);
      return;
    }

    // Determine which page to open
    const pageName = page || 'index';
    const pagePath = join(docRoot, `${pageName}.html`);

    if (!(await fs.pathExists(pagePath))) {
      logger.error(`Documentation page "${pageName}" not found.`);
      logger.info(`Use ${chalk.cyan('claude-tools docs --list')} to see available pages.`);
      return;
    }

    // Open in default browser
    // Windows: start "" "path" - first "" is window title, second is the file
    const openCommand = process.platform === 'win32'
      ? `start ""`
      : process.platform === 'darwin'
        ? 'open'
        : 'xdg-open';

    logger.info(`Opening ${chalk.cyan(pageName)} documentation...`);

    exec(`${openCommand} "${pagePath}"`, (error) => {
      if (error) {
        logger.error(`Could not open browser: ${error.message}`);
        logger.info(`Documentation is available at: ${chalk.cyan(pagePath)}`);
      }
    });
  });
