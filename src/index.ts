#! /usr/bin/env ts-node

import { program } from '@commander-js/extra-typings';

import interactive from './prompts/interactive.js';
import { CLIOptions } from './app/types.js';

program
  .name('cyberdeck')
  .description('CP2077 CLI Mod Manager')
  .version('0.0.1');

// Interactive mode
program
  .command('interactive')
  .description('Interactive mode')
  .option('-v, --verbose', 'Verbose mode')
  .option('-d, --dry', 'Dry run')
  .action((options: CLIOptions) => {
    interactive(options);
  });

program.parse(process.argv);
