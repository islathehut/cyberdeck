import chalk from 'chalk'

import * as fs from 'fs'
import * as path from 'path'

import { BaseMod, Config } from "../types.js"
import { createSimpleModuleLogger } from '../../utils/logger.js'
import { generateChecksum } from '../../utils/crypto.js'

const LOGGER = createSimpleModuleLogger('mods:mod')

export const loadAllModMetadata = (config: Config): BaseMod[] => {
  const loadedMods: BaseMod[] = []

  LOGGER.log(`Reading files from ${config.modsDirPath} to find uninstalled mods`)
  fs.readdirSync(config.modsDirPath, { recursive: false, withFileTypes: true }).forEach((value) => {
    LOGGER.log(`Found ${value.name}`)
    if (value.isDirectory()) {
      LOGGER.log(chalk.dim.yellow(`Skipping directory`))
      return
    }

    const filePath = path.join(config.modsDirPath, value.name)

    LOGGER.log(`Reading data to generate checksum`, filePath)
    const fileData = fs.readFileSync(filePath)
    const checksum = generateChecksum(fileData)

    if (config.uninstalledMods.find(mod => mod.checksum === checksum)) {
      LOGGER.log(chalk.dim.yellow(`Skipping already cached uninstalled mod`))
      return
    }

    loadedMods.push({
      fileName: value.name,
      filePath,
      checksum
    } as BaseMod)
  })

  return loadedMods
}

// export const getMods = (config: Config, options: GetModsOptions = {}): GetModsResult => {

// }