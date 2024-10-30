#! /usr/bin/env ts-node

import chalk from 'chalk';
import autocomplete from 'inquirer-autocomplete-standalone';
import { confirm } from '@inquirer/prompts'

import { Config } from '../app/types.js';
import { createModuleLogger, Logger } from '../utils/logger.js';
import { writeConfigFile } from '../app/config/config.js';
import { createBlock, getCurrentUninstalledBlock } from '../app/mods/block.js';

const LOGGER: Logger = createModuleLogger('updateInstallOrder')

const autoGenerateInstallOrder = (config: Config, remainingChoices: Set<string>, installOrderForBlock: string[]): string[] => {
  LOGGER.info(`Auto-generating install order from ${remainingChoices.size} remaining mods`)
  config.uninstalledMods.filter(mod => remainingChoices.has(mod.checksum)).forEach(mod => {
    installOrderForBlock.push(mod.fileName)
  })

  return installOrderForBlock
}

const updateInstallOrder = async (config: Config): Promise<Config> => {
  LOGGER.info(`Modifying Install Order`)
  LOGGER.debug(`Current Install Order:`, JSON.stringify(config.installOrder, null, 2))
  let currentBlock = getCurrentUninstalledBlock(config)
  if (currentBlock == null) {
    currentBlock = createBlock(config)
  }

  let installOrderForBlock = config.installOrder[currentBlock.uuid]
  const remainingChoices: Set<string> = new Set(config.uninstalledMods.filter(mod => !installOrderForBlock.includes(mod.fileName)).map(mod => mod.checksum))
  let exit = false

  const manuallySet = await confirm({
    message: `Would you like to manually set the install order (you can bail at any point and auto-generate an install order)?`,
    default: false
  })

  if (!manuallySet) {
    installOrderForBlock = autoGenerateInstallOrder(config, remainingChoices, installOrderForBlock)
    exit = true
  }

  while(!exit && remainingChoices.size > 0) {
    const choices = config.uninstalledMods.filter(mod => remainingChoices.has(mod.checksum))

    const answer = await autocomplete({
      message: 'Select a mod to add next in the install order',
      source: async (input) => {
        return choices.filter(mod => input == null || mod.name.toLowerCase().includes(input)).map(mod => {
          return {
            name: mod.name,
            value: mod,
            description: mod.fileName
          }
        })
      }
    })

    remainingChoices.delete(answer.checksum)
    installOrderForBlock.push(answer.fileName)

    const continueManually = await confirm({
      message: `Would you like to continue manually setting the install order (you can bail at any point and auto-generate an install order)?`,
      default: true
    })
  
    if (!continueManually) {
      installOrderForBlock = autoGenerateInstallOrder(config, remainingChoices, installOrderForBlock)
      exit = true
    }
  }

  console.info('Done!')
  config.installOrder[currentBlock.uuid] = installOrderForBlock
  writeConfigFile(config, true)

  LOGGER.info(`Mod data loading complete!`, JSON.stringify(config.uninstalledMods, null, 2))

  return config
}

export {
  updateInstallOrder
}
