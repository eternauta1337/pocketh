const cli = require('../utils/cli.js');

test('Result should be 0', async () => {
  let result = await cli('str2hex', 'Hello');
  expect(result.code).toBe(0);
});
