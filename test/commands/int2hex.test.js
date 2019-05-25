const cli = require('../../src/utils/cli.js');

describe('int2hex command', () => {

  test('Should properly convert a small negative integer to hex', async () => {
    const result = await cli('int2hex', '-n', '42');
    expect(result.stdout).toContain('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6');
  });

  test('Should properly convert a small positive integer to hex', async () => {
    const result = await cli('int2hex', '42');
    expect(result.stdout).toContain('0x2a');
  });

  test('Should complain if an invalid integer is provided', async () => {
    expect((await cli('int2hex', 'xx')).code).toBe(1);
    expect((await cli('int2hex', '0.1')).code).toBe(1);
  });
});
