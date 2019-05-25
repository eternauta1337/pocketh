const cli = require('../utils/cli.js');

describe('selector command', () => {
  test('Should output help', async () => expect((await cli('selector', '--help')).code).toBe(0));
  test('Should produce an expected selector', async () => {
    const result = await cli('selector', `'value()'`);
    expect(result.stdout).toContain(`0x3fa4f245`);
  });
});
