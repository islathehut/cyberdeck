#! /usr/bin/env ts-node

import { confirm, input } from '@inquirer/prompts'

import { Config, InstallStatus } from '../app/types.js';
import { createModuleLogger, Logger } from '../utils/logger.js';
import { loadAllModMetadata } from '../app/mods/mod.js';
import { writeConfigFile } from '../app/config/config.js';
import { createBlock } from '../app/mods/block.js';

const LOGGER: Logger = createModuleLogger('loadMods')

const loadMods = async (config: Config): Promise<Config> => {
  LOGGER.info(`Loading mods from config and mod directory`)
  const rawLoadedMods = loadAllModMetadata(config)
  const block = createBlock(config)

  if (rawLoadedMods.length === 0) {
    LOGGER.warn(`No new mods found!`)
    console.warn(`No new mods found!`)
    return config
  }

  const manuallySetMetadata = await confirm({
    message: `Would you like to manually set metadata (e.g. mod name) for the ${rawLoadedMods.length} uninstalled mods that were loaded?`,
    default: true
  })

  for (const uninstalledMod of rawLoadedMods) {
    const defaultName = uninstalledMod.fileName
    if (!manuallySetMetadata) {
      config.uninstalledMods.push({
        ...uninstalledMod,
        name: defaultName,
        status: InstallStatus.UNINSTALLED,
        blockUuid: block.uuid
      })
      continue
    }
    
    const name: string = await input({
      message: `Would you like to enter a name for the mod ${uninstalledMod.fileName} (otherwise use hash of the filename)?`,
      default: defaultName,
    })

    config.uninstalledMods.push({
      ...uninstalledMod,
      name,
      status: InstallStatus.UNINSTALLED,
      blockUuid: block.uuid
    })
  }

  writeConfigFile(config, true)

  LOGGER.info(`Mod data loading complete!`, JSON.stringify(config.uninstalledMods, null, 2))

  return config
}

export {
  loadMods
}
