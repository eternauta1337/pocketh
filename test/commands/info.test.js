const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('info command', () => {
  test('Should output help', async () => expect((await cli('info', '--help')).code).toBe(0));
  test('Should properly return info for mainnet', async () => {
    const result = await cli(
      'info', 
      'mainnet'
    );
    expect(result.stdout).toContain(`latestBlock`);
  });
});
