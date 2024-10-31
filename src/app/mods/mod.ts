import chalk from 'chalk'
import { DateTime } from 'luxon';
import { Query } from 'verse.db/dist/types/adapter.js';

import * as fs from 'node:fs/promises';
import * as path from 'path'
import { randomUUID } from 'node:crypto';

import { Mod, Config, InstallStatus } from "../types.js"
import { createSimpleModuleLogger } from '../../utils/logger.js'
import { generateChecksum } from '../../utils/crypto.js'
import Mods, { MODS_DATANAME } from '../storage/versedb/schemas/mods.schema.js';

import { DB } from '../storage/versedb/cyberdeck.versedb.js';

const LOGGER = createSimpleModuleLogger('mods:mod')

export const addMod = async (mod: Mod): Promise<Mod> => {
  try {
    await Mods?.add(mod)
    const addedMod = await findModByChecksum(mod.checksum)
    if (addedMod == null) {
      throw new Error(`Mod was written but couldn't find it after`)
    }
    return addedMod
  } catch (e) {
    LOGGER.error(`Error while writing mod to db`, e)
    throw e
  }
}

export const searchMods = async (query: any): Promise<Mod[]> => {
  const modsResult = await Mods?.search([
    {
      dataname: MODS_DATANAME,
      displayment: null,
      filter: query
    }
  ])

  return modsResult && modsResult.results ? modsResult.results.mods : []
}

export const updateMod = async (findQuery: Query<Mod>, updates: any): Promise<Mod> => {
  try {
    await DB.db.update(
      MODS_DATANAME,
      findQuery,
      updates,
      false
    )

    return (await findMod(findQuery))!
  } catch (e) {
    console.error(`Error while writing mod to db`, e)
    throw e
  }
}

export const findMod = async (findQuery: Query<Mod>): Promise<Mod | undefined> => {
  try {
    const result = await Mods?.find(findQuery)

    if (!result.results) {
      return undefined
    }

    return result.results
  } catch (e) {
    LOGGER.error(`Error while finding mod in db`, e)
    throw e
  }
}

export const findModByChecksum = async (checksum: string, throwOnUndefined: boolean = false): Promise<Mod | undefined> => {
  return findMod({
    checksum
  })
}

export const findModByFilename = async (filename: string): Promise<Mod | undefined> => {
  return findMod({
    filename
  })
}

export const loadAllModMetadata = async (config: Config): Promise<Mod[]> => {
  const loadedMods: Mod[] = []

  LOGGER.log(`Reading files from ${config.modsDirPath} to find uninstalled mods`)
  const dir = await fs.readdir(config.modsDirPath, { recursive: false, withFileTypes: true })
  for (const item of dir) {
    LOGGER.log(`Found ${item.name}`)
    if (item.isDirectory()) {
      LOGGER.log(chalk.dim.yellow(`Skipping directory`))
      continue
    }

    const filePath = path.join(config.modsDirPath, item.name)

    LOGGER.log(`Reading data to generate checksum`, filePath)
    const fileData = await fs.readFile(filePath)
    const checksum = generateChecksum(fileData)

    if ((await findModByChecksum(checksum) != null)) {
      LOGGER.log(chalk.dim.yellow(`Skipping already cached uninstalled mod`))
      continue
    }

    const now = DateTime.utc().toMillis()
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
      installedAt: null
    }

    loadedMods.push(mod)
  }

  return loadedMods
}