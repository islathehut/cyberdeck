#! /usr/bin/env ts-node

import { program } from '@commander-js/extra-typings';

import main from './prompts/main.js';
import { CLIOptions } from './app/types.js';

program
  .name('cyberdeck')
  .description('Cross-platform CP2077 CLI Mod Manager')
  .version('0.1.0');

// Interactive mode
program
  .description('Interactive mode')
  .option('-v, --verbose', 'Verbose mode')
  .option('-d, --dry', 'Dry run')
  .option('-t, --test', 'Run as test (use a fake install directory)')
  .action((options: CLIOptions) => {
    main(options);
  });

program.parse(process.argv);
