import { connect as VerseDBConnect } from 'verse.db';

import { VERSE_DB_DATA_DIR_PATH, VERSE_DB_LOGS_DIR_PATH } from '../../const.js';
import { createSimpleModuleLogger } from '../../../utils/logger.js';

const LOGGER = createSimpleModuleLogger('db');

// export class DB {
//   private static _db: versedb.connect | undefined

//   private constructor() {}

//   public static initDb(devLog: boolean = false): versedb.connect {
//     LOGGER.log(`Initializing database`)
//     if (this._db != null) {
//       throw new Error(`DB already initialized!`)
//     }

//     this._db = new versedb.connect({
//       adapter: "json",
//       dataPath: VERSE_DB_DATA_DIR_PATH,
//       devLogs: {
//         enable: devLog,
//         path: VERSE_DB_LOGS_DIR_PATH
//       }
//     })

//     return this._db
//   }

//   public static get db(): versedb.connect {
//     if (this._db == null) {
//       throw new Error(`Must initialize the DB before accessing it!`)
//     }

//     return this._db
//   }
// }

const initDb = (devLog = false): VerseDBConnect => {
  LOGGER.log(`Initializing database`);
  const db = new VerseDBConnect({
    adapter: 'json',
    dataPath: VERSE_DB_DATA_DIR_PATH,
    devLogs: {
      enable: devLog,
      path: VERSE_DB_LOGS_DIR_PATH,
    },
  });

  return db;
};

const db = initDb(false);
export { db };
