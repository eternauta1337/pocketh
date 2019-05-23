const cli = require('../../src/utils/cli.js');

describe('hex2uint command', () => {
  test('Should properly convert a small number to hex', async () => {
    const result = await cli('hex2uint', '0x2a');
    expect(result.stdout).toContain('42');
  });
});
