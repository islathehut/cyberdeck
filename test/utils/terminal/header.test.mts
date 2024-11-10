import t from 'tap';

import { generateCliHeader } from '../../../src/utils/terminal/header.js';

t.matchSnapshot(generateCliHeader({}), 'CLI Options - Empty');
t.matchSnapshot(
  generateCliHeader({
    dry: true,
  }),
  'CLI Options - dry === true'
);
t.matchSnapshot(
  generateCliHeader({
    test: true,
  }),
  'CLI Options - test === true'
);
t.matchSnapshot(
  generateCliHeader({
    dry: true,
    test: true,
  }),
  'CLI Options - dry === true && test === true'
);
