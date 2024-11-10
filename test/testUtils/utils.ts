import { Test } from 'tap';

import * as fs from 'node:fs/promises';
import * as path from 'path';

export const sleep = async (timeMs = 1000) => {
  await new Promise<void>(resolve =>
    setTimeout(() => {
      resolve();
    }, timeMs)
  );
};

export const generateTestDataDir = async (t: Test) => {
  const testDirPath = t.testdir({
    '.cyberdeck': {
      versedb: {
        data: {
          'blocks.json': await fs.readFile(
            path.join(process.cwd(), 'test/fixtures/blocks.fixture.json')
          ),
          'mods.json': await fs.readFile(
            path.join(process.cwd(), 'test/fixtures/mods.fixture.json')
          ),
        },
      },
    },
  });
  process.env.CYBERDECK_DIR_BASE_PATH = testDirPath;
  const { initDirectoryStructure } = await import('../../src/utils/dir.js');
  await initDirectoryStructure();
};
