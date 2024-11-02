import chalk from 'chalk';
import { DateTime } from 'luxon';

import * as fs from 'node:fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

import type { Config } from '../types/types.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { CONFIG_FILE_NAME, CYBERDECK_DIR_PATH } from '../const.js';

const LOGGER = createSimpleModuleLogger('config');

const getConfigFilePath = (): string => path.join(CYBERDECK_DIR_PATH, CONFIG_FILE_NAME);

export const configFileExists = (): boolean => fsSync.existsSync(getConfigFilePath());

export const writeConfigFile = async (input: Config, overwrite = false): Promise<void> => {
  LOGGER.log(`Writing config file`);
  input.modifiedAt = DateTime.utc().toMillis();
  const configFilePath = getConfigFilePath();

  if (configFileExists()) {
    LOGGER.log(chalk.dim.yellow(`Old config file found`));
    if (!overwrite) {
      throw new Error(`Config file already exists and overwrite was set to false!`);
    }

    LOGGER.log(chalk.dim.yellow(`Deleting old config file`));
    await fs.rm(configFilePath);
  }

  LOGGER.log(`Writing new data to config file`);
  await fs.writeFile(configFilePath, JSON.stringify(input, null, 2));
};

export const loadConfigFile = async (): Promise<Config> => {
  LOGGER.log(`Loading config file`);
  const configFilePath = getConfigFilePath();

  if (!configFileExists()) {
    throw new Error('No config file found');
  }

  return JSON.parse((await fs.readFile(configFilePath)).toString()) as Config;
};
