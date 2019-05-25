const cli = require('../../src/utils/cli.js');

describe('pad command', () => {
  test('Should output help', async () => expect((await cli('pad', '--help')).code).toBe(0));
  test('Sould properly pad a small hex', async () => {
    const result = await cli('pad', '0x2a');
    expect(result.stdout).toContain('0x000000000000000000000000000000000000000000000000000000000000002a');
  });
});
