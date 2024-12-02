import type { Theme } from '@inquirer/core';
import chalk from 'chalk';
import type { SortableCheckboxTheme } from '../../app/types/types.js';

export const DEFAULT_THEME: Partial<Theme> & { icon: { cursor: string } } = {
  style: {
    answer: (text: string) => chalk.magentaBright(text),
    message: (text: string, status: 'idle' | 'done' | 'loading') => chalk.bold.cyan(text),
    error: (text: string) => chalk.redBright(text),
    help: (text: string) => chalk.cyanBright(text),
    highlight: (text: string) => chalk.bold.magentaBright(`${text} ⌝`),
    defaultAnswer: (text: string) => chalk.italic.gray(text),
    key: (text: string) => chalk.whiteBright(`<${text}>`),
  },
  icon: {
    cursor: chalk.bold('⌞'),
  },
};

export const DEFAULT_SORTABLE_THEME: SortableCheckboxTheme = {
  icon: {
    cursor: chalk.bold('⌞'),
    checked: chalk.bold('▨'),
    unchecked: chalk.bold('□'),
  },
  style: {
    answer: (text: string) => chalk.magentaBright(text),
    message: (text: string, status: 'idle' | 'done' | 'loading') => chalk.bold.cyan(text),
    error: (text: string) => chalk.redBright(text),
    help: (text: string) => chalk.cyanBright(text),
    highlight: (text: string) => chalk.bold.magentaBright(`${text} ⌝`),
    defaultAnswer: (text: string) => chalk.italic.gray(text),
    key: (text: string) => chalk.whiteBright(`<${text}>`),
  },
};
