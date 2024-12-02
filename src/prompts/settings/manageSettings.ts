import chalk from 'chalk';
import radio from 'inquirer-radio-prompt';

import actionSelect from '../../components/actionSelect.js';
import { DEFAULT_THEME } from '../helpers/theme.js';
import { ConfigManager } from '../../app/config/config.manager.js';
import { type RuntimeOptions, InstallMode } from '../../app/types/types.js';
import { nodeConsole } from '../../utils/logger.js';

const displaySettings = (currentOptions: RuntimeOptions): void => {
  const longSeparator = chalk.magenta(
    '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'
  );
  const shortSeparator = chalk.magenta('░░░░');

  const nameString = chalk.bold.white(`Current Cyberdeck Settings`);

  const generateInstallModeString = (currentOptions: RuntimeOptions): string => {
    let modeString = '';
    switch (currentOptions.installMode) {
      case InstallMode.REAL:
        modeString = chalk.green('Real Install');
        break;
      case InstallMode.TEST:
        modeString = chalk.yellow('Test Install (Fake Install Dir)');
        break;
      case InstallMode.DRY:
        modeString = chalk.red('Extract-Only');
        break;
    }

    return `${chalk.bold.cyan('Install Mode:  ')} ${modeString}`;
  };

  const generateVerboseString = (currentOptions: RuntimeOptions): string => {
    let verboseString = '';
    switch (currentOptions.verbose) {
      case undefined:
        verboseString = chalk.gray('false');
        break;
      case true:
        verboseString = chalk.magenta('true');
        break;
    }

    return `${chalk.bold.cyan('Verbose:       ')} ${verboseString}`;
  };

  nodeConsole.log(
    `
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${nameString}
  ${shortSeparator}
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${generateInstallModeString(currentOptions)}
  ${shortSeparator} ${generateVerboseString(currentOptions)}
  ${shortSeparator}
  ${longSeparator}
  `
  );
};

const modifyInstallMode = async (currentOptions: RuntimeOptions): Promise<RuntimeOptions> => {
  const answer = await radio({
    message: 'Set install mode',
    choices: [
      { name: 'Real Install', value: InstallMode.REAL },
      { name: 'Test Install', value: InstallMode.TEST },
      { name: 'Extract Only', value: InstallMode.DRY },
    ],
    default: currentOptions.installMode,
    required: true,
    theme: DEFAULT_THEME,
  });

  if (answer == null) {
    throw new Error('Install mode must be non-null!');
  }

  return await ConfigManager.manager.updateOptions({
    installMode: answer as InstallMode,
  });
};

const manageSettings = async (): Promise<boolean> => {
  let exit = false;
  let {
    manager: { runtimeOptions: currentOptions },
  } = ConfigManager;
  while (!exit) {
    displaySettings(currentOptions);

    const defaultChoices = [
      { name: 'Install Mode', value: 'modifyInstallMode', description: 'Choose the install mode' },
    ];

    const answer = await actionSelect({
      message: `Manage Settings`,
      choices: [...defaultChoices],
      actions: [
        { name: 'Select', value: 'select', key: 'e' },
        { name: 'Exit', value: 'exit', key: 'escape' },
      ],
      theme: DEFAULT_THEME,
    });
    switch (answer.action) {
      case 'select':
      case undefined: // catches enter/return key
        switch (answer.answer) {
          case 'modifyInstallMode':
            currentOptions = await modifyInstallMode(currentOptions);
            break;
        }
        break;
      case 'exit':
        exit = true;
        break;
    }
  }
  return exit;
};

export { manageSettings };
