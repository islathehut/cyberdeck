import fs from 'node:fs/promises';
import child from 'node:child_process';
import type { PathLike } from 'node:fs';

import { archiveRelease, BLOB_PATH, EXECUTABLE_PATH_MACOS, NODE_SEA_FUSE } from './base_release.js';

const generateExecutable = async (): Promise<void> => {
  await fs.copyFile(process.execPath, EXECUTABLE_PATH_MACOS as PathLike);
};

const removeSignature = async (): Promise<void> => {
  child.execSync(`codesign --remove-signature ${EXECUTABLE_PATH_MACOS}`);
};

const injectExecutable = async (): Promise<void> => {
  child.execSync(
    `pnpx postject ${EXECUTABLE_PATH_MACOS} NODE_SEA_BLOB ${BLOB_PATH} --sentinel-fuse ${NODE_SEA_FUSE} --macho-segment-name NODE_SEA`
  );
};

const signExecutable = async (): Promise<void> => {
  child.execSync(`codesign --sign - ${EXECUTABLE_PATH_MACOS}`);
};

const packageRelease = async (): Promise<void> => {
  console.log(`Generating MacOS executable`);
  await generateExecutable();
  console.log(`Remove signature`);
  await removeSignature();
  console.log(`Injecting code bundle into executable`);
  await injectExecutable();
  console.log(`Signing executable`);
  await signExecutable();
  console.log(`Creating archive`);
  await archiveRelease(EXECUTABLE_PATH_MACOS, 'macos');
};

packageRelease()
  .then(() => {
    console.log(`Finished packaging MacOS release!`);
    process.exit(0);
  })
  .catch(e => {
    console.error(`Error occurred while packaging MacOS release!`, e);
    process.exit(1);
  });
