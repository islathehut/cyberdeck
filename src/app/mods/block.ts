import chalk from 'chalk'
import { AdapterResults } from 'verse.db/dist/types/adapter.js';

import { randomUUID } from "crypto";

import { Block } from "../types.js";
import { createSimpleModuleLogger } from "../../utils/logger.js";
import { DateTime } from 'luxon';
import Blocks, { BLOCKS_DATANAME } from '../storage/versedb/schemas/blocks.schema.js';
import { DB } from '../storage/versedb/cyberdeck.versedb.js';

const LOGGER = createSimpleModuleLogger('mods:block')

export const updateBlock = async (query: any, newData: any, upsert: boolean): Promise<Block> => {
  try {
    await DB.db.update(
      BLOCKS_DATANAME,
      query,
      newData,
      upsert
    )

    return getBlock(query)
  } catch (e) {
    LOGGER.error(`Error while updating block`, e)
    throw e
  }
}

export const getUninstalledBlocks = async (): Promise<any[]> => {
  const result: AdapterResults = await Blocks?.search([
    {
      dataname: BLOCKS_DATANAME,
      displayment: null,
      filter: {
        installed: false
      }
    }
  ])

  if (!result || !result.results) {
    return []
  }

  return Array.from(result.results.blocks)
}

export const getBlock = async (query: any): Promise<Block> => {
  try {
    const result: AdapterResults = await Blocks?.find(query)

    if (!result.results) {
      throw new Error(`No block found for query ${JSON.stringify(query)}`)
    }

    return result.results
  } catch (e) {
    LOGGER.error(`Error while finding block`, e)
    throw e
  }
}

export const getBlockByUuid = async (uuid: string): Promise<Block> => {
  return getBlock({
    uuid
  })
}

export const createBlock = async (): Promise<Block> => {
  LOGGER.log(`Creating a new install block`)

  const now = DateTime.utc().toMillis()
  const newBlock: Block = {
    uuid: randomUUID(),
    installed: false,
    installOrder: [],
    createdAt: now,
    modifiedAt: now,
    installedAt: null
  }

  try { 
    await Blocks?.add(newBlock)
  } catch (e) {
    console.error(`Error while writing block to db`, e)
    process.exit(0)
  }

  return newBlock
}