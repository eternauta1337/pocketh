const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('txs command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli(
      'txs', 
      'infura_mainnet',
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      '0x095ea7b3',
      '7729780',
      '7729781',
      '1'
    );
    expect(result.code).toBe(0);
  });

  test('Result stdout should contain', async () => {
    const result = await cli(
      'txs', 
      'infura_mainnet',
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      '0xa9059cbb',
      '7729780',
      '7729790',
      '1'
    );
    expect(result.stdout).toContain(`Found 27 transactions`);
  });
});
