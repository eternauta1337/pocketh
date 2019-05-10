const cli = require('../utils/cli.js');

test('Result should be 0', async () => {
  let result = await cli('hex2str', '0x48656c6c6f');
  expect(result.code).toBe(0);
});
