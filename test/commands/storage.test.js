const cli = require('../utils/cli.js');

describe('storage command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('storage', 'ropsten', '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b', '0');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('storage', 'ropsten', '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b', '1');
    expect(result.stdout).toContain(`0x00000000000000000000000059b92d9a0000000000000000000000000000429f`);
  });
});
