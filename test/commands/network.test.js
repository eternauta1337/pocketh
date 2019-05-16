const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('transaction command', () => {
  test('Should properly return info for mainnet', async () => {
    const result = await cli(
      'network', 
      'mainnet'
    );
    expect(result.stdout).toContain(`mainnet: {
  "latestBlock"`);
  });
});
