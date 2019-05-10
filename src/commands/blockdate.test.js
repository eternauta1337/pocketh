const cli = require('../utils/cli.js');

test('Result should be 0', async () => {
  let result = await cli('blockdate', 'infura_mainnet', '0');
  expect(result.code).toBe(0);
});
