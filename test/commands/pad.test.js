const cli = require('../utils/cli.js');

describe('pad command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('pad', '0x2a');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('pad', '0x2a');
    expect(result.stdout).toContain('0x000000000000000000000000000000000000000000000000000000000000002a');
  });
});
