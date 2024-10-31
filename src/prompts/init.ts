#! /usr/bin/env ts-node

import chalk from 'chalk'
import { DateTime } from 'luxon';
import { confirm, input } from '@inquirer/prompts'

import * as fs from 'node:fs/promises'
import * as fsSync from 'fs'

import { Config } from '../app/types.js';
import { configFileExists, writeConfigFile, loadConfigFile } from '../app/config/config.js';
import { createSimpleModuleLogger } from '../utils/logger.js';
import { DEFAULT_THEME } from './theme.js';
import { 
  CYBERDECK_DIR_PATH,
  DEFAULT_INSTALL_DIR_PATH,
  MODS_DIR_PATH,
  UNPACK_DIR_PATH
} from '../app/const.js';

const LOGGER = createSimpleModuleLogger('prompts:init')

const init = async (): Promise<Config | null> => {
  let config: Config
  const configExists = await configFileExists()
  if (configExists){
    LOGGER.log(`Found config file!  Loading...`)
    config = await loadConfigFile()
    LOGGER.log(`Loaded config:`, config)
  } else {
    LOGGER.log(`No config file found, generating a new one...`)
    const shouldInit = await confirm({
      message: `No cyberdeck setup found in ${CYBERDECK_DIR_PATH}.  Cyberdeck will create this directory, a new config file and empty sub-directories.  Continue?`,
      default: true,
      theme: DEFAULT_THEME
    })

    if (!shouldInit) {
      return null
    }

    const installDirPath = await input({
      message: `Enter the directory Cyberpunk 2077 is installed in)`,
      default: DEFAULT_INSTALL_DIR_PATH,
      theme: DEFAULT_THEME
    })

    config = {
      modsDirPath: MODS_DIR_PATH,
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

    if (!fsSync.existsSync(CYBERDECK_DIR_PATH)) {
      LOGGER.log(chalk.dim.yellow(`Creating cyberdeck dir at ${CYBERDECK_DIR_PATH}`))
      await fs.mkdir(CYBERDECK_DIR_PATH)
    }

    if (!fsSync.existsSync(MODS_DIR_PATH)) {
      LOGGER.log(chalk.dim.yellow(`Creating cyberdeck mod dir at ${MODS_DIR_PATH}`))
      await fs.mkdir(MODS_DIR_PATH)
    }

    if (!fsSync.existsSync(UNPACK_DIR_PATH)) {
      LOGGER.log(chalk.dim.yellow(`Creating cyberdeck unpack dir at ${UNPACK_DIR_PATH}`))
      await fs.mkdir(UNPACK_DIR_PATH)
    }

    await writeConfigFile(config, false)
  }

  return config
}

export {
  init
}
