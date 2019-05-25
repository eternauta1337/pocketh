const cli = require('../../src/utils/cli.js');

describe('hex2int command', () => {

  test('Should properly convert large twos complement hex to a negative integer', async () => {
    const result = await cli('hex2int', '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6');
    expect(result.stdout).toContain('-42');
  });

  test('Should properly convert large twos complement hex to a positive integer', async () => {
    const result = await cli('hex2int', '0x00000000000000000000000000000000000000000000000000000000000007be');
    expect(result.stdout).toContain('1982');
  });

  test('Should complain if an invalid hex number is provided', async () => {
    expect((await cli('hex2int', 'spongy')).code).toBe(1);
    expect((await cli('hex2int', '0.1')).code).toBe(1);
    expect((await cli('hex2int', '0xqqq')).code).toBe(1);
  });
});
