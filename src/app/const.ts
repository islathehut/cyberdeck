import * as path from 'path';
import * as os from 'os';

export const CHECKSUM_LENGTH = 32;
export const UUID_LENGTH = 36;

export const CONFIG_FILE_NAME = '.config';

export const CYBERDECK_DIR_PATH = (): string =>
  path.join(process.env.CYBERDECK_DIR_BASE_PATH ?? os.homedir(), '/.cyberdeck');
export const MODS_DIR_PATH = (): string => path.join(CYBERDECK_DIR_PATH(), 'mods');
export const UNPACK_DIR_PATH = (): string => path.join(CYBERDECK_DIR_PATH(), 'unpacked');
export const LOGS_DIR_PATH = (): string => path.join(CYBERDECK_DIR_PATH(), 'logs');
export const ASSETS_DIR_PATH = (): string => path.join(CYBERDECK_DIR_PATH(), 'assets');

export const HEADER_IMAGE_LOCAL_ASSET_PATH = path.join(
  process.cwd(),
  '/assets/cyberdeck_header_image.utf.ans'
);
export const HEADER_IMAGE_ASSET_PATH = (): string =>
  path.join(ASSETS_DIR_PATH(), 'cyberdeck_header_image.utf.ans');
export const HEADER_IMAGE_SEA_ASSET_KEY = 'cyberdeck_header_image_ans';

export const VERSE_DB_DIR_PATH = (): string => path.join(CYBERDECK_DIR_PATH(), 'versedb');
export const VERSE_DB_DATA_DIR_PATH = (): string => path.join(VERSE_DB_DIR_PATH(), 'data');
export const VERSE_DB_LOGS_DIR_PATH = (): string => path.join(VERSE_DB_DIR_PATH(), 'logs');

export const DEFAULT_INSTALL_DIR_NAME = 'Cyberpunk 2077';
export const DEFAULT_INSTALL_DIR_PATH = path.join(
  os.homedir(),
  '/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/',
  DEFAULT_INSTALL_DIR_NAME
);

export const NEXUS_MODS_API_BASE_URL = 'https://api.nexusmods.com/';
export const NEXUS_MODS_API_APIKEY_HEADER = 'apikey';
export const NEXUS_MODS_API_GAME_DOMAIN_NAME = 'cyberpunk2077';
