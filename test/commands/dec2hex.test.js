const cli = require('../utils/cli.js');

describe('dec2hex command', () => {
  test('Should properly convert a small hex', async () => {
    const result = await cli('dec2hex', '42');
    expect(result.stdout).toContain('0x2a');
  });
});
