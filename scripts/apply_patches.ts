import { execSync } from 'child_process';

import { getOSFamily } from '../src/utils/util.js';

const runScript = async (): Promise<void> => {
  const applyPatchCommands = [
    `patch --forward -p0 node_modules/verse.db/dist/index.js < patch/versedb.patch`,
  ];
  const acceptableFailure = 'Reversed (or previously applied) patch detected!  Skipping patch.';

  switch (getOSFamily()) {
    case 'Windows':
      console.log(`Apply patches using a WSL terminal`);
      for (const applyPatchCommand of applyPatchCommands) {
        try {
          console.log(`Running ${applyPatchCommand}`);
          execSync(`wsl -e ${applyPatchCommand}`);
          console.log(`Patch applied successfully!`);
        } catch (e) {
          if ((e as { stdout: Buffer }).stdout.toString().includes(acceptableFailure)) {
            console.log(`File already patched, skipping...!`);
            continue;
          }
          throw e as Error;
        }
      }
      break;
    case 'Unix':
      console.log(`Apply patches`);
      for (const applyPatchCommand of applyPatchCommands) {
        try {
          console.log(`Running ${applyPatchCommand}`);
          execSync(applyPatchCommand);
          console.log(`Patch applied successfully!`);
        } catch (e) {
          if ((e as { stdout: Buffer }).stdout.toString().includes(acceptableFailure)) {
            console.log(`File already patched, skipping...!`);
            continue;
          }
          throw e as Error;
        }
      }
      break;
    default:
      throw new Error(`Unknown OS family`);
  }
};

runScript()
  .then(() => process.exit(0))
  .catch(reason => {
    console.error(`Failed to apply patches`, reason);
    console.error((reason as { stdout: Buffer }).stdout.toString());
    process.exit(1);
  });
