const cli = require('../../src/utils/cli.js');

describe('int2hex command', () => {
  test('Should properly convert a small hex', async () => {
    const result = await cli('int2hex', '-n', '42');
    expect(result.stdout).toContain('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6');
  });
});
