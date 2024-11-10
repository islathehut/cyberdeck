import chalk from 'chalk';
import { DateTime } from 'luxon';
import type { operationKeys, Query } from 'verse.db/dist/types/adapter.js';

import * as fs from 'node:fs/promises';
import * as path from 'path';
import { randomUUID } from 'node:crypto';

import { type Mod, InstallStatus, type SearchResult, type FindResult } from '../types/types.js';
import { createSimpleModuleLogger, nodeConsole } from '../../utils/logger.js';
import { generateChecksum } from '../../utils/crypto.js';
import Mods, { MODS_DATANAME } from '../storage/versedb/schemas/mods.schema.js';

import { db } from '../storage/versedb/cyberdeck.versedb.js';
import { ConfigManager } from '../config/config.manager.js';
import { NexusModsManager } from './nexusMods/nexusMods.manager.js';

const LOGGER = createSimpleModuleLogger('mods:mod');

export const addMod = async (mod: Mod): Promise<Mod> => {
  try {
    await Mods?.add(mod);
    const addedMod = await findModByChecksum(mod.checksum);
    if (addedMod == null) {
      throw new Error(`Mod was written but couldn't find it after`);
    }
    return addedMod;
  } catch (e) {
    LOGGER.error(`Error while writing mod to db`, e);
    throw e as Error;
  }
};

export const searchMods = async (query: Query<Mod>): Promise<Mod[]> => {
  const modsResult: SearchResult<Mod> = (await Mods?.search([
    {
      dataname: MODS_DATANAME,
      displayment: null,
      filter: query,
    },
  ])) as SearchResult<Mod>;

  return modsResult.results != null ? modsResult.results.mods : [];
};

export const updateMod = async (findQuery: Query<Mod>, updates: operationKeys): Promise<Mod> => {
  try {
    await db.update(MODS_DATANAME, findQuery, updates, false);

    const updatedMod = await findMod(findQuery);
    if (updatedMod == null) {
      throw new Error(`Couldn't find mod after update`);
    }

    return updatedMod;
  } catch (e) {
    nodeConsole.error(`Error while writing mod to db`, e);
    throw e as Error;
  }
};

export const findMod = async (findQuery: Query<Mod>): Promise<Mod | undefined> => {
  try {
    const result: FindResult<Mod> = (await Mods?.find(findQuery)) as FindResult<Mod>;

    if (result.results == null) {
      return undefined;
    }

    return result.results;
  } catch (e) {
    LOGGER.error(`Error while finding mod in db`, e);
    throw e as Error;
  }
};

export const findModByChecksum = async (
  checksum: string,
  throwOnUndefined = false
): Promise<Mod | undefined> =>
  await findMod({
    checksum,
  });

export const findModByFilename = async (filename: string): Promise<Mod | undefined> =>
  await findMod({
    filename,
  });

export const loadUnseenModMetadata = async (recheckAll: boolean): Promise<Mod[]> => {
  const loadedMods: Mod[] = [];
  let latestModLoadedMs = 0;
  const { manager: configManager } = ConfigManager;

  LOGGER.log(`Reading files from ${configManager.config.modsDirPath} to find uninstalled mods`);
  const dir = await fs.readdir(configManager.config.modsDirPath, {
    recursive: false,
    withFileTypes: true,
  });
  for (const item of dir) {
    LOGGER.log(`Found ${item.name}`);
    if (item.isDirectory()) {
      LOGGER.log(chalk.dim.yellow(`Skipping directory`));
      continue;
    }

    const filePath = path.join(configManager.config.modsDirPath, item.name);

    const stats = await fs.stat(filePath);
    const isRecent =
      stats.mtimeMs <= configManager.config.latestModLoadedMs &&
      stats.birthtimeMs <= configManager.config.latestModLoadedMs;
    if (!recheckAll && isRecent) {
      LOGGER.log(
        chalk.dim.yellow(
          `Skipping ${filePath} because modified time is earlier than last latest seen`
        )
      );
      continue;
    }

    if (latestModLoadedMs < stats.birthtimeMs || latestModLoadedMs < stats.birthtimeMs) {
      latestModLoadedMs = Math.max(stats.birthtimeMs, stats.birthtimeMs);
    }

    LOGGER.log(`Reading data to generate checksum`, filePath);
    const fileData = await fs.readFile(filePath);
    const checksum = generateChecksum(fileData);

    const existingMod = await findModByChecksum(checksum);
    if (existingMod != null) {
      if (existingMod.nexusMetadata != null) {
        LOGGER.log(chalk.dim.yellow(`Skipping already cached uninstalled mod`));
        continue;
      }
      await NexusModsManager._updateModWithMetadata(existingMod);
      continue;
    }

    const now = DateTime.utc().toMillis();
    const mod: Mod = {
      uuid: randomUUID(),
      status: InstallStatus.UNINSTALLED,
      checksum,
      path: filePath,
      filename: item.name,
      name: item.name,
      blockUuid: null,
      skip: false,
      createdAt: now,
      modifiedAt: now,
      copyOverrides: [],
      installedAt: null,
    };

    loadedMods.push(mod);
  }

  if (latestModLoadedMs > 0) {
    await configManager.updateConfig({
      latestModLoadedMs,
    });
  }

  return loadedMods;
};
