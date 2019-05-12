const cli = require('../utils/cli.js');

describe('hex2dec command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('hex2dec', '0x2a');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('hex2dec', '0x2a');
    expect(result.stdout).toContain('42');
  });
});
