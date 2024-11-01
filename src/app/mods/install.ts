import chalk from 'chalk'

import * as fs from 'node:fs/promises';
import * as path from 'path'
import { randomUUID } from "crypto";

import type { CLIOptions, Config, Mod, UnpackResult } from "../types/types.js";
import { extractArchiveToTempDir } from './extract.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { promiseWithSpinner } from '../../utils/terminal/tools.js';
import { UNPACK_DIR_PATH } from '../const.js';
import { getBlockByUuid } from './block.js';
import { findModByFilename } from './mod.js';

const LOGGER = createSimpleModuleLogger('mods:install')

const copyFiles = async (modMetadata: Mod, tempDirPath: string, mergedPath: string): Promise<void> => {
  if (modMetadata.copyOverrides.length === 0) {
    LOGGER.log(`Copying all files from ${tempDirPath} to merged path`)
    await fs.cp(path.join(tempDirPath), mergedPath, {
      recursive: true
    })
  } else {
    LOGGER.log(`Copying files from ${tempDirPath} to merged path based on configured overrides`)
    for (const override of modMetadata.copyOverrides) {
      LOGGER.log(`Copying ${override.in} to ${override.out} in merged path`)
      await fs.cp(path.join(tempDirPath, override.in), path.join(mergedPath, override.out), {
        recursive: true
      })
    }
  }
}

const unpackMods = async (blockUuid: string, options: CLIOptions): Promise<UnpackResult | null> => {
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

  const uninstalledBlock = await getBlockByUuid(blockUuid)

  LOGGER.log(`${logPrefix}Unpacking mods in path ${unpackModsDirPath} for block ${uninstalledBlock.uuid} and copying files to ${unpackDirPath}`)
  for (const filename of uninstalledBlock.installOrder) {
    const modMetadata = await findModByFilename(filename)
    if (modMetadata == null) {
      LOGGER.error(chalk.bold.redBright(`Metadata missing for ${filename}, skipping!`))
      continue
    }

    if (modMetadata.skip) {
      LOGGER.log(chalk.dim.yellow(`Skipping ${filename}`))
      continue
    }

    LOGGER.log(`Creating temp extraction directory for ${filename}`)
    const tempDirPath = path.join(unpackModsDirPath, `__${modMetadata.checksum}`)
    await fs.mkdir(tempDirPath)

    LOGGER.log(`Extracting mod at ${modMetadata.path} to ${tempDirPath}`)
    await promiseWithSpinner(async () => { await extractArchiveToTempDir(modMetadata.path, tempDirPath); }, `Extracting ${modMetadata.filename}...`, `Finished extracting ${modMetadata.filename}!`)
    await promiseWithSpinner(async () => { await copyFiles(modMetadata, tempDirPath, unpackMergedDirPath); }, `Copying files from ${modMetadata.filename} into merged dir...`, `Finished copying files from ${modMetadata.filename} into merged dir!`)
  }

  return {
    mergedDir: unpackMergedDirPath,
    count: uninstalledBlock.installOrder.length,
    blockUuid: uninstalledBlock.uuid
  }
}

const installMods = async (config: Config, unpackResult: UnpackResult, overrideInstallPath?: string): Promise<void> => {
  const installPath = overrideInstallPath ?? config.installDirPath
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