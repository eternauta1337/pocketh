const cli = require('../utils/cli.js');

describe('str2hex command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('str2hex', 'Hello');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('str2hex', 'Hello');
    expect(result.stdout).toContain('0x48656c6c6f');
  });
});
