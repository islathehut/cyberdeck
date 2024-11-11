#! /usr/bin/env ts-node

import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { DateTime } from 'luxon';

import * as fs from 'node:fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

import type { UnpackResult } from '../../app/types/types.js';
import { InstallStatus } from '../../app/types/types.js';
import { createSimpleModuleLogger, nodeConsole } from '../../utils/logger.js';
import { DEFAULT_THEME } from '../helpers/theme.js';
import { installMods, unpackMods } from '../../app/mods/install.js';
import { promiseWithSpinner } from '../../utils/terminal/tools.js';
import { updateMod } from '../../app/mods/mod.js';
import { updateBlock } from '../../app/mods/block.js';
import { ConfigManager } from '../../app/config/config.manager.js';

const LOGGER = createSimpleModuleLogger('prompts:installMods');

const updateDbAfterInstall = async (blockUuid: string): Promise<void> => {
  const now = DateTime.utc().toMillis();

  LOGGER.log(`Updating config with installation metadata`);

  await updateMod(
    {
      blockUuid,
    },
    {
      $set: {
        status: InstallStatus.INSTALLED,
        installedAt: now,
        modifiedAt: now,
      },
    }
  );

  await updateBlock(
    {
      uuid: blockUuid,
    },
    {
      $set: {
        installed: true,
        installedAt: now,
        modifiedAt: now,
      },
    },
    false
  );
};

const installModsPrompt = async (blockUuid: string): Promise<void> => {
  const {
    manager: { cliOptions, config },
  } = ConfigManager;
  nodeConsole.log(chalk.bold.green('Unpacking mods before installation'));
  const result: UnpackResult | null = await unpackMods(blockUuid);
  if (result == null) {
    nodeConsole.log(chalk.dim.yellow('No uninstalled mods found, skipping install!'));
    return;
  }

  if (cliOptions.dry) {
    nodeConsole.log(chalk.dim.yellow(`Dry run enabled, skipping installation!`));
    return;
  }

  let overrideInstallPath: string | undefined = undefined;
  if (cliOptions.test) {
    overrideInstallPath = path.join(process.cwd(), 'fake-install-dir');
    LOGGER.log(`In test mod, installing to ${overrideInstallPath}`);
    if (!fsSync.existsSync(overrideInstallPath)) {
      await fs.mkdir(overrideInstallPath);
    }
  }

  const installPath = overrideInstallPath ?? config.installDirPath;
  const continueWithInstall = await confirm({
    message: `Would you like to continue with installing ${result.count} mods into ${installPath}?`,
    default: true,
    theme: DEFAULT_THEME,
  });

  if (!continueWithInstall) {
    nodeConsole.log(chalk.dim.yellow('Skipping install!'));
    return;
  }

  nodeConsole.log(chalk.bold.green(`Installing mods to ${installPath}`));

  await promiseWithSpinner(
    async () => {
      await installMods(result, overrideInstallPath);
    },
    'Installing mods...',
    'Done installing mods!',
    'Failed to install mods!!!'
  );
  await promiseWithSpinner(
    async () => {
      await updateDbAfterInstall(blockUuid);
    },
    'Updating DB post-install...',
    'Done updating DB post install!',
    'Failed to update DB post-install!!!'
  );
};

export { installModsPrompt as installMods };
