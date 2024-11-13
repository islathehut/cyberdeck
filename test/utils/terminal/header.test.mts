import t from 'tap';

import { generateCliHeader } from '../../../src/utils/terminal/header.js';
import { initLogger } from '../../../src/utils/logger.js';

t.beforeEach(async t => {
  await initLogger();
});

t.test('CLI Options - Empty', t => {
  const header = generateCliHeader({});

  t.matchSnapshot(header);
  t.end();
});

t.test('CLI Options - dry === true', t => {
  const header = generateCliHeader({
    dry: true,
  });

  t.matchSnapshot(header);
  t.end();
});

t.test('CLI Options - test === true', t => {
  const header = generateCliHeader({
    test: true,
  });

  t.matchSnapshot(header);
  t.end();
});

t.test('CLI Options - dry === true && test === true', t => {
  const header = generateCliHeader({
    dry: true,
    test: true,
  });

  t.matchSnapshot(header);
  t.end();
});
