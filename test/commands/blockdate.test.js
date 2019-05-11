const cli = require('../utils/cli.js');

describe('blockdate command', () => {

  test('Result code should be 0', async () => {
    const result = await cli('blockdate', 'infura_mainnet', '1');
    expect(result.code).toBe(0);
  });

  test.skip('Result stdout for mainnet block 1 should contain "Thu Jul 30 2015"', async () => {
    const result = await cli('blockdate', 'infura_mainnet', '1');
    expect(result.stdout).toContain('Thu Jul 30 2015');
  });
});
