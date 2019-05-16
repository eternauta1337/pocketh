const cli = require('../utils/cli.js');

describe('hex2dec command', () => {
  test('Should properly convert a small number to hex', async () => {
    const result = await cli('hex2dec', '0x2a');
    expect(result.stdout).toContain('42');
  });
});
