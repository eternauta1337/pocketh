const cli = require('../utils/cli.js');

describe('hex2int command', () => {
  test('Should output help', async () => expect((await cli('hex2int', '--help')).code).toBe(0));
  test('Should properly convert a small number to hex', async () => {
    const result = await cli('hex2int', '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6');
    expect(result.stdout).toContain('-42');
  });
});
