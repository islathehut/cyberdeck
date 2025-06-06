#! /usr/bin/env ts-node

import chalk from 'chalk';

import { createSimpleModuleLogger, nodeConsole } from '../../utils/logger.js';
import { loadModMetadata } from '../../app/mods/mod.js';

import Mods from '../../app/storage/versedb/schemas/mods.schema.js';
import { promiseWithSpinner } from '../../utils/terminal/tools.js';
import { NexusModsManager } from '../../app/mods/nexusMods/nexusMods.manager.js';
import type { Mod } from '../../app/types/types.js';

const LOGGER = createSimpleModuleLogger('prompts:loadMods');

const loadMods = async (recheckAll = false): Promise<void> => {
  LOGGER.log(`Loading mods from config and mod directory`);
  const rawLoadedMods = await promiseWithSpinner(
    async () => await loadModMetadata(recheckAll),
    'Searching for new mod files...',
    `Finished searching for new mod files!`,
    `Failed while searching for new mod files!!!`
  );

  if (rawLoadedMods == null) {
    return;
  }

  if (rawLoadedMods.new.length === 0) {
    const message = chalk.dim.yellow(`No new mods found!`);
    nodeConsole.log(message);
    LOGGER.log(message);
  } else {
    const addModsWithMetadata = async (): Promise<void> => {
      for (const uninstalledMod of rawLoadedMods.new) {
        try {
          await Mods?.add(uninstalledMod);
          const updatedMod = await NexusModsManager._updateModWithMetadata(uninstalledMod);
          if (
            updatedMod.nexusMetadata != null &&
            updatedMod.nexusMetadata.mod.version !== updatedMod.nexusMetadata.file.version
          ) {
            rawLoadedMods.updates.push(updatedMod);
          }
        } catch (e) {
          nodeConsole.error(`Error while writing mod to db`, e);
          process.exit(0);
        }
      }
    };

    await promiseWithSpinner(
      async () => {
        await addModsWithMetadata();
      },
      `Adding ${rawLoadedMods.new.length} mods with Nexus Mods metadata...`,
      `Finished adding ${rawLoadedMods.new.length} new mods!`,
      `Failed while adding ${rawLoadedMods.new.length} new mods!!!`
    );

    const message = chalk.green(`Finished loading ${rawLoadedMods.new.length} new mods!`);
    LOGGER.log(message);
  }

  if (rawLoadedMods.updates.length === 0) {
    const message = chalk.dim.yellow(`No new mods found!`);
    nodeConsole.log(message);
    LOGGER.log(message);
    return;
  }

  const displayPossibleUpdates = (updates: Mod[]): void => {
    nodeConsole.log('Found the following possible mod updates:\n');
    for (const mod of updates) {
      const nameString = chalk.bold.white(mod.name);
      const updateString = `${chalk.magentaBright(mod.nexusMetadata?.file.version)} -> ${chalk.italic.bold.yellowBright(mod.nexusMetadata?.mod.version)}`;
      nodeConsole.log(`   * ${nameString} - ${updateString}`);
    }
    nodeConsole.log('\n');
  };

  displayPossibleUpdates(rawLoadedMods.updates);
};

export { loadMods };
