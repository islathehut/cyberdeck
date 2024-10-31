import versedb from "verse.db";

import { VERSE_DB_DATA_DIR_PATH, VERSE_DB_LOGS_DIR_PATH } from "../../const.js";
import { jsonAdapter } from "verse.db/dist/adapters/json.adapter.js";
import { createSimpleModuleLogger } from "../../../utils/logger.js";

const LOGGER = createSimpleModuleLogger('db')

export class DB {
  private static _db: versedb.connect | undefined

  private constructor() {}

  public static initDb(devLog: boolean = false): versedb.connect {
    if (this._db != null) {
      throw new Error(`DB already initialized!`)
    }

    this._db = new versedb.connect({
      adapter: "json",
      dataPath: VERSE_DB_DATA_DIR_PATH,
      devLogs: {
        enable: devLog,
        path: VERSE_DB_LOGS_DIR_PATH
      }
    })

    return this._db
  }

  public static get db(): versedb.connect {
    if (this._db == null) {
      throw new Error(`Must initialize the DB before accessing it!`)
    }

    return this._db
  }

  public static get adapter(): jsonAdapter {
    return this.db.adapter as jsonAdapter
  }

  public static async add<T>(dataname: string, data: T, options?: versedb.AdapterTypes.AdapterUniqueKey): Promise<versedb.AdapterTypes.AdapterResults | undefined> {
    return this.db.add(dataname, data, options)
  }

  public static async update<T>(dataname: string, query: any, updateQuery: versedb.AdapterTypes.operationKeys): Promise<versedb.AdapterTypes.AdapterResults | undefined> {
    return this.db.update(dataname, query, updateQuery)
  }

  public static async move(
    from: string, 
    to: string, 
    options: {
      query?: versedb.AdapterTypes.queryOptions;
      dropSource?: boolean;
    } = { dropSource: true }
  ) {
    try {
      // Move data from the source to the destination with optional parameters
      const results = await this.adapter.moveData(from, to, options);
   
      LOGGER.log(results);
    } catch (e) {
      LOGGER.error(`Error while moving data in DB`, e);
    }
  }
}

export const db = DB.initDb(false)