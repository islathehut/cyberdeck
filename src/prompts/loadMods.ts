#! /usr/bin/env ts-node

import { confirm, input } from '@inquirer/prompts'
import chalk from 'chalk';

import { Config, InstallStatus } from '../app/types.js';
import { createSimpleModuleLogger } from '../utils/logger.js';
import { loadAllModMetadata } from '../app/mods/mod.js';
import { writeConfigFile } from '../app/config/config.js';
import { createBlock } from '../app/mods/block.js';
import { DEFAULT_THEME } from './helpers/theme.js';

const LOGGER = createSimpleModuleLogger('prompts:loadMods')

const loadMods = async (config: Config): Promise<Config> => {
  LOGGER.log(`Loading mods from config and mod directory`)
  const rawLoadedMods = await loadAllModMetadata(config)
  const block = await createBlock(config)

  if (rawLoadedMods.length === 0) {
    LOGGER.log(chalk.dim.yellow(`No new mods found!`))
    return config
  }

  const manuallySetMetadata = await confirm({
    message: `Would you like to manually set metadata (e.g. mod name) for the ${rawLoadedMods.length} uninstalled mods that were loaded?`,
    default: true,
    theme: DEFAULT_THEME
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
      theme: DEFAULT_THEME
    })

    config.uninstalledMods.push({
      ...uninstalledMod,
      name,
      status: InstallStatus.UNINSTALLED,
      blockUuid: block.uuid
    })
  }

  writeConfigFile(config, true)

  LOGGER.log(`Mod data loading complete!`, JSON.stringify(config.uninstalledMods, null, 2))

  return config
}

export {
  loadMods
}
