import { connect as VerseDBConnect } from 'verse.db';

import { VERSE_DB_DATA_DIR_PATH, VERSE_DB_LOGS_DIR_PATH } from '../../const.js';
import { createSimpleModuleLogger } from '../../../utils/logger.js';

const LOGGER = createSimpleModuleLogger('db');

const initDb = (devLog = false): VerseDBConnect => {
  LOGGER.log(`Initializing database`);
  const db = new VerseDBConnect({
    adapter: 'json',
    dataPath: VERSE_DB_DATA_DIR_PATH(),
    devLogs: {
      enable: devLog,
      path: VERSE_DB_LOGS_DIR_PATH(),
    },
  });

  return db;
};

const db = initDb(false);
export { db };
