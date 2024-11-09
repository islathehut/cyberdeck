#! /usr/bin/env ts-node

import chalk from 'chalk';
import autocomplete from 'inquirer-autocomplete-standalone';
import { DateTime } from 'luxon';
import readline, { type Key } from 'readline';

import type { Mod } from '../../app/types/types.js';
import { DEFAULT_THEME } from '../helpers/theme.js';
import { searchMods } from '../../app/mods/mod.js';
import actionSelect from '../../components/actionSelect.js';
import { editMod } from './editMod.js';
import { wrapTextWithPrefix } from '../../utils/terminal/tools.js';

const displayMod = (mod: Mod): void => {
  const longSeparator = chalk.magenta(
    '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░'
  );
  const mediumSeparator = chalk.magenta(`░░░░░░░░`);
  const shortSeparator = chalk.magenta('░░░░');

  const nameString = chalk.bold.white(mod.name);
  const descString = `${chalk.bold.cyan('Description:         ')} ${mod.description != null ? chalk.magenta(wrapTextWithPrefix(mod.description, `  ${shortSeparator}                       `)) : chalk.gray(`unset`)}`;
  const filenameString = `${chalk.bold.cyan('Filename:            ')} ${chalk.magenta(mod.filename)}`;
  const pathString = `${chalk.bold.cyan('File Path:           ')} ${chalk.magenta(mod.path)}`;
  const checksumString = `${chalk.bold.cyan('Checksum:            ')} ${chalk.magenta(mod.checksum)}`;
  const statusString = `${chalk.bold.cyan('Status:              ')} ${chalk.magenta(mod.status)}`;
  const blockString = `${chalk.bold.cyan('Install Block:       ')} ${chalk.magenta(mod.blockUuid)}`;
  const skipString = `${chalk.bold.cyan('Skipped:             ')} ${mod.skip ? chalk.yellow(mod.skip) : chalk.magenta(mod.skip)}`;
  const createdAtString = `${chalk.bold.cyan('Created At:          ')} ${chalk.magenta(DateTime.fromMillis(mod.createdAt).toLocal().toISO())}`;
  const modifiedAtString = `${chalk.bold.cyan('Modified At:         ')} ${chalk.magenta(DateTime.fromMillis(mod.modifiedAt).toLocal().toISO())}`;
  const installedAtString = `${chalk.bold.cyan('Installed At:        ')} ${chalk.magenta(mod.installedAt != null ? DateTime.fromMillis(mod.installedAt).toLocal().toISO() : 'n/a')}`;

  let nexusString = chalk.bold.cyan('Nexus Mods Metadata:');
  if (mod.nexusMetadata == null) {
    nexusString += `  ${chalk.gray(`unset`)}`;
  } else {
    nexusString += `\n  ${shortSeparator}`;
    nexusString += `\n  ${mediumSeparator}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('Name:               ')} ${chalk.magentaBright(mod.nexusMetadata.mod.name)}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('ID:                 ')} ${chalk.magentaBright(mod.nexusMetadata.mod.modId)}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('Summary:            ')} ${chalk.magentaBright(wrapTextWithPrefix(mod.nexusMetadata.mod.summary, `  ${mediumSeparator}                      `))}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('Latest Version:     ')} ${chalk.magentaBright(mod.nexusMetadata.mod.version)}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('Installed Version:  ')} ${chalk.magentaBright(mod.nexusMetadata.file.version)}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('Available:          ')} ${mod.nexusMetadata.mod.available ? chalk.magentaBright(mod.nexusMetadata.mod.available) : chalk.bold.redBright(mod.nexusMetadata.mod.available)}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('NSFW:               ')} ${chalk.magentaBright(mod.nexusMetadata.mod.nsfw)}`;
    nexusString += `\n  ${mediumSeparator}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('Created At:         ')} ${chalk.magentaBright(mod.nexusMetadata.mod.createdAt)}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.whiteBright.italic.bold('Modified At:        ')} ${chalk.magentaBright(mod.nexusMetadata.mod.modifiedAt)}`;
    nexusString += `\n  ${mediumSeparator}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.bold.gray('Author:')}`;
    nexusString += `\n  ${mediumSeparator}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('Name:         ')} ${chalk.magentaBright(mod.nexusMetadata.mod.author.displayName)}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('Username:     ')} ${chalk.magentaBright(mod.nexusMetadata.mod.author.name)}`;

    nexusString += `\n  ${mediumSeparator}`;
    nexusString += `\n  ${mediumSeparator} ${chalk.bold.gray('Installed File Metadata:')}`;
    nexusString += `\n  ${mediumSeparator}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('Name:         ')} ${chalk.magentaBright(mod.nexusMetadata.file.name)}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('ID:           ')} ${chalk.magentaBright(mod.nexusMetadata.file.id)}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('Description:  ')} ${chalk.magentaBright(wrapTextWithPrefix(mod.nexusMetadata.file.description, `  ${mediumSeparator}${mediumSeparator}                `))}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('Filename:     ')} ${chalk.magentaBright(mod.nexusMetadata.file.fileName)}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('Version:      ')} ${chalk.magentaBright(mod.nexusMetadata.file.version)}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator}`;
    nexusString += `\n  ${mediumSeparator}${mediumSeparator} ${chalk.whiteBright.italic.bold('Uploaded At:  ')} ${chalk.magentaBright(mod.nexusMetadata.file.uploadedAt)}`;
  }

  let copyOverridesString = chalk.bold.cyan('Copy Overrides:');
  if (mod.copyOverrides.length === 0) {
    copyOverridesString += `       ${chalk.gray(`unset`)}\n  ${shortSeparator}`;
  } else {
    copyOverridesString += `\n  ${shortSeparator}\n`;
    mod.copyOverrides.forEach(
      override =>
        (copyOverridesString += `  ${mediumSeparator} ${chalk.green('-')} ${chalk.italic('in:')}  ${chalk.magenta(override.in)}\n  ${mediumSeparator}   ${chalk.italic('out:')} ${chalk.magenta(override.out)}\n`)
    );
    copyOverridesString += `  ${mediumSeparator}`;
  }

  console.log(
    `
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${nameString}
  ${shortSeparator}
  ${longSeparator}
  ${shortSeparator}
  ${shortSeparator} ${descString}
  ${shortSeparator} ${filenameString}
  ${shortSeparator} ${pathString}
  ${shortSeparator} ${checksumString}
  ${shortSeparator}
  ${shortSeparator} ${blockString}
  ${shortSeparator} ${statusString}
  ${shortSeparator} ${skipString}
  ${shortSeparator}
  ${shortSeparator} ${createdAtString}
  ${shortSeparator} ${modifiedAtString}
  ${shortSeparator} ${installedAtString}
  ${shortSeparator}
  ${shortSeparator} ${nexusString}
  ${shortSeparator}
  ${shortSeparator} ${copyOverridesString}
  ${longSeparator}
  `
  );
};

