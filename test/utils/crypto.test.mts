import t from 'tap';

import { generateChecksum } from '../../src/utils/crypto.js';

t.test('Checksum of string', async t => {
  const input = 'foobar';
  const output = '3858f62230ac3c915f300c664312c63f';
  t.match(generateChecksum(input), output);
});

t.test('Checksum of Uint8Array', async t => {
  const input = new Uint8Array([1, 2, 3, 4, 5]);
  const output = '7cfdd07889b3295d6a550914ab35e068';
  t.match(generateChecksum(input), output);
});

t.test('Checksum of DataView', async t => {
  const array = [1, 2, 3, 4, 5];
  const arrayBuffer = new ArrayBuffer(array.length * 5); // 4 bytes per integer
  const input = new DataView(arrayBuffer);

  const output = 'd28c293e10139d5d8f6e4592aeaffc1b';
  t.match(generateChecksum(input), output);
});