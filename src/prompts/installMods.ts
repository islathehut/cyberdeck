#! /usr/bin/env ts-node

import { confirm } from '@inquirer/prompts'
import chalk from 'chalk';

import * as fs from 'node:fs/promises';
import * as fsSync from 'fs'
import * as path from 'path'

import { CLIOptions, Config, InstalledMod, InstallStatus, UnpackResult } from '../app/types.js';
import { createSimpleModuleLogger } from '../utils/logger.js';
import { writeConfigFile } from '../app/config/config.js';
import { DEFAULT_THEME } from './theme.js';
import { installMods, unpackMods } from '../app/mods/install.js';
import { promiseWithSpinner } from '../utils/terminal/tools.js';
import { DateTime } from 'luxon';

const LOGGER = createSimpleModuleLogger('prompts:installMods')

const updateConfigAfterInstall = async (config: Config, unpackResult: UnpackResult) => {
  const installedAt = DateTime.utc().toMillis()

  LOGGER.log(`Updating config with installation metadata`)
  const modChecksums: string[] = []
  for (const mod of config.uninstalledMods) {
    const installedMod: InstalledMod = {
      ...mod,
      status: InstallStatus.INSTALLED,
      blockUuid: unpackResult.blockUuid,
      modifiedAt: installedAt
    }
    config.installedMods[mod.checksum] = installedMod
    modChecksums.push(mod.checksum)
  }
  config.uninstalledMods = []

  const newBlocks = config.blocks.map((block) => {
    if (block.uuid === unpackResult.blockUuid) {
      return {
        ...block,
        installed: true,
        installedAt,
        modChecksums
      }
    }

    return block
  })
  config.blocks = newBlocks

  await writeConfigFile(config, true)
  return
}

const installModsPrompt = async (config: Config, options: CLIOptions): Promise<void> => {
  console.log(chalk.bold.green('Unpacking mods before installation'))
  const result: UnpackResult | null = await unpackMods(config, options)
  if (result == null) {
    console.log(chalk.dim.yellow('No uninstalled mods found, skipping install!'))
    return
  }

  if (options.dry) {
    console.log(chalk.dim.yellow(`Dry run enabled, skipping installation!`))
    return
  }

  let overrideInstallPath: string | undefined = undefined
  if (options.test) {
    overrideInstallPath = path.join(process.cwd(), 'fake-install-dir')
    LOGGER.log(`In test mod, installing to ${overrideInstallPath}`)
    if (!fsSync.existsSync(overrideInstallPath)) {
      await fs.mkdir(overrideInstallPath)
    }
  }

  const installPath = overrideInstallPath ?? config.installDirPath
  const continueWithInstall = await confirm({
    message: `Would you like to continue with installing ${result.count} mods into ${installPath}?`,
    default: true,
    theme: DEFAULT_THEME
  })

  if (!continueWithInstall) {
    console.log(chalk.dim.yellow('Skipping install!'))
    return
  }

  console.log(chalk.bold.green(`Installing mods to ${installPath}`))

  await promiseWithSpinner(() => installMods(config, result, overrideInstallPath), 'Installing mods...', 'Done installing mods!')
  await promiseWithSpinner(() => updateConfigAfterInstall(config, result), 'Updating config post-install...', 'Done updating config post install!')
  return
}

export {
  installModsPrompt as installMods
}
