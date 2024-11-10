import t from 'tap';

import { generateCliHeader } from '../../../src/utils/terminal/header.js';
import { nodeConsole } from '../../../src/utils/logger.js';

t.test('CLI Options - Empty', t => {
  const header = generateCliHeader({});
  nodeConsole.log(header);

  t.matchSnapshot(header);
  t.end();
});

t.test('CLI Options - dry === true', t => {
  const header = generateCliHeader({
    dry: true,
  });
  nodeConsole.log(header);

  t.matchSnapshot(header);
  t.end();
});

t.test('CLI Options - test === true', t => {
  const header = generateCliHeader({
    test: true,
  });
  nodeConsole.log(header);

  t.matchSnapshot(header);
  t.end();
});

t.test('CLI Options - dry === true && test === true', t => {
  const header = generateCliHeader({
    dry: true,
    test: true,
  });
  nodeConsole.log(header);

  t.matchSnapshot(header);
  t.end();
});
