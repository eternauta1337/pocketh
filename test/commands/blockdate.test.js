const cli = require('../../src/utils/cli.js');

describe('blockdate command', () => {
  test('Should properly get the date of the first block in mainnet', async () => {
    const result = await cli('blockdate', 'mainnet', '1');
    expect(result.stdout).toContain('Thu Jul 30 2015');
  });
});
