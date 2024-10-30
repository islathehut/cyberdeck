import * as fs from 'fs'
import * as path from 'path'

import { BaseMod, Block, Config, GetModsResult, InstalledModsByBlock } from "../types.js"
import { createModuleLogger, Logger } from '../../utils/logger.js'
import { generateChecksum } from '../../utils/crypto.js'

const LOGGER: Logger = createModuleLogger('mod')

export const loadAllModMetadata = (config: Config): BaseMod[] => {
  const loadedMods: BaseMod[] = []

  LOGGER.info(`Reading files from ${config.modsDirPath} to find uninstalled mods`)
  fs.readdirSync(config.modsDirPath, { recursive: false, withFileTypes: true }).forEach((value) => {
    LOGGER.info(`Found ${value.name}`)
    if (value.isDirectory()) {
      LOGGER.warn(`Skipping directory`)
      return
    }

    const filePath = path.join(config.modsDirPath, value.name)

    LOGGER.info(`Reading data to generate checksum`, filePath)
    const fileData = fs.readFileSync(filePath)
    const checksum = generateChecksum(fileData)

    if (config.uninstalledMods.find(mod => mod.checksum === checksum)) {
      LOGGER.warn(`Skipping already cached uninstalled mod`)
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