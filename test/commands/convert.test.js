const cli = require('../utils/cli.js');

describe('convert command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('convert');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('convert', '1', 'wei', 'ether');
    expect(result.stdout).toContain('0.000000000000000001');
  });
});
