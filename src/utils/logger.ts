import debug from 'debug'

debug.log = console.info.bind(console)
const packageName = 'cyberdeck'
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