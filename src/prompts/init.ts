#! /usr/bin/env ts-node

import chalk from 'chalk'
import { confirm, input } from '@inquirer/prompts'
import * as path from 'path'

import { Config } from '../app/types.js';
import { configFileExists, writeConfigFile, loadConfigFile } from '../app/config/config.js';
import { createModuleLogger, Logger } from '../utils/logger.js';
import { DateTime } from 'luxon';

const LOGGER: Logger = createModuleLogger('init')

const DEFAULT_MODS_DIR_NAME = '/.mods'
const DEFAULT_MODS_DIR_PATH = path.join(process.cwd(), DEFAULT_MODS_DIR_NAME)

const DEFAULT_INSTALL_DIR_NAME = 'Cyberpunk 2077'
const DEFAULT_INSTALL_DIR_PATH = path.join('~/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/', DEFAULT_INSTALL_DIR_NAME)

const init = async (): Promise<Config | null> => {
  let config: Config
  const configExists = configFileExists()
  if (configExists){
    LOGGER.info(`Found config file!  Loading...`)
    config = loadConfigFile()
    LOGGER.info(`Loaded config:`, config)
  } else {
    LOGGER.info(`No config file found, generating a new one...`)
    const modsDirPath = await input({
      message: `Enter the directory your mods are stored in`,
      default: DEFAULT_MODS_DIR_PATH,
    })
    const installDirPath = await input({
      message: `Enter the directory Cyberpunk 2077 is installed in)`,
      default: DEFAULT_INSTALL_DIR_PATH,
    })

    config = {
      modsDirPath,
      installDirPath,
      modifiedAt: DateTime.utc().toMillis(),
      installedMods: {},
      blocks: [],
      uninstalledMods: [],
      installOrder: {}
    }

    LOGGER.info(`Generated config:`, config)

    const areYouSure = await confirm({
      message: `Would you like to create this config?\n\n${chalk.greenBright(JSON.stringify(config, null, 2))}\n`,
      default: true
    })

    if (!areYouSure) {
      LOGGER.warn(`No config file was generated`)
      return null
    }

    writeConfigFile(config, false)
  }

  return config
}

export {
  init
}
