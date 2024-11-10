import type { operationKeys, Query } from 'verse.db/dist/types/adapter.js';

import { randomUUID } from 'crypto';
import { DateTime } from 'luxon';

import type { Block, FindResult, SearchResult } from '../types/types.js';
import { createSimpleModuleLogger, nodeConsole } from '../../utils/logger.js';
import Blocks, { BLOCKS_DATANAME } from '../storage/versedb/schemas/blocks.schema.js';
import { db } from '../storage/versedb/cyberdeck.versedb.js';

const LOGGER = createSimpleModuleLogger('mods:block');

export const updateBlock = async (
  query: Query<Block>,
  newData: operationKeys,
  upsert: boolean
): Promise<Block> => {
  try {
    await db.update(BLOCKS_DATANAME, query, newData, upsert);

    return await getBlock(query);
  } catch (e) {
    LOGGER.error(`Error while updating block`, e);
    throw e as Error;
  }
};

export const getUninstalledBlocks = async (): Promise<Block[]> => {
  const result: SearchResult<Block> = (await Blocks?.search([
    {
      dataname: BLOCKS_DATANAME,
      displayment: null,
      filter: {
        installed: false,
      },
    },
  ])) as SearchResult<Block>;

  if (result.results == null) {
    return [];
  }

  return Array.from(result.results.blocks);
};

export const getBlock = async (query: Query<Block>): Promise<Block> => {
  try {
    const result: FindResult<Block> = (await Blocks?.find(query)) as FindResult<Block>;

    if (result.results == null) {
      throw new Error(`No block found for query ${JSON.stringify(query)}`);
    }

    return result.results;
  } catch (e) {
    LOGGER.error(`Error while finding block`, e);
    throw e as Error;
  }
};

export const getBlockByUuid = async (uuid: string): Promise<Block> =>
  await getBlock({
    uuid,
  });

export const createBlock = async (): Promise<Block> => {
  LOGGER.log(`Creating a new install block`);

  const now = DateTime.utc().toMillis();
  const newBlock: Block = {
    uuid: randomUUID(),
    installed: false,
    installOrder: [],
    createdAt: now,
    modifiedAt: now,
    installedAt: null,
  };

  try {
    await Blocks?.add(newBlock);
  } catch (e) {
    nodeConsole.error(`Error while writing block to db`, e);
    throw e as Error;
  }

  return newBlock;
};
