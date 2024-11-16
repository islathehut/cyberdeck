import fs from 'node:fs/promises';
import child from 'node:child_process';
import type { PathLike } from 'node:fs';

import { archiveRelease, BLOB_PATH, EXECUTABLE_PATH_LINUX, NODE_SEA_FUSE } from './base_release.js';

const generateExecutable = async (): Promise<void> => {
  await fs.copyFile(process.execPath, EXECUTABLE_PATH_LINUX as PathLike);
};

const injectExecutable = async (): Promise<void> => {
  child.execSync(
    `pnpx postject ${EXECUTABLE_PATH_LINUX} NODE_SEA_BLOB ${BLOB_PATH} --sentinel-fuse ${NODE_SEA_FUSE}`
  );
};

const packageRelease = async (): Promise<void> => {
  console.log(`Generating Linux executable`);
  await generateExecutable();
  console.log(`Injecting code bundle into executable`);
  await injectExecutable();
  console.log(`Creating archive`);
  await archiveRelease(EXECUTABLE_PATH_LINUX, 'linux');
};

packageRelease()
  .then(() => {
    console.log(`Finished packaging Linux release!`);
    process.exit(0);
  })
  .catch(e => {
    console.error(`Error occurred while packaging Linux release!`, e);
    process.exit(1);
  });
