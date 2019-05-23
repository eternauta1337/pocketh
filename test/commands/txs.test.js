const cli = require('../../src/utils/cli.js');
jest.setTimeout(60000);

describe('txs command', () => {
  test('Should find a know number of transactions from a known contract deployed in mainnet', async () => {
    const result = await cli(
      'txs', 
      'mainnet',
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      '0xa9059cbb',
      '7729780',
      '7729790',
      '10'
    );
    expect(result.stdout).toContain(`Found 27 transactions`);
  });
});
