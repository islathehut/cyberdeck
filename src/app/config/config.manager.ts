import { DateTime } from 'luxon';

import * as fs from 'node:fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

import type { CLIOptions, Config } from '../types/types.js';
import { createSimpleModuleLogger } from '../../utils/logger.js';
import { CONFIG_FILE_NAME, CYBERDECK_DIR_PATH } from '../const.js';

const DEFAULT_CONFIG_FILE_PATH = path.join(CYBERDECK_DIR_PATH, CONFIG_FILE_NAME);

export class ConfigManager {
  private static _manager: ConfigManager | undefined;
  private static readonly _logger = createSimpleModuleLogger('config-manager');

  private _config: Config;
  private readonly _cliOptions: CLIOptions;
  private readonly _configFilePath: string;

  private constructor(config: Config, configFilePath: string, cliOptions: CLIOptions) {
    this._config = config;
    this._configFilePath = configFilePath;
    this._cliOptions = cliOptions;
  }

  public static async init(
    config: Config,
    cliOptions: CLIOptions,
    configFilePath: string = DEFAULT_CONFIG_FILE_PATH
  ): Promise<ConfigManager> {
    ConfigManager._logger.log(
      `Initializing new ConfigManager with config file at ${configFilePath}`
    );
    if (this._manager != null) {
      throw new Error(`ConfigManager has already been initialized!`);
    }

    if (this.fileExists(configFilePath)) {
      throw new Error(`Existing config file found at ${configFilePath}!`);
    }

    ConfigManager._logger.log(`Writing data to config file at ${configFilePath}`);
    await fs.writeFile(configFilePath, JSON.stringify(config, null, 2));
    this._manager = new ConfigManager(config, configFilePath, cliOptions);
    return this._manager;
  }

  public static async initFromFile(
    cliOptions: CLIOptions,
    configFilePath: string = DEFAULT_CONFIG_FILE_PATH
  ): Promise<ConfigManager> {
    ConfigManager._logger.log(`Initializing existing config from config file at ${configFilePath}`);
    if (this._manager != null) {
      throw new Error(`ConfigManager has already been initialized!`);
    }

    ConfigManager._logger.log(`Loading data from config file at ${configFilePath}`);
    if (!this.fileExists(configFilePath)) {
      throw new Error(`No config file found at ${configFilePath}!`);
    }

    const loadedConfig = JSON.parse((await fs.readFile(configFilePath)).toString()) as Config;
    this._manager = new ConfigManager(loadedConfig, configFilePath, cliOptions);
    return this._manager;
  }

  public async updateConfig(updates: Partial<Config>): Promise<boolean> {
    ConfigManager._logger.log(`Updating data in config file at ${this._configFilePath}`);
    if (!ConfigManager.fileExists(this._configFilePath)) {
      throw new Error(`No config file found at ${this._configFilePath}!`);
    }

    this._config = {
      ...this.config,
      ...updates,
      modifiedAt: DateTime.utc().toMillis(),
    };

    await fs.writeFile(this._configFilePath, JSON.stringify(this.config, null, 2));
    return true;
  }

  public get config(): Config {
    return this._config;
  }

  public get cliOptions(): CLIOptions {
    return this._cliOptions;
  }

  private static fileExists(configFilePath: string): boolean {
    return fsSync.existsSync(configFilePath);
  }

  public static get manager(): ConfigManager {
    if (this._manager == null) {
      throw new Error(`ConfigManager hasn't been initialized!`);
    }

    return this._manager;
  }
}
