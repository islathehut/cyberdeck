#! /usr/bin/env ts-node

import chalk from 'chalk'
import { DateTime } from 'luxon';
import { confirm, input } from '@inquirer/prompts'

import * as path from 'path'

import { Config } from '../app/types.js';
import { configFileExists, writeConfigFile, loadConfigFile } from '../app/config/config.js';
import { createSimpleModuleLogger } from '../utils/logger.js';
import { DEFAULT_THEME } from './theme.js';

const LOGGER = createSimpleModuleLogger('prompts:init')

const DEFAULT_MODS_DIR_NAME = '/.mods'
const DEFAULT_MODS_DIR_PATH = path.join(process.cwd(), DEFAULT_MODS_DIR_NAME)

const DEFAULT_INSTALL_DIR_NAME = 'Cyberpunk 2077'
const DEFAULT_INSTALL_DIR_PATH = path.join('~/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/', DEFAULT_INSTALL_DIR_NAME)

const init = async (): Promise<Config | null> => {
  let config: Config
  const configExists = await configFileExists()
  if (configExists){
    LOGGER.log(`Found config file!  Loading...`)
    config = await loadConfigFile()
    LOGGER.log(`Loaded config:`, config)
  } else {
    LOGGER.log(`No config file found, generating a new one...`)
    const modsDirPath = await input({
      message: `Enter the directory your mods are stored in`,
      default: DEFAULT_MODS_DIR_PATH,
      theme: DEFAULT_THEME
    })
    const installDirPath = await input({
      message: `Enter the directory Cyberpunk 2077 is installed in)`,
      default: DEFAULT_INSTALL_DIR_PATH,
      theme: DEFAULT_THEME
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

    LOGGER.log(`Generated config:`, config)

    const areYouSure = await confirm({
      message: `Would you like to create this config?\n\n${chalk.greenBright(JSON.stringify(config, null, 2))}\n`,
      default: true,
      theme: DEFAULT_THEME
    })

    if (!areYouSure) {
      LOGGER.log(chalk.yellowBright(`No config file was generated`))
      return null
    }

    writeConfigFile(config, false)
  }

  return config
}

export {
  init
}
