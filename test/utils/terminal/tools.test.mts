import t from 'tap';

import { generateTestDataDir, sleep } from '../../testUtils/test-utils.js';
import { nodeConsole } from '../../../src/utils/logger.js';
import { getOSFamily } from '../../../src/utils/util.js';

let tools: typeof import('../../../src/utils/terminal/tools.js');

t.beforeEach(async t => {
  await generateTestDataDir(t);
  tools = await import('../../../src/utils/terminal/tools.js');
});

/**
 * promiseWithSpinner
 */

t.test('Successful promise', async t => {
  const output = 'successful test output';
  const logs = t.capture(process.stderr, 'write', nodeConsole.log);

  const successfulPromise = async () => {
    await sleep(2000);
    return output;
  };
  const result = await tools.promiseWithSpinner(
    successfulPromise,
    'Running test...',
    'Test passed!',
    'Test failed!'
  );
  t.match(result, output);

  const spinnerLogs = logs();
  t.matchSnapshot(
    spinnerLogs.slice(0, -2).map(log => log.args[0]),
    `promiseWithSpinner - Success - ${getOSFamily()}`
  );

  const finalLog = spinnerLogs.pop()?.args[0].toString();
  const matchText = new RegExp(
    getOSFamily() === 'Unix'
      ? '\\\x1B\\[32m✔\\\x1B\\[39m \\\x1B\\[35mTest passed!\\\x1B\\[39m \\\x1B\\[32m\\(200[0-9]ms\\)\\\x1B\\[39m\\\n'
      : '\\u001b\\[32m✔\\\u001b\\[39m \\\u001b\\[35mTest passed!\\\u001b\\[39m \\\u001b\\[32m\\(200[0-9]ms\\)\\\u001b\\[39m\\\n'
  );
  t.match(finalLog, matchText, 'Should match the test string');

  t.end();
});

t.test('Failed promise', async t => {
  const output = null;
  const logs = t.capture(process.stderr, 'write', nodeConsole.log);
  const failedPromise = async () => {
    await sleep(2000);
    throw new Error(`Whoops!`);
  };
  const result = await tools.promiseWithSpinner(
    failedPromise,
    'Running test...',
    'Test passed!',
    'Test failed!'
  );
  t.match(result, output);

  const spinnerLogs = logs();
  t.matchSnapshot(
    spinnerLogs.slice(0, -2).map(log => log.args[0]),
    `promiseWithSpinner - Failure - ${getOSFamily()}`
  );

  const finalLog = spinnerLogs.pop()?.args[0].toString();
  const matchText = new RegExp(
    getOSFamily() === 'Unix'
      ? '\\\x1B\\[31m✖\\\x1B\\[39m \\\x1B\\[31mTest failed!\\\x1B\\[39m \\\x1B\\[33m\\(200[0-9]ms\\)\\\x1B\\[39m\\n'
      : '\\\u001b\\[31m✖\\\u001b\\[39m \\\u001b\\[31mTest failed!\\\u001b\\[39m \\\u001b\\[33m\\(200[0-9]ms\\)\\\u001b\\[39m\\\n'
  );
  t.match(finalLog, matchText, 'Should match the test string');

  t.end();
});

/**
 * wrapTextWithPrefix
 */

t.test('Default length - No wrap', t => {
  const input = 'foobar';
  const prefix = '>>>>>>>> ';
  const output = 'foobar';
  t.match(tools.wrapTextWithPrefix(input, prefix), output);
  t.end();
});

t.test('Default length - Wraps', t => {
  const input =
    'foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar';
  const prefix = '>>>>>>>> ';
  const output = `foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar
>>>>>>>> foobar foobar`;
  t.match(tools.wrapTextWithPrefix(input, prefix), output);
  t.end();
});

t.test('Default length - Wraps and handles newlines in input', t => {
  const input =
    'foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar\nfoobar foobar';
  const prefix = '>>>>>>>> ';
  const output = `foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar
>>>>>>>> 
>>>>>>>> foobar foobar`;
  t.match(tools.wrapTextWithPrefix(input, prefix), output);
  t.end();
});

t.test('Custom length - No wrap with one word and short length', t => {
  const input = 'foobar';
  const prefix = '>>>>>>>> ';
  const output = 'foobar';
  t.match(tools.wrapTextWithPrefix(input, prefix, 1), output);
  t.end();
});

t.test('Custom length - Wraps', t => {
  const input =
    'foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar';
  const prefix = '>>>>>>>> ';
  const output = `foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar`;
  t.match(tools.wrapTextWithPrefix(input, prefix, 15), output);
  t.end();
});

t.test('Custom length - Wraps and handles newlines in input', t => {
  const input =
    'foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar foobar\nfoobar foobar';
  const prefix = '>>>>>>>> ';
  const output = `foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> foobar foobar
>>>>>>>> 
>>>>>>>> foobar foobar`;
  t.match(tools.wrapTextWithPrefix(input, prefix, 15), output);
  t.end();
});
