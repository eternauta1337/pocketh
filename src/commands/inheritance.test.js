const cli = require('../utils/cli.js');

test('Result should be 0', async () => {
  let result = await cli('inheritance', './build/contracts/Test.json', '0');
  expect(result.code).toBe(0);
});
