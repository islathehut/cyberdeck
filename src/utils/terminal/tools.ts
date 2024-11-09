import chalk from 'chalk';
import { DateTime } from 'luxon';
import ora from 'ora';
import { createSimpleModuleLogger } from '../logger.js';

const Logger = createSimpleModuleLogger('utils:terminal:tools');

export const promiseWithSpinner = async <T>(
  promise: () => Promise<T>,
  text: string,
  successText: string,
  failText: string
): Promise<T | null> => {
  const startTimeMs = DateTime.utc().toMillis();
  const spinner = ora({
    color: 'yellow',
    text: chalk.cyan(text),
    spinner: 'dots',
    isEnabled: true,
    discardStdin: true,
  });

  let result: T | null = null;
  try {
    spinner.start();
    result = await promise();
    const elapsedMs = DateTime.utc().toMillis() - startTimeMs;
    spinner.succeed(`${chalk.magenta(successText)} ${chalk.green(`(${elapsedMs}ms)`)}`);
  } catch (e) {
    const elapsedMs = DateTime.utc().toMillis() - startTimeMs;
    Logger.error(`Error occurred while running promise in spinner`, e);
    spinner.fail(`${chalk.red(failText)} ${chalk.yellow(`(${elapsedMs}ms)`)}`);
  }

  return result;
};

export const wrapTextWithPrefix = (text: string, prefix: string, width = 100): string => {
  const originalLines = text.split('\n');
  const lines = [];
  for (let i = 0; i < originalLines.length; i++) {
    const words = originalLines[i].split(' ');
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine.length > 0 ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    if (i < originalLines.length - 1) {
      lines.push('');
    }
  }

  return lines
    .map((line: string, index: number) => (index > 0 ? `${prefix}${line}` : line))
    .join('\n');
};
