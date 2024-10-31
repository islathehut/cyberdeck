#! /usr/bin/env ts-node

import { confirm, input } from '@inquirer/prompts'
import chalk from 'chalk';

import { Config } from '../../app/types.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { loadAllModMetadata } from '../../app/mods/mod.js';
import { DEFAULT_THEME } from '../helpers/theme.js';

import Mods from '../../app/storage/versedb/schemas/mods.schema.js'
import { promiseWithSpinner } from '../../utils/terminal/tools.js';

const LOGGER = createSimpleModuleLogger('prompts:loadMods')

const loadMods = async (config: Config): Promise<Config> => {
  LOGGER.log(`Loading mods from config and mod directory`)

  const rawLoadedMods = await promiseWithSpinner(() => loadAllModMetadata(config), 'Searching for new mod files...', 'Finished searching for new mod files!')

  if (rawLoadedMods.length === 0) {
    const message = chalk.dim.yellow(`No new mods found!`)
    console.log(message)
    LOGGER.log(message)
    return config
  }

  const manuallySetMetadata = await confirm({
    message: `Would you like to manually set metadata (e.g. mod name) for the ${rawLoadedMods.length} uninstalled mods that were loaded?`,
    default: true,
    theme: DEFAULT_THEME
  })

  for (const uninstalledMod of rawLoadedMods) {
    if (manuallySetMetadata) {
      const name: string = await input({
        message: `Would you like to enter a name for the mod ${uninstalledMod.filename} (otherwise use hash of the filename)?`,
        default: uninstalledMod.name,
        theme: DEFAULT_THEME
      })
  
      uninstalledMod.name = name
    }
    
    try {
      await Mods?.add(uninstalledMod)
    } catch (e) {
      console.error(`Error while writing mod to db`, e)
      process.exit(0)
    }
  }

  const message = chalk.green(`Finished loading new mods!`)
  console.log(message)
  LOGGER.log(message)

  return config
}

export {
  loadMods
}
