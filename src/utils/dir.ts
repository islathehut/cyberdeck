import * as fs from 'node:fs/promises';
import * as fsSync from 'fs';

import { CYBERDECK_DIR_PATH, LOGS_DIR_PATH, MODS_DIR_PATH, UNPACK_DIR_PATH } from '../app/const.js';

export const initDirectoryStructure = async (): Promise<void> => {
  if (!fsSync.existsSync(CYBERDECK_DIR_PATH())) {
    await fs.mkdir(CYBERDECK_DIR_PATH());
  }

  if (!fsSync.existsSync(LOGS_DIR_PATH())) {
    await fs.mkdir(LOGS_DIR_PATH());
  }

  if (!fsSync.existsSync(MODS_DIR_PATH())) {
    await fs.mkdir(MODS_DIR_PATH());
  }

  if (!fsSync.existsSync(UNPACK_DIR_PATH())) {
    await fs.mkdir(UNPACK_DIR_PATH());
  }
};
