#! /usr/bin/env ts-node
import chalk from 'chalk';
import debug from 'debug';

import actionSelect from '../components/actionSelect.js';
import { initNewConfig } from './init.js';
import { createSimpleModuleLogger, nodeConsole } from '../utils/logger.js';
import { loadMods } from './mods/loadMods.js';
import { DEFAULT_THEME } from './helpers/theme.js';
import { generateCliHeader } from '../utils/terminal/header.js';
import { promiseWithSpinner } from '../utils/terminal/tools.js';
import Blocks from '../app/storage/versedb/schemas/blocks.schema.js';
import Mods from '../app/storage/versedb/schemas/mods.schema.js';
import { manageInstallBlocks } from './blocks/manageInstallBlocks.js';
import { selectMod } from './mods/manageMods.js';
import { ConfigManager } from '../app/config/config.manager.js';
import type { RuntimeOptions } from '../app/types/types.js';
import { NexusModsManager } from '../app/mods/nexusMods/nexusMods.manager.js';
import { manageSettings } from './settings/manageSettings.js';

const LOGGER = createSimpleModuleLogger('prompts:main');

const mainLoop = async (): Promise<boolean> => {
  let exit = false;
  while (!exit) {
    const defaultChoices = [
      {
        name: 'Manage Install Blocks',
        value: 'manageInstallBlocks',
        description: 'Manage pending install blocks',
      },
      {
        name: 'Manage Mods',
        value: 'manageMods',
        description: 'Manage mods that Cyberdeck knows about',
      },
      {
        name: 'Refresh Mod Metadata',
        value: 'loadMods',
        description: 'Load all uninstalled mods and fetch Nexus metadata',
      },
      {
        name: 'Cyberdeck Settings',
        value: 'manageSettings',
        description: 'Manage Settings for Cyberdeck',
      },
    ];

    const answer = await actionSelect({
      message: 'Main Menu',
      choices: [...defaultChoices],
      actions: [
        { name: 'Select', value: 'select', key: 'e' },
        { name: 'Exit Program', value: 'exit', key: 'escape' },
      ],
      theme: DEFAULT_THEME,
    });
    switch (answer.action) {
      case 'select':
      case undefined: // catches enter/return key
        switch (answer.answer) {
          case 'manageInstallBlocks':
            await manageInstallBlocks();
            break;
          case 'manageMods':
            await selectMod();
            break;
          case 'loadMods':
            await loadMods(true);
            break;
          case 'manageSettings':
            await manageSettings();
            break;
        }
        break;
      case 'exit':
        exit = true;
        break;
    }
  }
  return exit;
};

const printHeader = (options: RuntimeOptions): void => {
  nodeConsole.log(generateCliHeader());
};

const main = async (options: RuntimeOptions): Promise<void> => {
  if (options.verbose) {
    debug.enable('cyberdeck:*');
  }

  LOGGER.log(`Loading database`);
  await Blocks?.load();
  await Mods?.load();

  printHeader(options);

  let configManager: ConfigManager | null = null;
  try {
    configManager = await promiseWithSpinner(
      async () => await ConfigManager.initFromFile(options),
      'Loading existing config...',
      'Finished loading existing config!',
      'Failed to load existing config!!!'
    );
    if (configManager == null) {
      configManager = await initNewConfig(options);
    }
  } catch (e) {
    LOGGER.error(chalk.redBright(`Error occurred while initializing`), e);
    process.exit(1);
  }

  if (configManager != null) {
    await NexusModsManager.init();
    await loadMods();
    await mainLoop();
  }

  nodeConsole.log(chalk.bold.magentaBright('Goodbye!'));
};

export default main;
