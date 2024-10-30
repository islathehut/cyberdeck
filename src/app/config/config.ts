import chalk from 'chalk'

import * as fs from 'node:fs/promises'
import * as fsSync from 'fs'
import * as path from 'path'

import { Config } from "../types.js"
import { createSimpleModuleLogger } from '../../utils/logger.js'

export const CONFIG_FILE_NAME = '.cyberdeck.config'

const LOGGER = createSimpleModuleLogger('config')

const getConfigFilePath = (): string => {
  return path.join(process.cwd(), CONFIG_FILE_NAME)
}

export const configFileExists = async (): Promise<boolean> => {
  return fsSync.existsSync(getConfigFilePath())
}

export const writeConfigFile = async (input: Config, overwrite: boolean = false) => {
  LOGGER.log(`Writing config file`)
  const configFilePath = getConfigFilePath()

  if (await configFileExists()) {
    LOGGER.log(chalk.dim.yellow(`Old config file found`))
    if (!overwrite) {
      throw new Error(`Config file already exists and overwrite was set to false!`)
    }

    LOGGER.log(chalk.dim.yellow(`Deleting old config file`))
    await fs.rm(configFilePath)
  }

  LOGGER.log(`Writing new data to config file`)
  await fs.writeFile(configFilePath, JSON.stringify(input, null, 2))
}

export const loadConfigFile = async (): Promise<Config> => {
  LOGGER.log(`Loading config file`)
  const configFilePath = getConfigFilePath()

  if (!(await configFileExists())) {
    throw new Error('No config file found')
  }

  return JSON.parse((await fs.readFile(configFilePath)).toString()) as Config
}