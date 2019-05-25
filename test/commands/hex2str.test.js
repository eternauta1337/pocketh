const cli = require('../../src/utils/cli.js');

describe('hex2uint command', () => {

  test('Should properly convert "Hello"', async () => {
    const result = await cli('hex2str', '0x48656c6c6f');
    expect(result.stdout).toContain('Hello');
  });

  test('Should complain if an invalid hex number is provided', async () => {
    expect((await cli('hex2uint', 'spongy')).code).toBe(1);
    expect((await cli('hex2uint', '0.1')).code).toBe(1);
    expect((await cli('hex2uint', '0xqqq')).code).toBe(1);
  });
});
