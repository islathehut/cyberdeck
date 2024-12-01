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
  const installModeString = `${chalk.bold.cyan('Install Mode:  ')} ${chalk.magenta(currentOptions.installMode)}`;
  const verboseString = `${chalk.bold.cyan('Verbose:       ')} ${chalk.magenta(currentOptions.verbose ?? false)}`;

  nodeConsole.log(
    `
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${nameString}
  ${shortSeparator}
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${installModeString}
  ${shortSeparator} ${verboseString}
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
