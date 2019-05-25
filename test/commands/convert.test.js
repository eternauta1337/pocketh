const cli = require('../../src/utils/cli.js');

describe('convert command', () => {
  test('Should properly convert wei to ether', async () => {
    const result = await cli('convert', '1', 'wei', 'ether');
    expect(result.stdout).toContain('0.000000000000000001');
  });
});
