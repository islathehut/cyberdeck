import t from 'tap';
import { sleep } from '../../src/utils/util.js';
import { initLogger } from '../../src/utils/logger.js';

t.beforeEach(async t => {
  await initLogger();
});
/**
 * getOsFamily
 */

t.test('Returns `Windows` when process.env is win32', async t => {
  t.intercept(process, 'platform', { value: 'win32' });
  const { getOSFamily } =
    await t.mockImport<typeof import('../../src/utils/util.js')>('../../src/utils/util.js');
  t.equal(getOSFamily(), 'Windows');
  t.end();
});

t.test('Returns `Unix` when process.env is darwin', async t => {
  t.intercept(process, 'platform', { value: 'darwin' });
  const { getOSFamily } =
    await t.mockImport<typeof import('../../src/utils/util.js')>('../../src/utils/util.js');
  t.equal(getOSFamily(), 'Unix');
  t.end();
});

t.test('Returns `Unix` when process.env is linux', async t => {
  t.intercept(process, 'platform', { value: 'linux' });
  const { getOSFamily } =
    await t.mockImport<typeof import('../../src/utils/util.js')>('../../src/utils/util.js');
  t.equal(getOSFamily(), 'Unix');
  t.end();
});

/**
 * sleep
 */

t.test('Sleep works', async t => {
  const sleepMs = 1_500;
  const elapsedMs = await sleep(sleepMs);
  t.match(
    elapsedMs >= sleepMs && elapsedMs < sleepMs + 200,
    true,
    'Slept for the correct amount of time'
  );
});
