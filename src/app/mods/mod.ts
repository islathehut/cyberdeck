import chalk from 'chalk'

import * as fs from 'node:fs/promises';
import * as path from 'path'

import { BaseMod, Config } from "../types.js"
import { createSimpleModuleLogger } from '../../utils/logger.js'
import { generateChecksum } from '../../utils/crypto.js'

const LOGGER = createSimpleModuleLogger('mods:mod')

export const loadAllModMetadata = async (config: Config): Promise<BaseMod[]> => {
  const loadedMods: BaseMod[] = []

  LOGGER.log(`Reading files from ${config.modsDirPath} to find uninstalled mods`)
  const dir = await fs.readdir(config.modsDirPath, { recursive: false, withFileTypes: true })
  for (const item of dir) {
    LOGGER.log(`Found ${item.name}`)
    if (item.isDirectory()) {
      LOGGER.log(chalk.dim.yellow(`Skipping directory`))
      continue
    }

    const filePath = path.join(config.modsDirPath, item.name)

    LOGGER.log(`Reading data to generate checksum`, filePath)
    const fileData = await fs.readFile(filePath)
    const checksum = generateChecksum(fileData)

    if (config.uninstalledMods.find(mod => mod.checksum === checksum)) {
      LOGGER.log(chalk.dim.yellow(`Skipping already cached uninstalled mod`))
      continue
    }

    loadedMods.push({
      fileName: item.name,
      filePath,
      checksum
    } as BaseMod)
  }

  return loadedMods
}