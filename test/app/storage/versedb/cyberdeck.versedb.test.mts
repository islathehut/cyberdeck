import t from 'tap';

import { generateTestDataDir } from '../../../testUtils/test-utils.js';
import { initLogger } from '../../../../src/utils/logger.js';

t.beforeEach(async t => {
  await generateTestDataDir(t);
  await initLogger();
});

t.test('Get DB and validate basic functionality', async t => {
  const { db } = await import('../../../../src/app/storage/versedb/cyberdeck.versedb.js');

  t.match(db.dataPath.startsWith(t.testdirName), true, 'has correct dir path');

  const dataname = 'foobar';
  const newData = {
    foo: 1234,
    bar: 'baz',
  };
  await db.add(dataname, newData);
  const result = {
    acknowledged: true,
    message: 'Found data matching your query.',
    results: newData,
  };
  t.same(
    await db.find(dataname, { foo: 1234 }),
    result,
    'Should roughly match the expected result'
  );
  t.end();
});
