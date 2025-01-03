#! /usr/bin/env ts-node

import chalk from 'chalk';

import { createSimpleModuleLogger, nodeConsole } from '../../utils/logger.js';
import { loadUnseenModMetadata } from '../../app/mods/mod.js';

import Mods from '../../app/storage/versedb/schemas/mods.schema.js';
import { promiseWithSpinner } from '../../utils/terminal/tools.js';
import { NexusModsManager } from '../../app/mods/nexusMods/nexusMods.manager.js';

const LOGGER = createSimpleModuleLogger('prompts:loadMods');

const loadMods = async (recheckAll = false): Promise<void> => {
  LOGGER.log(`Loading mods from config and mod directory`);
  const rawLoadedMods = await promiseWithSpinner(
    async () => await loadUnseenModMetadata(recheckAll),
    'Searching for new mod files...',
    `Finished searching for new mod files!`,
    `Failed while searching for new mod files!!!`
  );

  if (rawLoadedMods == null) {
    return;
  }

  if (rawLoadedMods.length === 0) {
    const message = chalk.dim.yellow(`No new mods found!`);
    nodeConsole.log(message);
    LOGGER.log(message);
    return;
  }

  for (const uninstalledMod of rawLoadedMods) {
    try {
      await Mods?.add(uninstalledMod);
      await NexusModsManager._updateModWithMetadata(uninstalledMod);
    } catch (e) {
      nodeConsole.error(`Error while writing mod to db`, e);
      process.exit(0);
    }
  }

  const message = chalk.green(`Finished loading new mods!`);
  nodeConsole.log(message);
  LOGGER.log(message);
};

export { loadMods };
