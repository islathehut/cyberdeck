import { Test } from 'tap';

export const sleep = async (timeMs = 1000) => {
  await new Promise<void>(resolve =>
    setTimeout(() => {
      resolve();
    }, timeMs)
  );
};

export const generateTestDataDir = async (t: Test) => {
  const testDirPath = t.testdir();
  process.env.CYBERDECK_DIR_BASE_PATH = testDirPath;
  const { initDirectoryStructure } = await import('../../src/utils/dir.js');
  await initDirectoryStructure();
};
