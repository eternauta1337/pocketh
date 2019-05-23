const cli = require('../../src/utils/cli.js');
jest.setTimeout(60000);

describe('info command', () => {
  test('Should properly return info for mainnet', async () => {
    const result = await cli(
      'info', 
      'mainnet'
    );
    expect(result.stdout).toContain(`latestBlock`);
  });
});
