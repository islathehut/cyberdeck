import * as fs from 'fs'
import * as path from 'path'

import { Config } from "../types.js"
import { createModuleLogger, Logger } from '../../utils/logger.js'

export const CONFIG_FILE_NAME = '.cp2077-cl-mod-manager.config'

const LOGGER: Logger = createModuleLogger('config')

const getConfigFilePath = (): string => {
  return path.join(process.cwd(), CONFIG_FILE_NAME)
}

export const configFileExists = (): boolean => {
  return fs.existsSync(getConfigFilePath())
}

export const writeConfigFile = (input: Config, overwrite: boolean = false) => {
  LOGGER.info(`Writing config file`)
  const configFilePath = getConfigFilePath()

  if (fs.existsSync(configFilePath)) {
    LOGGER.warn(`Old config file found`)
    if (!overwrite) {
      throw new Error(`Config file already exists and overwrite was set to false!`)
    }

    LOGGER.warn(`Deleting old config file`)
    fs.rmSync(configFilePath)
  }

  LOGGER.info(`Writing data to config file`)
  fs.writeFileSync(configFilePath, JSON.stringify(input, null, 2))
}

export const loadConfigFile = (): Config => {
  LOGGER.info(`Loading config file`)
  const configFilePath = getConfigFilePath()

  if (!fs.existsSync(configFilePath)) {
    throw new Error('No config file found')
  }

  return JSON.parse(fs.readFileSync(configFilePath).toString()) as Config
}