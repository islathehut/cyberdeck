import debug from 'debug';

import { Console } from 'console';
import * as fs from 'fs';
import * as path from 'path';

import { DateTime } from 'luxon';
import { LOGS_DIR_PATH } from '../app/const.js';
import type { Logger } from '../app/types/types.js';

export const nodeConsole = new Console(process.stdout, process.stderr);

if (process.env.IS_CI !== 'true') {
  const datetime = DateTime.local().toISO();
  const logConsole = new Console(
    fs.createWriteStream(path.join(LOGS_DIR_PATH(), `/cyberdeck_${datetime}.log`), { flags: 'a' })
  );
  debug.log = logConsole.log.bind(logConsole);
} else {
  debug.log = nodeConsole.log.bind(nodeConsole);
}

const packageName = 'cyberdeck';
const log = debug(packageName);
const error = debug(`${packageName}:error`);

const packageLogger = {
  log: log.log,
  error: error.log,
  _logger: log,
  _errorLogger: error,
};

export const createSimpleModuleLogger = (
  moduleName: string,
  baseLogger = packageLogger
): Logger => ({
  log: baseLogger._logger.extend(moduleName),
  error: baseLogger._errorLogger.extend(`${moduleName}:error`),
});
