const cli = require('../utils/cli.js');
jest.setTimeout(60000);

test('Result should be 0', async () => {
  let result = await cli(
    'pastevents', 
    'infura_mainnet',
    './build/other_contracts/Test.json', 
    '0x06012c8cf97bead5deae237070f9587f8e7a266d',
    'Transfer',
    '7729780',
    '7729781',
    '1'
  );
  expect(result.code).toBe(0);
});
