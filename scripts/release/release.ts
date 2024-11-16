#! /usr/bin/env ts-node

import { program } from '@commander-js/extra-typings';
import { packageLinuxRelease } from './release_linux.js';
import { packageMacOSRelease } from './release_macos.js';
import { packageWinRelease } from './release_windows.js';

interface CLIOptions {
  platform?: string;
  version?: string;
}

const VERSION_REGEX = /^[0-9]+\.[0-9]+\.[0-9]+.*/g;

const validatePlatform = (platform?: string): boolean => {
  if (platform == null) {
    console.error(`Must provide a platform to generate release for`);
    return false;
  }

  if (!['linux', 'macos', 'win'].includes(platform)) {
    console.error(`Invalid platform ${platform} provided, choose from: linux macos win`);
    return false;
  }

  return true;
};

const validateVersion = (version?: string): boolean => {
  if (version == null) {
    console.error('Must provide a version for this release');
    return false;
  }

  if (version.trim().match(VERSION_REGEX) == null) {
    console.error(`Version string ${version.trim()} is invalid`);
    return false;
  }

  return true;
};

const validateOptions = (options: CLIOptions): boolean => {
  const platformValid = validatePlatform(options.platform);
  const versionValid = validateVersion(options.version);

  return platformValid && versionValid;
};

program.name('release-cyberdeck').description('Release Cyberdeck').version('1.0.0');

// Interactive mode
program
  .description('Release for platform')
  .option('-p, --platform <PLATFORM>', 'Platform to build release for [linux macos win]')
  .option('-v --version <VERSION>', 'Version to release')
  .action(async (options: CLIOptions) => {
    if (!validateOptions(options)) {
      console.error(`Invalid option(s) provided`);
      process.exit(1);
    }

    switch (options.platform) {
      case 'linux':
        await packageLinuxRelease(options.version!);
        break;
      case 'macos':
        await packageMacOSRelease(options.version!);
        break;
      case 'win':
        await packageWinRelease(options.version!);
        break;
      default:
        console.error(
          `Invalid platform ${options.platform}, should have been caught by "validateOptions"`
        );
        process.exit(1);
    }
  });

program.parse(process.argv);
