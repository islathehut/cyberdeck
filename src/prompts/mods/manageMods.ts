#! /usr/bin/env ts-node

import chalk from 'chalk';
import autocomplete from 'inquirer-autocomplete-standalone';
import { DateTime } from 'luxon';
import readline from 'readline'

import { Mod } from '../../app/types.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { DEFAULT_THEME } from '../helpers/theme.js';
import { searchMods } from '../../app/mods/mod.js';
import actionSelect from '../../components/actionSelect.js';
import { editMod } from './editMod.js';

const LOGGER = createSimpleModuleLogger('prompts:updateInstallOrder')

const displayMod = (mod: Mod) => {
  const longSeparator = chalk.magenta('░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░')
  const mediumSeparator = chalk.magenta(`░░░░░░░░`)
  const shortSeparator = chalk.magenta('░░░░')

  const nameString = chalk.bold.white(mod.name)
  const filenameString = `${chalk.bold.cyan('Filename:      ')} ${chalk.magenta(mod.filename)}`
  const pathString = `${chalk.bold.cyan('File Path:     ')} ${chalk.magenta(mod.path)}`
  const checksumString = `${chalk.bold.cyan('Checksum:      ')} ${chalk.magenta(mod.checksum)}`
  const statusString = `${chalk.bold.cyan('Status:        ')} ${chalk.magenta(mod.status)}`
  const blockString = `${chalk.bold.cyan('Block:         ')} ${chalk.magenta(mod.blockUuid)}`
  const skipString = `${chalk.bold.cyan('Skipped:       ')} ${mod.skip ? chalk.yellow(mod.skip) : chalk.magenta(mod.skip)}`
  const createdAtString = `${chalk.bold.cyan('Created At:    ')} ${chalk.magenta(DateTime.fromMillis(mod.createdAt).toLocal().toISO())}`
  const modifiedAtString = `${chalk.bold.cyan('Modified At:   ')} ${chalk.magenta(DateTime.fromMillis(mod.modifiedAt).toLocal().toISO())}`
  const installedAtString = `${chalk.bold.cyan('Installed At:  ')} ${chalk.magenta(mod.installedAt ? DateTime.fromMillis(mod.installedAt).toLocal().toISO() : 'n/a')}`
  let copyOverridesString = `${chalk.bold.cyan('Copy Overrides:')}`
  if (mod.copyOverrides.length === 0) {
    copyOverridesString += ` ${chalk.gray(`unset`)}\n  ${shortSeparator}`
  } else {
    copyOverridesString += `\n  ${shortSeparator}\n`
    mod.copyOverrides.forEach(
      (override) => copyOverridesString += `  ${mediumSeparator} ${chalk.green('-')} ${chalk.italic('in:')}  ${chalk.magenta(override.in)}\n  ${mediumSeparator}   ${chalk.italic('out:')} ${chalk.magenta(override.out)}\n`
    )
    copyOverridesString += `  ${mediumSeparator}`
  }

  console.log(
  `
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${nameString}
  ${shortSeparator}
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${filenameString}
  ${shortSeparator} ${pathString}
  ${shortSeparator} ${checksumString}
  ${shortSeparator} ${blockString}
  ${shortSeparator} ${statusString}
  ${shortSeparator} ${skipString}
  ${shortSeparator}
  ${shortSeparator} ${createdAtString}
  ${shortSeparator} ${modifiedAtString}
  ${shortSeparator} ${installedAtString}
  ${shortSeparator}
  ${shortSeparator} ${copyOverridesString}
  ${longSeparator}
  `
  )
}

const manageMod = async (mod: Mod) => {
  let current = mod
  let exit = false
  while (exit === false) {
    displayMod(current)

    const defaultChoices = [
      { name: "Edit Mod", value: "editMod", description: "Edit mod configuration" }
    ]

    // console.log("") // just add a line break
    const answer = await actionSelect(
        {
          message: `Managing Mod - ${current.name}`,
          choices: [...defaultChoices],
          actions: [
            { name: "Select", value: "select", key: "e" },
            { name: "Exit", value: "exit", key: "escape" },
          ],
          theme: DEFAULT_THEME
        },
      )
    switch (answer.action) {
      case "select":
      case undefined: // catches enter/return key
        switch (answer.answer) {
          case "editMod":
            current = await editMod(current)
            break
        }
        break;
      case "exit":
        exit = true;
        break
    }
  };
  return exit
}

const selectMod = async () => {
  let exit = false
  while (exit === false) {
    const allMods = await searchMods({})

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const acPromise = autocomplete({
      message: 'Select a mod to manage',
      source: async (input: string | undefined) => {
        return allMods.filter((mod: Mod) => input == null || mod.name.toLowerCase().includes(input)).map((mod: Mod) => {
          return {
            name: mod.name,
            value: mod,
            description: mod.filename
          }
        })
      },
      theme: DEFAULT_THEME,
      suggestOnly: false
    } as any)

    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'escape') {
        acPromise.cancel()
      }
    })

    let mod: Mod
    try {
      mod = (await acPromise) as Mod
    } catch (e) {
      if ((e as Error).message !== 'Prompt was canceled') throw e
      exit = true
    }
    
    if (!exit) {
      await manageMod(mod!)
    }
    
  }
  return exit
}

export {
  selectMod
}
