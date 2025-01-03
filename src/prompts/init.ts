#! /usr/bin/env ts-node

import chalk from 'chalk';
import { DateTime } from 'luxon';
import { confirm, input } from '@inquirer/prompts';

import type { RuntimeOptions, Config } from '../app/types/types.js';
import { ConfigManager } from '../app/config/config.manager.js';
import { createSimpleModuleLogger } from '../utils/logger.js';
import { DEFAULT_THEME } from './helpers/theme.js';
import {
  CYBERDECK_DIR_PATH,
  DEFAULT_INSTALL_DIR_PATH,
  MODS_DIR_PATH,
  VERSE_DB_DATA_DIR_PATH,
} from '../app/const.js';

const LOGGER = createSimpleModuleLogger('prompts:init');

const initNewConfig = async (cliOptions: RuntimeOptions): Promise<ConfigManager | null> => {
  LOGGER.log(`No config file found, generating a new one...`);
  const shouldInit = await confirm({
    message: `No cyberdeck setup found in ${CYBERDECK_DIR_PATH()}.  Cyberdeck will create this directory, a new config file and empty sub-directories.  Continue?`,
    default: true,
    theme: DEFAULT_THEME,
  });

  if (!shouldInit) {
    return null;
  }

  const installDirPath = await input({
    message: `Enter the directory Cyberpunk 2077 is installed in)`,
    default: DEFAULT_INSTALL_DIR_PATH,
    theme: DEFAULT_THEME,
  });

  const nexusModsApiKey = await input({
    message: `(Optional) Enter your Nexus Mods API Key (use the 'Personal API Key' on https://next.nexusmods.com/settings/api-keys):`,
    default: undefined,
    theme: DEFAULT_THEME,
  });

  const config: Config = {
    modsDirPath: MODS_DIR_PATH(),
    installDirPath,
    dbDataDirPath: VERSE_DB_DATA_DIR_PATH(),
    modifiedAt: DateTime.utc().toMillis(),
    latestModLoadedMs: 0,
    nexusModsApiKey,
  };

  LOGGER.log(`Generated config:`, config);

  const areYouSure = await confirm({
    message: `Would you like to create this config?\n\n${chalk.greenBright(JSON.stringify(config, null, 2))}\n`,
    default: true,
    theme: DEFAULT_THEME,
  });

  if (!areYouSure) {
    LOGGER.log(chalk.yellowBright(`No config file was generated`));
    return null;
  }

  return await ConfigManager.init(config, cliOptions);
};

export { initNewConfig };
