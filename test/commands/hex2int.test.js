const cli = require('../../src/utils/cli.js');

describe('hex2int command', () => {
  test('Should properly convert a small number to hex', async () => {
    const result = await cli('hex2int', '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6');
    expect(result.stdout).toContain('-42');
  });
});
