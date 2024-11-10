import { randomUUID } from 'crypto';
import { DateTime } from 'luxon';

import { type Block, InstallStatus, type Mod } from '../../src/app/types/types.js';
import { generateChecksum } from '../../src/utils/crypto.js';

export const generateFakeBlock = (overrides: Partial<Block> = {}): Block => {
  const baseBlock: Block = {
    uuid: randomUUID(),
    installed: false,
    installOrder: [],
    installedAt: null,
    createdAt: DateTime.utc().toMillis(),
    modifiedAt: DateTime.utc().toMillis(),
  };

  return {
    ...baseBlock,
    ...overrides,
  };
};

export const generateFakeMod = (overrides: Partial<Mod> = {}): Mod => {
  const uuid = randomUUID();
  const baseMod: Mod = {
    uuid,
    status: InstallStatus.UNINSTALLED,
    checksum: generateChecksum(uuid),
    path: `/Users/isla/.cyberdeck/mods/${uuid}.zip`,
    filename: `${uuid}.zip`,
    name: `Test Mod - ${uuid}`,
    blockUuid: null,
    createdAt: DateTime.utc().toMillis(),
    modifiedAt: DateTime.utc().toMillis(),
    copyOverrides: [],
    installedAt: null,
    skip: false,
    description: 'This is a mod that does a thing',
    nexusMetadata: null,
  };

  return {
    ...baseMod,
    ...overrides,
  };
};
