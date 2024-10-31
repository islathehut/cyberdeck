import * as path from 'path'
import * as os from 'os'

export const CONFIG_FILE_NAME = '.config'

export const CYBERDECK_DIR_PATH = path.join(os.homedir(), '/.cyberdeck')
export const MODS_DIR_PATH = path.join(CYBERDECK_DIR_PATH, 'mods')
export const UNPACK_DIR_PATH = path.join(CYBERDECK_DIR_PATH, 'unpacked')
export const LOGS_DIR_PATH = path.join(CYBERDECK_DIR_PATH, 'logs')

export const VERSE_DB_DIR_PATH = path.join(CYBERDECK_DIR_PATH, 'versedb')
export const VERSE_DB_DATA_DIR_PATH = path.join(VERSE_DB_DIR_PATH, 'data')
export const VERSE_DB_LOGS_DIR_PATH = path.join(VERSE_DB_DIR_PATH, 'logs')

export const DEFAULT_INSTALL_DIR_NAME = 'Cyberpunk 2077'
export const DEFAULT_INSTALL_DIR_PATH = path.join(os.homedir(), '/Library/Application Support/CrossOver/Bottles/Steam/drive_c/Program Files (x86)/Steam/steamapps/common/', DEFAULT_INSTALL_DIR_NAME)