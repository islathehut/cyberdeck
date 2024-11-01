#! /usr/bin/env ts-node

import chalk from 'chalk';

import type { Block, CLIOptions, Config } from '../../app/types/types.js';
import { createBlock, getBlockByUuid, getUninstalledBlocks } from '../../app/mods/block.js';
import { DEFAULT_THEME } from '../helpers/theme.js';
import actionSelect, { type Choice } from '../../components/actionSelect.js';

import { updateInstallOrder } from './updateInstallOrder.js';
import { installMods } from '../mods/installMods.js';
import { confirm } from '@inquirer/prompts';
import { DateTime } from 'luxon';

const displayBlock = (block: Block): void => {
  const longSeparator = chalk.magenta('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')
  const mediumSeparator = chalk.magenta(`░░░░░░░░`)
  const shortSeparator = chalk.magenta('░░░░')

  const uuidString = chalk.bold.white(block.uuid)
  const installedString = `${chalk.bold.cyan('Installed?    ')} ${chalk.magenta(block.installed)}`
  const createdAtString = `${chalk.bold.cyan('Created At:   ')} ${chalk.magenta(DateTime.fromMillis(block.createdAt).toLocal().toISO())}`
  const modifiedAtString = `${chalk.bold.cyan('Modified At:  ')} ${chalk.magenta(DateTime.fromMillis(block.modifiedAt).toLocal().toISO())}`
  const installedAtString = `${chalk.bold.cyan('Installed At: ')} ${chalk.magenta(block.installedAt != null ? DateTime.fromMillis(block.installedAt).toLocal().toISO() : 'n/a')}`
  let installOrderString = chalk.bold.cyan('Install Order:')
  if (block.installOrder.length === 0) {
    installOrderString += ` ${chalk.yellow(`unset`)}\n  ${shortSeparator}`
  } else {
    installOrderString += `\n  ${shortSeparator}\n`
    block.installOrder.forEach((filename) => (installOrderString += `  ${mediumSeparator} ${chalk.green('-')} ${chalk.magenta(filename)}\n`))
    installOrderString += `  ${mediumSeparator}`
  }

  console.log(
  `
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${uuidString}
  ${shortSeparator}
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${installedString}
  ${shortSeparator}
  ${shortSeparator} ${createdAtString}
  ${shortSeparator} ${modifiedAtString}
  ${shortSeparator} ${installedAtString}
  ${shortSeparator}
  ${shortSeparator} ${installOrderString}
  ${longSeparator}
  `
  )
}

const manageBlock = async (blockUuid: string, config: Config, options: CLIOptions): Promise<Block> => {
  let block = await getBlockByUuid(blockUuid)
  let exit = false
  while (!exit) {
    displayBlock(block)

    const defaultChoices = [
      { name: "Install Mods", value: "installMods", description: "Install uninstalled mods" },
      { name: "Update Install Order", value: "updateInstallOrder", description: "Update mod install order" },
    ]

    // console.log("") // just add a line break
    const answer = await actionSelect(
        {
          message: `Managing Block ${block.uuid}`,
          choices: [...defaultChoices],
          actions: [
            { name: "Select", value: "select", key: "e" },
            { name: "Back", value: "back", key: "q" },
            { name: "Exit", value: "exit", key: "escape" },
          ],
          theme: DEFAULT_THEME
        },
      )
    switch (answer.action) {
      case "select":
      case undefined: // catches enter/return key
        switch (answer.answer) {
          case "updateInstallOrder":
            await updateInstallOrder(blockUuid)
            break
          case "installMods":
            await installMods(blockUuid, config, options)
            break
        }
        break;
      case "back":
      case "exit":
        exit = true;
        break
    }
    block = await getBlockByUuid(blockUuid)
  };
  return block
}

const createAndManageNewBlock = async (config: Config, options: CLIOptions): Promise<Block | null> => {
  const areYouSure = await confirm({
    message: `Are you sure you would like to create a new install block?`,
    default: true,
    theme: DEFAULT_THEME
  })

  if (!areYouSure) {
    console.log(chalk.yellow(`Skipping block creation`))
    return null
  }

  const newBlock = await createBlock()
  return await manageBlock(newBlock.uuid, config, options)
}

const manageInstallBlocks = async (config: Config, options: CLIOptions): Promise<boolean> => {
  let exit = false
  while (!exit) {
    const uninstalledBlocks = await getUninstalledBlocks()

    const choices: Array<Choice<string>> = []
    for (const uninstalledBlock of uninstalledBlocks) {
      choices.push({
        name: uninstalledBlock.uuid,
        value: uninstalledBlock.uuid,
        description: uninstalledBlock.uuid
      })
    }

    if (choices.length === 0) {
      console.log(chalk.yellow(`No install blocks have been created, you can create one now!`))
      await createAndManageNewBlock(config, options)
    } else {
      const answer = await actionSelect(
        {
          message: "Install Block Management",
          choices: [...choices],
          actions: [
            { name: "Select", value: "select", key: "e" },
            { name: "New", value: "createNew", key: "n" },
            { name: "Exit", value: "exit", key: "escape" },
          ],
          theme: DEFAULT_THEME
        },
      )
      switch (answer.action) {
        case "select":
        case undefined: // catches enter/return key
          switch (answer.answer) {
            default:
              await manageBlock(answer.answer, config, options)
              break
          }
          break;
        case "createNew":
          await createAndManageNewBlock(config, options)
          break
        case "exit":
          exit = true;
          break
      }
    }
  };
  return exit
};

export {
  manageInstallBlocks
}
