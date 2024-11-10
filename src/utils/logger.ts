import debug, { type Debugger } from 'debug';

import { Console } from 'console';
import * as fs from 'fs';
import * as path from 'path';

import { DateTime } from 'luxon';
import { LOGS_DIR_PATH } from '../app/const.js';
import type { Logger } from '../app/types/types.js';

let packageLogger = {
  log: ((...args: unknown[]): void => {
    // do nothing
  }) as Debugger,
  error: ((...args: unknown[]): void => {
    // do nothing
  }) as Debugger,
  _logger: {
    extend: (moduleName: string): Debugger =>
      ((...args: unknown[]) => {
        // do nothing
      }) as Debugger,
  },
  _errorLogger: {
    extend: (moduleName: string): Debugger =>
      ((...args: unknown[]) => {
        // do nothing
      }) as Debugger,
  },
};

if (process.env.IS_CI !== 'true') {
  const datetime = DateTime.local().toISO();
  const logConsole = new Console(
    fs.createWriteStream(path.join(LOGS_DIR_PATH(), `/cyberdeck_${datetime}.log`), { flags: 'a' })
  );

  const packageName = 'cyberdeck';
  debug.log = logConsole.log.bind(logConsole);
  const log = debug(packageName);
  const error = debug(`${packageName}:error`);

  packageLogger = {
    log: log.log as Debugger,
    error: error.log as Debugger,
    _logger: log,
    _errorLogger: error,
  };
}

export const createSimpleModuleLogger = (
  moduleName: string,
  baseLogger = packageLogger
): Logger => ({
  log: baseLogger._logger.extend(moduleName),
  error: baseLogger._errorLogger.extend(`${moduleName}:error`),
});
