import { randomUUID } from "crypto";
import { Block, Config } from "../types.js";
import { writeConfigFile } from "../config/config.js";

export const getCurrentUninstalledBlock = (config: Config): Block | undefined => {
  return config.blocks.find((block) => block.installed === false)
}

export const createBlock = (config: Config): Block => {
  const uninstalledBlock = getCurrentUninstalledBlock(config)
  if (uninstalledBlock != null) {
    console.warn(`Existing uninstalled block with UUID ${uninstalledBlock.uuid} found`)
    return uninstalledBlock
  }

  const newBlock: Block = {
    uuid: randomUUID(),
    installed: false,
    modChecksums: []
  }

  config.blocks.push(newBlock)
  config.installOrder[newBlock.uuid] = []
  writeConfigFile(config, true)

  return newBlock
}