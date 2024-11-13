import t from 'tap';
import ansiRegex from 'ansi-regex';

import { generateTestDataDir } from '../../testUtils/test-utils.js';
import { nodeConsole } from '../../../src/utils/logger.js';
import { getOSFamily, sleep } from '../../../src/utils/util.js';
import { initLogger } from '../../../src/utils/logger.js';

let tools: typeof import('../../../src/utils/terminal/tools.js');

t.beforeEach(async t => {
  await generateTestDataDir(t);
  await initLogger();
  tools = await import('../../../src/utils/terminal/tools.js');
});

/**
 * spinnerType
 */

t.test('Validate correct spinner type is selected on Windows', t => {
  t.match(tools.spinnerType('Windows'), 'line', 'Windows uses `line` spinner type');
  t.end();
});

t.test('Validate correct spinner type is selected on Unix', t => {
  t.match(tools.spinnerType('Unix'), 'dots', 'Unix uses `dots` spinner type');
  t.end();
});

/**
 * promiseWithSpinner
 */

t.test('Validate spinner type', async t => {
  const output = 'testing spinner type';
  const logs = t.capture(process.stderr, 'write', nodeConsole.log);

  const successfulPromise = async () => {
    await sleep(500);
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

  const firstLog = spinnerLogs[0].args[0].toString();
  t.match(
    firstLog,
    getOSFamily() === 'Windows' ? '-' : '⠋',
    'Spinner is of the correct form for this OS'
  );
  t.end();
});

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
  t.notMatch(finalLog, null, 'Log string should be non-null');
  t.match(
    finalLog,
    new RegExp('^.*✔.*Test passed!.*(20[0-9]{2}ms).*'),
    'Should match the test string'
  );

  t.match(ansiRegex().test(finalLog ?? ''), true, 'Should have ANSI color codes');
  const expectedAnsiCodesWindows = [
    '\u001b[32m',
    '\u001b[39m',
    '\u001b[35m',
    '\u001b[39m',
    '\u001b[32m',
    '\u001b[39m',
  ];
  const expectedAnsiCodesUnix = [
    '\x1B[32m',
    '\x1B[39m',
    '\x1B[35m',
    '\x1b[39m',
    '\x1B[32m',
    '\x1B[39m',
  ];
  t.matchOnly(
    (finalLog ?? '').match(ansiRegex()),
    getOSFamily() === 'Windows' ? expectedAnsiCodesWindows : expectedAnsiCodesUnix,
    'Should have the expected ANSI color escape codes'
  );

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
  t.notMatch(finalLog, null, 'Log string should be non-null');
  t.match(
    finalLog,
    new RegExp('^.*✖.*Test failed!.*(20[0-9]{2}ms).*'),
    'Should match the test string'
  );

  t.match(ansiRegex().test(finalLog ?? ''), true, 'Should have ANSI color codes');
  const expectedAnsiCodesWindows = [
    '\u001b[31m',
    '\u001b[39m',
    '\u001b[31m',
    '\u001b[39m',
    '\u001b[33m',
    '\u001b[39m',
  ];
  const expectedAnsiCodesUnix = [
    '\x1B[31m',
    '\x1B[39m',
    '\x1B[31m',
    '\x1b[39m',
    '\x1B[33m',
    '\x1B[39m',
  ];
  t.matchOnly(
    (finalLog ?? '').match(ansiRegex()),
    getOSFamily() === 'Windows' ? expectedAnsiCodesWindows : expectedAnsiCodesUnix,
    'Should have the expected ANSI color escape codes'
  );

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
