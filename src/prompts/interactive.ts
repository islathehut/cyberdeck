#! /usr/bin/env ts-node
import chalk from 'chalk'

import actionSelect from '../components/actionSelect.js'
import { CLIOptions, Config } from '../app/types.js'
import { init } from './init.js'
import { createModuleLogger, Logger } from '../utils/logger.js'
import { loadMods } from './loadMods.js'
import { updateInstallOrder } from './updateInstallOrder.js'
import { installMods } from '../app/mods/install.js'

const LOGGER: Logger = createModuleLogger('main')

const mainLoop = async (config: Config, options: CLIOptions) => {
  let exit = false
  while (exit === false) {
    const defaultChoices = [
      { name: "Install Mods", value: "installMods", description: "Install uninstalled mods" },
      { name: "Update Install Order", value: "updateInstallOrder", description: "Update mod install order" },
      { name: "View History", value: "viewHistory", description: "View mod install description" },
      { name: "Load Mod Data", value: "loadMods", description: "Load all mod metadata" }
    ]
    const answer = await actionSelect(
        {
          message: chalk.bold("Main Menu"),
          choices: [...defaultChoices],
          actions: [
            { name: "Select", value: "select", key: "e" },
            { name: "Exit Program", value: "exit", key: "escape" },
          ]
        },
      )
    switch (answer.action) {
      case "select":
      case undefined: // catches enter/return key
        switch (answer.answer) {
          case "installMods":
            console.warn(`Not implemented!`)
            await installMods(config, options)
            break
          case "updateInstallOrder":
            await updateInstallOrder(config)
            break
          case "viewHistory":
            console.warn(`Not implemented!`)
            // await viewHistory(config)
            break
          case "loadMods":
            await loadMods(config)
            console.warn(JSON.stringify(config, null, 2))
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

const interactive = async (options: CLIOptions) => {
  console.log(chalk.magentaBright.bold.underline("CP2077 Command Line Mod Manager"))
  if (options.dry) {
    console.warn(`!!!Running in dry mode!!!`)
  }
  let config: Config | null
  try {
    config = await init()
  } catch (e) {
    LOGGER.error(`Error occurred while initializing`, e)
    process.exit(1)
  }

  if (config != null) {
    config = await loadMods(config)

    console.log("Navigate options with arrow keys, use E to select, and Q to go back.")
    await mainLoop(config, options)
  }

  console.log(chalk.magentaBright.bold("Goodbye!"))
};

export default interactive
