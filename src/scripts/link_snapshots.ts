import symlinkDir from 'symlink-dir';
import path from 'path';

import { getOSFamily } from '../utils/util.js';

const runScript = async (): Promise<void> => {
  const outputDir = path.join('./tap-snapshots');
  let inputDir = '';
  switch (getOSFamily()) {
    case 'Windows':
      inputDir = path.join('./tap-snapshots-windows');
      break;
    case 'Unix':
      inputDir = path.join('./tap-snapshots-unix');
      break;
    default:
      throw new Error(`Unknown OS family`);
  }

  console.log(`Symlinking ${inputDir} to ${outputDir}`);
  await symlinkDir(inputDir, outputDir);
};

runScript()
  .then(() => process.exit(0))
  .catch(reason => {
    console.error(`Failed to symlink`, reason);
    process.exit(1);
  });
