#! /usr/bin/env ts-node
import chalk from 'chalk'

import actionSelect from '../components/actionSelect.js'
import { CLIOptions, Config } from '../app/types.js'
import { init } from './init.js'
import { createSimpleModuleLogger } from '../utils/logger.js'
import { loadMods } from './loadMods.js'
import { updateInstallOrder } from './updateInstallOrder.js'
import { installMods } from '../app/mods/install.js'
import { DEFAULT_THEME } from './theme.js'
import { generateCliHeader } from '../utils/terminal/header.js'
import { promiseWithSpinner } from '../utils/terminal/tools.js'

const LOGGER = createSimpleModuleLogger('prompts:main')

const mainLoop = async (config: Config, options: CLIOptions) => {
  let exit = false
  while (exit === false) {
    const defaultChoices = [
      { name: "Install Mods", value: "installMods", description: "Install uninstalled mods" },
      { name: "Update Install Order", value: "updateInstallOrder", description: "Update mod install order" },
      { name: "View History", value: "viewHistory", description: "View mod install description" },
      { name: "Load Mod Data", value: "loadMods", description: "Load all mod metadata" }
    ]

    console.log("") // just add a line break
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
          case "installMods":
            await installMods(config, options)
            break
          case "updateInstallOrder":
            await updateInstallOrder(config)
            break
          case "viewHistory":
            LOGGER.log(chalk.dim.yellow(`Not implemented!`))
            // await viewHistory(config)
            break
          case "loadMods":
            await promiseWithSpinner(() => loadMods(config), 'Loading mods...', 'Finished loading mods!')
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

const interactive = async (options: CLIOptions) => {
  printHeader(options)

  let config: Config | null
  try {
    config = await promiseWithSpinner(() => init(), 'Initializing...', 'Finished initializing!')
  } catch (e) {
    LOGGER.error(chalk.redBright(`Error occurred while initializing`), e)
    process.exit(1)
  }

  if (config != null) {
    config = await promiseWithSpinner(() => loadMods(config!), 'Loading mods...', 'Finished loading mods!')
    await mainLoop(config, options)
  }

  console.log(chalk.bold.magentaBright("Goodbye!"))
};

export default interactive
