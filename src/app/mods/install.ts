import chalk from 'chalk'

import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from "crypto";

import { CLIOptions, Config } from "../types.js";
import { getCurrentUninstalledBlock } from './block.js';
import { extractArchiveToTempDir } from './extract.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';

const LOGGER = createSimpleModuleLogger('mods:install')

const installMods = async (config: Config, options: CLIOptions): Promise<void> => {
  let installPath = config.installDirPath
  let logPrefix = ''
  if (options.dry) {
    installPath = path.join(process.cwd(), `/__dryRun_${randomUUID()}`)
    fs.mkdirSync(installPath)
    logPrefix = 'DRY RUN - '
  }

  const uninstalledBlock = getCurrentUninstalledBlock(config)
  if (uninstalledBlock == null) {
    LOGGER.log(chalk.yellowBright(`No uninstalled block found, skipping install!`))
    return
  }

  LOGGER.log(`${logPrefix}Installing mods in path ${installPath} for block ${uninstalledBlock.uuid}`)
  for (const fileName of config.installOrder[uninstalledBlock.uuid]) {
    const modMetadata = config.uninstalledMods.find(mod => mod.fileName === fileName)
    if (modMetadata?.skip) {
      LOGGER.log(chalk.dim.yellow(`Skipping ${fileName}`))
      continue
    }

    LOGGER.log(`Creating temp extraction directory for ${fileName}`)
    const tempDirPath = path.join(installPath, `__${modMetadata!.checksum}`)
    fs.mkdirSync(tempDirPath)

    LOGGER.log(`Extracting mod at ${modMetadata!.filePath} to ${tempDirPath}`)
    await extractArchiveToTempDir(modMetadata!.filePath, tempDirPath)

    if (modMetadata!.copyOverrides == null || modMetadata!.copyOverrides.length === 0) {
      LOGGER.log(`Copying all files from ${tempDirPath} to install path`)
      fs.cpSync(path.join(tempDirPath), installPath, {
        recursive: true
      })
    } else {
      LOGGER.log(`Copying files from ${tempDirPath} to install path based on configured overrides`)
      for (const override of modMetadata!.copyOverrides!) {
        LOGGER.log(`Copying ${override.in} to ${override.out} in install path`)
        fs.cpSync(path.join(tempDirPath, override.in), path.join(installPath, override.out), {
          recursive: true
        })
      }
    }
  }
}

export {
  installMods
}