const cli = require('../utils/cli.js');

describe('selectors command', () => {
  test('Should output help', async () => expect((await cli('selectors', '--help')).code).toBe(0));
  test('Should produce an expected selector from a know contract', async () => {
    const result = await cli('selectors', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`0x3fa4f245: value()`);
  });
});
