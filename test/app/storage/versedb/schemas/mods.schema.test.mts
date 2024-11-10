import t from 'tap';

import { generateTestDataDir } from '../../../../testUtils/test-utils.js';
import { generateFakeMod } from '../../../../testUtils/schema.helper.js';
import { InstallStatus } from '../../../../../src/app/types/types.js';

t.beforeEach(async t => {
  await generateTestDataDir(t);
});

t.test('Get Mods schema and validate basic functionality', async t => {
  const { default: Mods } = await import(
    '../../../../../src/app/storage/versedb/schemas/mods.schema.js'
  );
  await Mods?.load();

  const newData = generateFakeMod();
  await Mods?.add(newData);
  const result = {
    acknowledged: true,
    message: 'Found data matching your query.',
    results: newData,
  };

  t.same(
    await Mods?.find({ uuid: newData.uuid }),
    result,
    'Should roughly match the expected result'
  );
  t.end();
});

t.test('Validate loaded data', async t => {
  const { default: Mods } = await import(
    '../../../../../src/app/storage/versedb/schemas/mods.schema.js'
  );
  await Mods?.load();

  const result = {
    acknowledged: true,
    message: 'Found data matching your query.',
    results: {
      uuid: 'c32ac778-99a7-4963-b853-10a190dcd09b',
      status: 'INSTALLED',
      checksum: '22e2b4b8ffcd65b30ec621d9395059a5',
      path: '/Users/isla/.cyberdeck/mods/test_mod2.zip',
      filename: 'test_mod2.zip',
      name: 'Test Mod 2 (Main)',
      blockUuid: '30e820af-fa9f-4e72-b47b-bf967e11e027',
      createdAt: 1730397825812,
      modifiedAt: 1730407346753,
      copyOverrides: [],
      installedAt: 1730407346753,
      _id: '42b38V-46648E-2b02eR-2927aS-2206fE',
      skip: false,
      description: 'Main test mod file for mod 2',
      nexusMetadata: null,
    },
  };

  t.match(
    await Mods?.find({ uuid: 'c32ac778-99a7-4963-b853-10a190dcd09b' }),
    result,
    'Should match exactly a mod loaded from a fixture'
  );
  t.end();
});

t.test('Invalid install status value', async t => {
  const { default: Mods } = await import(
    '../../../../../src/app/storage/versedb/schemas/mods.schema.js'
  );
  await Mods?.load();

  const newData = generateFakeMod({
    // @ts-expect-error
    status: 'foobar',
  });

  try {
    await Mods?.add(newData);
    t.fail(); // we shouldn't get here
  } catch (e) {
    t.match(
      (e as any).status,
      `'status' must be of type 'InstallStatus'`,
      'Should have correct validation message'
    );
  }

  t.end();
});
