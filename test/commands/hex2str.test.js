const cli = require('../../src/utils/cli.js');

describe('hex2str command', () => {
  test('Should output help', async () => expect((await cli('hex2str', '--help')).code).toBe(0));
  test('Should properly convert "Hello"', async () => {
    const result = await cli('hex2str', '0x48656c6c6f');
    expect(result.stdout).toContain('Hello');
  });
});
