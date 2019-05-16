const cli = require('../utils/cli.js');

describe('pad command', () => {
  test('Sould properly pad a small hex', async () => {
    const result = await cli('pad', '0x2a');
    expect(result.stdout).toContain('0x000000000000000000000000000000000000000000000000000000000000002a');
  });
});
