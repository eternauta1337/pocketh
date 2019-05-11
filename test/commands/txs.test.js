const cli = require('../utils/cli.js');

describe('txs command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli(
      'txs', 
      'infura_mainnet',
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      '0x095ea7b3',
      '7729780',
      '7729781'
    );
    expect(result.code).toBe(0);
  });
});
