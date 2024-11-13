import t from 'tap';

import { generateTestDataDir } from '../../../../testUtils/test-utils.js';
import { generateFakeBlock } from '../../../../testUtils/schema.helper.js';
import { initLogger } from '../../../../../src/utils/logger.js';

t.beforeEach(async t => {
  await generateTestDataDir(t);
  await initLogger();
});

t.test('Get Blocks schema and validate basic functionality', async t => {
  const { default: Blocks } = await import(
    '../../../../../src/app/storage/versedb/schemas/blocks.schema.js'
  );
  await Blocks?.load();

  const newData = generateFakeBlock();
  await Blocks?.add(newData);
  const result = {
    acknowledged: true,
    message: 'Found data matching your query.',
    results: newData,
  };

  t.same(
    await Blocks?.find({ uuid: newData.uuid }),
    result,
    'Should roughly match the expected result'
  );
  t.end();
});

t.test('Validate loaded data', async t => {
  const { default: Blocks } = await import(
    '../../../../../src/app/storage/versedb/schemas/blocks.schema.js'
  );
  await Blocks?.load();

  const result = {
    acknowledged: true,
    message: 'Found data matching your query.',
    results: {
      uuid: '05e0f090-e91f-4b01-9e85-36fa258520c5',
      installed: true,
      installOrder: ['test_mod3.rar', 'test_mod4.7z'],
      createdAt: 1730503449555,
      modifiedAt: 1730525349321,
      installedAt: 1730525349321,
      _id: 'ed030V-2c9ebE-d135fR-0fe91S-cc783E',
    },
  };

  t.match(
    await Blocks?.find({ uuid: '05e0f090-e91f-4b01-9e85-36fa258520c5' }),
    result,
    'Should match exactly a block loaded from a fixture'
  );
  t.end();
});
