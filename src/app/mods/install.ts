import chalk from 'chalk'

import * as fs from 'node:fs/promises';
import * as path from 'path'
import { randomUUID } from "crypto";

import { CLIOptions, Config, UninstalledMod, UnpackResult } from "../types.js";
import { getCurrentUninstalledBlock } from './block.js';
import { extractArchiveToTempDir } from './extract.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { promiseWithSpinner } from '../../utils/terminal/tools.js';
import { UNPACK_DIR_PATH } from '../const.js';

const LOGGER = createSimpleModuleLogger('mods:install')

const copyFiles = async (modMetadata: UninstalledMod, tempDirPath: string, mergedPath: string): Promise<void> => {
  if (modMetadata!.copyOverrides == null || modMetadata!.copyOverrides.length === 0) {
    LOGGER.log(`Copying all files from ${tempDirPath} to merged path`)
    await fs.cp(path.join(tempDirPath), mergedPath, {
      recursive: true
    })
  } else {
    LOGGER.log(`Copying files from ${tempDirPath} to merged path based on configured overrides`)
    for (const override of modMetadata!.copyOverrides!) {
      LOGGER.log(`Copying ${override.in} to ${override.out} in merged path`)
      await fs.cp(path.join(tempDirPath, override.in), path.join(mergedPath, override.out), {
        recursive: true
      })
    }
  }
}

const unpackMods = async (config: Config, options: CLIOptions): Promise<UnpackResult | null> => {
  LOGGER.log('Unpacking mods to temporary directory')
  let logPrefix = ''
  let unpackDirPrefix = ''
  if (options.dry) {
    logPrefix = 'DRY RUN - '
    unpackDirPrefix = 'dryRun_'
  }

  const unpackDirPath = path.join(UNPACK_DIR_PATH, `/__${unpackDirPrefix}${randomUUID()}`)
  LOGGER.log(chalk.dim.yellow(`Creating unpack dir for this block at ${unpackDirPath}`))
  await fs.mkdir(unpackDirPath)

  const unpackModsDirPath = path.join(unpackDirPath, 'extracted')
  LOGGER.log(chalk.dim.yellow(`Creating unpack mods dir for this block at ${unpackModsDirPath}`))
  await fs.mkdir(unpackModsDirPath)

  const unpackMergedDirPath = path.join(unpackDirPath, 'merged')
  LOGGER.log(chalk.dim.yellow(`Creating unpack merged dir for this block at ${unpackMergedDirPath}`))
  await fs.mkdir(unpackMergedDirPath)

  const uninstalledBlock = getCurrentUninstalledBlock(config)
  if (uninstalledBlock == null) {
    LOGGER.log(chalk.yellowBright(`No uninstalled block found, skipping install!`))
    return null
  }

  LOGGER.log(`${logPrefix}Unpacking mods in path ${unpackModsDirPath} for block ${uninstalledBlock.uuid} and copying files to ${unpackDirPath}`)
  for (const fileName of config.installOrder[uninstalledBlock.uuid]) {
    const modMetadata = config.uninstalledMods.find(mod => mod.fileName === fileName)
    if (modMetadata == null) {
      LOGGER.error(chalk.bold.redBright(`Metadata missing for ${fileName}, skipping!`))
      continue
    }

    if (modMetadata.skip) {
      LOGGER.log(chalk.dim.yellow(`Skipping ${fileName}`))
      continue
    }

    LOGGER.log(`Creating temp extraction directory for ${fileName}`)
    const tempDirPath = path.join(unpackModsDirPath, `__${modMetadata.checksum}`)
    await fs.mkdir(tempDirPath)

    LOGGER.log(`Extracting mod at ${modMetadata.filePath} to ${tempDirPath}`)
    await promiseWithSpinner(() => extractArchiveToTempDir(modMetadata.filePath, tempDirPath), `Extracting ${modMetadata.fileName}...`, `Finished extracting ${modMetadata.fileName}!`)
    await promiseWithSpinner(() => copyFiles(modMetadata, tempDirPath, unpackMergedDirPath), `Copying files from ${modMetadata.fileName} into merged dir...`, `Finished copying files from ${modMetadata.fileName} into merged dir!`)
  }

  return {
    mergedDir: unpackMergedDirPath,
    count: uninstalledBlock.modChecksums.length,
    blockUuid: uninstalledBlock.uuid
  }
}

const installMods = async (config: Config, unpackResult: UnpackResult, overrideInstallPath?: string): Promise<void> => {
  const installPath = overrideInstallPath ? overrideInstallPath : config.installDirPath
  LOGGER.log(`Installing ${unpackResult.count} mods in ${unpackResult.mergedDir} to ${installPath}`)
  await fs.cp(path.join(unpackResult.mergedDir), installPath, {
    recursive: true
  })
  LOGGER.log(`Done installing mods!`)
}

export {
  unpackMods,
  installMods
}