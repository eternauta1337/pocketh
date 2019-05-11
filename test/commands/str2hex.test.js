const cli = require('../utils/cli.js');

describe('str2hex command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('str2hex', 'Hello');
    expect(result.code).toBe(0);
  });
});
