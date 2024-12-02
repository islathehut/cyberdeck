#! /usr/bin/env ts-node

import { program } from '@commander-js/extra-typings';

import { InstallMode, type RuntimeOptions } from './app/types/types.js';
import { initDirectoryStructure } from './utils/dir.js';
import { initLogger } from './utils/logger.js';

program.name('cyberdeck').description('Cross-platform CP2077 CLI Mod Manager').version('0.1.0');

// Interactive mode
program
  .description('Interactive mode')
  .option('-v, --verbose', 'Verbose mode')
  .action(async (options: Partial<RuntimeOptions>) => {
    await initDirectoryStructure();
    await initLogger();
    const { default: main } = await import('./prompts/main.js');
    await main({
      ...options,
      installMode: InstallMode.REAL,
    });
  });

program.parse(process.argv);
