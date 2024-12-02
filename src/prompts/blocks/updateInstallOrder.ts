#! /usr/bin/env ts-node

import sortableCheckbox from 'inquirer-sortable-checkbox';

import { type Block, InstallStatus } from '../../app/types/types.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { DEFAULT_SORTABLE_THEME } from '../helpers/theme.js';
import { getBlock, updateBlock } from '../../app/mods/block.js';
import { findModByFilename, searchMods, updateMod } from '../../app/mods/mod.js';
import { promiseWithSpinner } from '../../utils/terminal/tools.js';

const LOGGER = createSimpleModuleLogger('prompts:updateInstallOrder');

const generateInstallOrder = async (blockUuid: string): Promise<string[]> => {
  const uninstalledMods = await searchMods({
    status: InstallStatus.UNINSTALLED,
    skip: false,
    blockUuid: { $typeOf: 'null' },
  });

  const block = await getBlock({ uuid: blockUuid });
  const installOrderForBlock: string[] = block.installOrder;
  const modsInInstallOrder = await Promise.all(
    installOrderForBlock.map(async filename => await findModByFilename(filename))
  );
  const existingChoices = modsInInstallOrder.map(mod => ({
    name: mod!.name,
    value: mod!,
    checked: true,
  }));
  const newChoices = uninstalledMods
    .filter(mod => installOrderForBlock.find(value => value === mod.filename) == null)
    .map(mod => ({
      name: mod.name,
      value: mod,
      checked: false,
    }));

  const choices = [...existingChoices, ...newChoices];

  const sortedList = await sortableCheckbox({
    message: 'Add/remove/reorder mods in install order',
    choices,
    theme: DEFAULT_SORTABLE_THEME,
  });

  const updateBlockUuidOnMods = async (): Promise<void> => {
    for (const mod of [...modsInInstallOrder, ...uninstalledMods]) {
      if (sortedList.find(value => value.filename === mod!.filename) == null) {
        await updateMod({ checksum: mod?.checksum }, { $set: { blockUuid: null } });
      } else {
        await updateMod({ checksum: mod?.checksum }, { $set: { blockUuid } });
      }
    }
  };

  await promiseWithSpinner(
    updateBlockUuidOnMods,
    'Updating block UUID on affected mods...',
    'Successfully updated block UUID on affected mods!',
    'Failed to update block UUID on affected mods!'
  );
  return sortedList.map(mod => mod.filename);
};

const updateInstallOrder = async (blockUuid: string): Promise<Block> => {
  LOGGER.log(`Modifying Install Order for block ${blockUuid}`);

  const installOrderForBlock = await generateInstallOrder(blockUuid);

  const updateInstallOrderOnBlock = async (): Promise<Block> =>
    await updateBlock(
      {
        uuid: blockUuid,
      },
      {
        $set: {
          installOrder: installOrderForBlock,
        },
      },
      false
    );

  const updatedBlock = await promiseWithSpinner(
    updateInstallOrderOnBlock,
    'Updating install order on block...',
    'Successfully updated install order on block!',
    'Failed to update install order on block!'
  );
  return updatedBlock!;
};

export { updateInstallOrder };
