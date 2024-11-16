import path from 'path';
import Seven from 'node-7z';
import chalk from 'chalk';
import actions from '@actions/core';

import { sleep } from '../../src/utils/util.js';

const RELEASE_DIR = path.join(process.cwd(), 'bin/release/');
export const EXECUTABLE_PATH_WIN = path.join(RELEASE_DIR, 'cyberdeck.exe');
export const EXECUTABLE_PATH_LINUX = path.join(RELEASE_DIR, 'cyberdeck');
export const EXECUTABLE_PATH_MACOS = path.join(RELEASE_DIR, 'cyberdeck');

export const BLOB_PATH = path.join(process.cwd(), 'bin/cyberdeck-sea.blob');
export const NODE_SEA_FUSE = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';

export const archiveRelease = async (
  binaryPath: string,
  osName: 'linux' | 'macos' | 'win',
  version: string
): Promise<void> => {
  const archiveFileName = `cyberdeck_${osName}_${version.replaceAll('.', '_')}.7z`;
  const archivePath = path.join(RELEASE_DIR, archiveFileName);

  let archiveFinished = false;
  Seven.add(archivePath, binaryPath)
    .on('error', err => {
      console.error(
        chalk.redBright(
          `Error occured while archiving ${osName} release ${binaryPath} to ${archivePath}`
        ),
        err
      );
      actions.setFailed(err.message);
    })
    .on('end', () => {
      archiveFinished = true;
    });

  let done = false;
  while (!done) {
    done = archiveFinished;
    await sleep(1000);
  }

  actions.setOutput('archive_path', archivePath);
  actions.setOutput('release_os', osName);
  actions.setOutput('asset_name', archiveFileName);
  console.log(`Done archiving ${osName} release!`);
};
