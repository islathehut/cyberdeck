#! /usr/bin/env ts-node

import { program } from '@commander-js/extra-typings';

import { LogQueue } from './utils/logQueue.js';
LogQueue.init(2)

import interactive from './prompts/interactive.js';
import { CLIOptions } from './app/types.js';

program
  .name('cp2077-cl-mod-manager')
  .description('CP2077 Command Line Mod Manager')
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
