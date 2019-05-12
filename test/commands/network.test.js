const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('transaction command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli(
      'network', 
      'mainnet'
    );
    expect(result.code).toBe(0);
  });

  test('Result stdout should contain', async () => {
    const result = await cli(
      'network', 
      'mainnet'
    );
    expect(result.stdout).toContain(`mainnet: {
  "latestBlock"`);
  });
});
