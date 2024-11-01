#! /usr/bin/env ts-node

import chalk from 'chalk';
import autocomplete from 'inquirer-autocomplete-standalone';
import { confirm } from '@inquirer/prompts'

import { type Block, InstallStatus, type Mod } from '../../app/types/types.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { DEFAULT_THEME } from '../helpers/theme.js';
import { promiseWithSpinner } from '../../utils/terminal/tools.js';
import { updateBlock } from '../../app/mods/block.js';
import { searchMods, updateMod } from '../../app/mods/mod.js';

const LOGGER = createSimpleModuleLogger('prompts:updateInstallOrder')

const autoGenerateInstallOrder = async (blockUuid: string, uninstalledMods: Mod[], remainingChoices: Set<string>, installOrderForBlock: string[]): Promise<string[]> => await promiseWithSpinner(
    async () => {
      LOGGER.log(`Auto-generating install order from ${remainingChoices.size} remaining mods`)
      for (const mod of uninstalledMods.filter(mod => remainingChoices.has(mod.checksum))) {
        installOrderForBlock.push(mod.filename)
        await updateMod(
          {
            checksum: mod.checksum
          },
          {
            $set: {
              blockUuid
            }
          }
        )
      }

      return installOrderForBlock
    },
    'Auto-generating remaining install order...',
    'Finished auto-generating install order!'
  )

const updateInstallOrder = async (blockUuid: string): Promise<Block> => {
  LOGGER.log(`Modifying Install Order for block ${blockUuid}`)

  let installOrderForBlock: string[] = []
  const uninstalledMods = await searchMods({
    status: InstallStatus.UNINSTALLED,
    skip: false,
    blockUuid: { $typeOf: 'null' }
  })

  const remainingChoices = new Set<string>(uninstalledMods.map(mod => mod.checksum))
  let exit = false

  const manuallySet = await confirm({
    message: `Would you like to manually set the install order (you can bail at any point and auto-generate an install order)?`,
    default: false,
    theme: DEFAULT_THEME
  })

  if (!manuallySet) {
    installOrderForBlock = await autoGenerateInstallOrder(blockUuid, uninstalledMods, remainingChoices, installOrderForBlock)
    exit = true
  }

  if (remainingChoices.size === 0) {
    console.log(chalk.yellow(`No uninstalled mods to add to the install order`))
    exit = true
  }

  while(!exit && remainingChoices.size > 0) {
    const choices = uninstalledMods.filter((mod: Mod) => remainingChoices.has(mod.checksum))
    const answer: Mod = await autocomplete({
      message: 'Select a mod to add next in the install order',
      source: async (input: string | undefined) => choices.filter((mod: Mod) => input == null || mod.name.toLowerCase().includes(input)).map((mod: Mod) => ({
        name: mod.name,
        value: mod,
        description: mod.filename
      })),
      // @ts-expect-error The autocomplete library doesn't allow theming but I modified to allow it
      theme: DEFAULT_THEME
    })

    remainingChoices.delete(answer.checksum)
    installOrderForBlock.push(answer.filename)
    await updateMod(
      {
        checksum: answer.checksum
      },
      {
        "$set": {
          blockUuid
        }
      }
    )

    const continueManually = await confirm({
      message: `Would you like to continue manually setting the install order (you can bail at any point and auto-generate an install order)?`,
      default: true,
      theme: DEFAULT_THEME
    })
  
    if (!continueManually) {
      installOrderForBlock = await autoGenerateInstallOrder(blockUuid, uninstalledMods, remainingChoices, installOrderForBlock)
      exit = true
    }
  }

  const updatedBlock = await updateBlock(
    {
      uuid: blockUuid
    },
    {
      "$push": {
        installOrder: {
          $each: installOrderForBlock
        }
      }
    },
    false
  )

  LOGGER.log('Done!')
  return updatedBlock
}

export {
  updateInstallOrder
}
