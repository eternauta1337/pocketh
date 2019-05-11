const cli = require('../utils/cli.js');

describe('txsfast command', () => {
  
  test('Result should be 0', async () => {
    let result = await cli(
      'txs', 
      'development',
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      '0x095ea7b3',
      '0',
      '1',
      '1'
    );
    expect(result.code).toBe(0);
  });
});
