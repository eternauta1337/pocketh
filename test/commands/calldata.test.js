const cli = require('../utils/cli.js');

test('Result should be 0', async () => {
  let result = await cli('calldata', '0xabcabcab');
  expect(result.code).toBe(0);
});
