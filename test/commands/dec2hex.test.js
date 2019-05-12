const cli = require('../utils/cli.js');

describe('dec2hex command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('dec2hex', '42');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('dec2hex', '42');
    expect(result.stdout).toContain('0x2a');
  });
});
