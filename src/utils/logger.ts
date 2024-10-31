import debug from 'debug'

import { Console } from 'console'
import * as fs from 'fs'
import * as path from 'path'

import { DateTime } from 'luxon'
import { LOGS_DIR_PATH } from '../app/const.js'

if (!fs.existsSync(LOGS_DIR_PATH)) {
  fs.mkdirSync(LOGS_DIR_PATH)
}

const datetime = DateTime.local().toISO()
const logConsole = new Console(fs.createWriteStream(path.join(LOGS_DIR_PATH, `/cyberdeck_${datetime}.log`), { flags: 'a' }))

const packageName = 'cyberdeck'
debug.log = logConsole.log.bind(logConsole)
const log = debug(packageName)
const error = debug(`${packageName}:error`)

const packageLogger = {
  log: log.log,
  error: error.log,
  _logger: log,
  _errorLogger: error
}

export const createSimpleModuleLogger = (moduleName: string, baseLogger = packageLogger) => {
  return {
    log: packageLogger._logger.extend(moduleName),
    error: packageLogger._errorLogger.extend(`${moduleName}:error`)
  }
}