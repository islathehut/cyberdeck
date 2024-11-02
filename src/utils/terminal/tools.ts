import chalk from 'chalk';
import { oraPromise } from 'ora';

export const promiseWithSpinner = async <T>(
  promise: () => Promise<T>,
  text: string,
  successText: string
): Promise<T> =>
  await oraPromise(promise, {
    color: 'yellow',
    text: chalk.cyan(text),
    successText: chalk.magenta(successText),
    spinner: 'dots',
    isEnabled: true,
    discardStdin: true,
  });
