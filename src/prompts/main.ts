#! /usr/bin/env ts-node
import chalk from 'chalk'
import debug from 'debug'

import actionSelect from '../components/actionSelect.js'
import { CLIOptions, Config } from '../app/types.js'
import { loadExistingConfig, initNewConfig } from './init.js'
import { createSimpleModuleLogger } from '../utils/logger.js'
import { loadMods } from './loadMods.js'
import { DEFAULT_THEME } from './helpers/theme.js'
import { generateCliHeader } from '../utils/terminal/header.js'
import { promiseWithSpinner } from '../utils/terminal/tools.js'
import Blocks from '../app/storage/versedb/schemas/blocks.schema.js'
import Mods from '../app/storage/versedb/schemas/mods.schema.js'
import { manageInstallBlocks } from './manageInstallBlocks.js'

const LOGGER = createSimpleModuleLogger('prompts:main')

const mainLoop = async (config: Config, options: CLIOptions) => {
  let exit = false
  while (exit === false) {
    const defaultChoices = [
      { name: "Manage Install Blocks", value: "manageInstallBlocks", description: "Manage pending install blocks" },
      { name: "Refresh Mod Metadata", value: "loadMods", description: "Load all mod metadata" }
    ]

    // console.log("") // just add a line break
    const answer = await actionSelect(
        {
          message: "Main Menu",
          choices: [...defaultChoices],
          actions: [
            { name: "Select", value: "select", key: "e" },
            { name: "Exit Program", value: "exit", key: "escape" },
          ],
          theme: DEFAULT_THEME
        },
      )
    switch (answer.action) {
      case "select":
      case undefined: // catches enter/return key
        switch (answer.answer) {
          case "manageInstallBlocks":
            await manageInstallBlocks(config, options)
            break
          case "loadMods":
            await loadMods(config)
            break
        }
        break;
      case "exit":
        exit = true;
        break
    }
  };
  return exit
};

const printHeader = (options: CLIOptions) => {
  console.log(generateCliHeader(options))
}

const main = async (options: CLIOptions) => {
  if (options.verbose) {
    debug.enable('cyberdeck:*')
  }

  LOGGER.log(`Initializing verse.db`)
  // DB.initDb(options.verbose)
  await Blocks?.load()
  await Mods?.load()

  printHeader(options)

  let config: Config | null
  try {
    config = await promiseWithSpinner(() => loadExistingConfig(), 'Loading existing config...', 'Finished loading existing config!')
    if (config == null) {
      config = await initNewConfig()
    }
  } catch (e) {
    LOGGER.error(chalk.redBright(`Error occurred while initializing`), e)
    process.exit(1)
  }

  if (config != null) {
    config = await loadMods(config)
    await mainLoop(config, options)
  }

  console.log(chalk.bold.magentaBright("Goodbye!"))
};

export default main
