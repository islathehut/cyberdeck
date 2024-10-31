import chalk from 'chalk'

import { randomUUID } from "crypto";

import { Block, Config } from "../types.js";
import { writeConfigFile } from "../config/config.js";
import { createSimpleModuleLogger } from "../../utils/logger.js";

const LOGGER = createSimpleModuleLogger('mods:block')

export const getCurrentUninstalledBlock = (config: Config): Block | undefined => {
  return config.blocks.find((block) => block.installed === false)
}

export const createBlock = async (config: Config): Promise<Block> => {
  LOGGER.log(`Creating a new install block`)
  const uninstalledBlock = getCurrentUninstalledBlock(config)
  if (uninstalledBlock != null) {
    LOGGER.log(chalk.dim.yellow(`Existing uninstalled block with UUID ${uninstalledBlock.uuid} found`))
    return uninstalledBlock
  }

  const newBlock: Block = {
    uuid: randomUUID(),
    installed: false,
    modChecksums: []
  }

  config.blocks.push(newBlock)
  config.installOrder[newBlock.uuid] = []
  await writeConfigFile(config, true)

  return newBlock
}