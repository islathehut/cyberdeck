import * as fs from 'node:fs/promises';
import * as fsSync from 'fs';
import * as sea from 'node:sea';

import {
  ASSETS_DIR_PATH,
  CYBERDECK_DIR_PATH,
  HEADER_IMAGE_ASSET_PATH,
  HEADER_IMAGE_LOCAL_ASSET_PATH,
  HEADER_IMAGE_SEA_ASSET_KEY,
  LOGS_DIR_PATH,
  MODS_DIR_PATH,
  UNPACK_DIR_PATH,
} from '../app/const.js';

export const initDirectoryStructure = async (): Promise<void> => {
  console.log('Checking cyberdeck dir');
  if (!fsSync.existsSync(CYBERDECK_DIR_PATH())) {
    console.log('Creating cyberdeck dir');
    await fs.mkdir(CYBERDECK_DIR_PATH());
  }

  console.log('Checking cyberdeck logs dir');
  if (!fsSync.existsSync(LOGS_DIR_PATH())) {
    console.log('Creating cyberdeck logs dir');
    await fs.mkdir(LOGS_DIR_PATH());
  }

  console.log('Checking cyberdeck mods dir');
  if (!fsSync.existsSync(MODS_DIR_PATH())) {
    console.log('Creating cyberdeck mods dir');
    await fs.mkdir(MODS_DIR_PATH());
  }

  console.log('Checking cyberdeck unpack dir');
  if (!fsSync.existsSync(UNPACK_DIR_PATH())) {
    console.log('Creating cyberdeck logs dir');
    await fs.mkdir(UNPACK_DIR_PATH());
  }

  console.log('Checking cyberdeck assets dir');
  if (!fsSync.existsSync(ASSETS_DIR_PATH())) {
    console.log('Creating cyberdeck assets dir');
    await fs.mkdir(ASSETS_DIR_PATH());
  }

  console.log('Checking for header image ans file');
  if (!fsSync.existsSync(HEADER_IMAGE_ASSET_PATH())) {
    if (sea.isSea()) {
      console.log('Creating header image ans file from SEA asset');
      await fs.writeFile(
        HEADER_IMAGE_ASSET_PATH(),
        Buffer.from(sea.getAsset(HEADER_IMAGE_SEA_ASSET_KEY))
      );
    } else {
      console.log('Creating header image ans file from local asset file');
      console.log(HEADER_IMAGE_LOCAL_ASSET_PATH);
      console.log(HEADER_IMAGE_ASSET_PATH());
      const content = await fs.readFile(HEADER_IMAGE_LOCAL_ASSET_PATH);
      await fs.writeFile(HEADER_IMAGE_ASSET_PATH(), content);
    }
  }
};
