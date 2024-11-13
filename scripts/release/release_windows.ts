import fs from 'node:fs/promises';
import child from 'node:child_process';
import type { PathLike } from 'node:fs';

import { BLOB_PATH, EXECUTABLE_PATH_WIN, NODE_SEA_FUSE } from './base_release.js';

/**
 * Searches the installed Windows SDKs for the most recent signtool.exe version
 * Taken from https://github.com/dlemstra/code-sign-action
 * @returns Path to most recent signtool.exe (x86 version)
 */
const getSigntoolLocation = async (): Promise<string> => {
  const windowsKitsFolder = 'C:/Program Files (x86)/Windows Kits/10/bin/';
  const folders = await fs.readdir(windowsKitsFolder);
  let fileName = '';
  let maxVersion = 0;
  for (const folder of folders) {
    if (!folder.endsWith('.0')) {
      continue;
    }
    const folderVersion = parseInt(folder.replace(/\./g, ''));
    if (folderVersion > maxVersion) {
      const signtoolFilename = `${windowsKitsFolder}${folder}/x64/signtool.exe`;
      try {
        const stat = await fs.stat(signtoolFilename);
        if (stat.isFile()) {
          fileName = signtoolFilename;
          maxVersion = folderVersion;
        }
      } catch {
        console.warn('Skipping %s due to error.', signtoolFilename);
      }
    }
  }
  if (fileName === '') {
    throw new Error('Unable to find signtool.exe in ' + windowsKitsFolder);
  }

  console.log(`Signtool location is ${fileName}.`);
  return fileName;
};

const generateExecutable = async (): Promise<void> => {
  await fs.copyFile(process.execPath, EXECUTABLE_PATH_WIN as PathLike);
};

const removeSignature = async (): Promise<void> => {
  const signtoolExePath = await getSigntoolLocation();
  child.execSync(`${signtoolExePath} remove /s ${EXECUTABLE_PATH_WIN}`);
};

const injectExecutable = async (): Promise<void> => {
  child.execSync(
    `pnpx postject ${EXECUTABLE_PATH_WIN} NODE_SEA_BLOB ${BLOB_PATH} --sentinel-fuse ${NODE_SEA_FUSE}`
  );
};

const packageRelease = async (): Promise<void> => {
  console.log(`Generating windows executable`);
  await generateExecutable();
  console.log(`Removing signature`);
  await removeSignature();
  console.log(`Injecting code bundle into executable`);
  await injectExecutable();
};

packageRelease()
  .then(() => {
    console.log(`Finished packaging windows release!`);
    process.exit(0);
  })
  .catch(e => {
    console.error(`Error occurred while packaging windows release!`, e);
    process.exit(1);
  });
