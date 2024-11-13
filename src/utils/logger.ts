import debug, { type Debugger } from 'debug';

import { Console } from 'console';
import * as fsSync from 'fs';
import * as path from 'path';

import { DateTime } from 'luxon';
import { LOGS_DIR_PATH } from '../app/const.js';
import type { Logger } from '../app/types/types.js';

export const nodeConsole = new Console(process.stdout, process.stderr);

let packageLogger:
  | {
      log: (...args: unknown[]) => unknown;
      error: (...args: unknown[]) => unknown;
      _logger: Debugger;
      _errorLogger: Debugger;
    }
  | undefined = undefined;

export const initLogger = async (): Promise<void> => {
  nodeConsole.log(`Initializing logger`);
  if (process.env.IS_CI !== 'true') {
    const logFilePath = path.join(
      LOGS_DIR_PATH(),
      `/cyberdeck_${DateTime.local().toFormat('yyyy-LL-dd_HHmmssS')}.log`
    );
    nodeConsole.log(`Creating write stream to ${logFilePath}`);
    const logConsole = new Console(fsSync.createWriteStream(logFilePath, { flags: 'a' }));
    debug.log = logConsole.log.bind(logConsole);
  } else {
    debug.log = nodeConsole.log.bind(nodeConsole);
  }

  const packageName = 'cyberdeck';
  const log = debug(packageName);
  const error = debug(`${packageName}:error`);

  packageLogger = {
    log: log.log,
    error: error.log,
    _logger: log,
    _errorLogger: error,
  };
};

const getPackageLogger = (): {
  log: (...args: unknown[]) => unknown;
  error: (...args: unknown[]) => unknown;
  _logger: Debugger;
  _errorLogger: Debugger;
} => {
  if (packageLogger == null) {
    throw new Error(`Package logger hasn't been initialized.  Run initLogger() first!`);
  }

  return packageLogger;
};

export const createSimpleModuleLogger = (
  moduleName: string,
  baseLogger?: {
    log: (...args: unknown[]) => unknown;
    error: (...args: unknown[]) => unknown;
    _logger: Debugger;
    _errorLogger: Debugger;
  }
): Logger => {
  if (baseLogger == null) {
    baseLogger = getPackageLogger();
  }

  return {
    log: baseLogger._logger.extend(moduleName),
    error: baseLogger._errorLogger.extend(`${moduleName}:error`),
  };
};
