const cli = require('../utils/cli.js');

describe('str2hex command', () => {
  test('Should properly translate "Hello" to hex', async () => {
    const result = await cli('str2hex', 'Hello');
    expect(result.stdout).toContain('0x48656c6c6f');
  });
});
