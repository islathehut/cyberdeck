import ANSI from 'ansi-art';
import chalk from 'chalk';

import type { CLIOptions } from '../../app/types/types.js';
import { HEADER_IMAGE_ASSET_PATH } from '../../app/const.js';

const generateCliHeaderImage = (): string => ANSI.get({ filePath: HEADER_IMAGE_ASSET_PATH() });

export const generateCliHeader = (cliOptions: CLIOptions): string => {
  const image = generateCliHeaderImage();
  const midText = chalk.bold.italic.magentaBright(
    `
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       The Cyberpunk 2077 CLI Mod Manager       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             Created by islaofnoman             ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    `
  );

  const bottomText: string[] = [];
  if (cliOptions.dry) {
    bottomText.push(
      chalk.bold.redBright(
        ` ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       !!!!!!!! DRY RUN ENABLED !!!!!!!!!       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`
      )
    );
  }

  if (cliOptions.test) {
    bottomText.push(
      chalk.bold.yellowBright(
        ` ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     RUNNING AGAINST FAKE INSTALL DIRECTORY     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`
      )
    );
  }

  if (!cliOptions.dry && !cliOptions.test) {
    bottomText.push(
      chalk.bold.magentaBright(
        ` ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     RUNNING AGAINST REAL INSTALL DIRECTORY     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`
      )
    );
  }

  // the formatting of these lines is intentional - DO NOT MODIFY
  return `
${image}
 ${midText}
 ${bottomText.join('\n ')}
 `;
};