const manageMod = async (mod: Mod): Promise<boolean> => {
  let current = mod;
  let exit = false;
  while (!exit) {
    displayMod(current);

    const defaultChoices = [
      { name: 'Edit Mod', value: 'editMod', description: 'Edit mod configuration' },
    ];

    // console.log("") // just add a line break
    const answer = await actionSelect({
      message: `Managing Mod - ${current.name}`,
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
          case 'editMod':
            current = await editMod(current);
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

const selectMod = async (): Promise<boolean> => {
  let exit = false;
  while (!exit) {
    const allMods = await searchMods({});

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const acPromise = autocomplete({
      message: 'Select a mod to manage',
      source: async (input: string | undefined) =>
        allMods
          .filter((mod: Mod) => input == null || mod.name.toLowerCase().includes(input))
          .map((mod: Mod) => ({
            name: mod.name,
            value: mod,
            description: mod.description ?? mod.name,
          })),
      // @ts-expect-error The autocomplete library doesn't allow theming but I modified to allow it
      theme: DEFAULT_THEME,
      suggestOnly: false,
    });

    process.stdin.on('keypress', (str: string, key: Key) => {
      if (key.name === 'escape') {
        acPromise.cancel();
      }
    });

    let mod: Mod | null = null;
    try {
      mod = await acPromise;
    } catch (e) {
      if ((e as Error).message !== 'Prompt was canceled') throw e as Error;
      exit = true;
    }

    if (!exit && mod != null) {
      await manageMod(mod);
    }
  }
  return exit;
};

export { selectMod };
