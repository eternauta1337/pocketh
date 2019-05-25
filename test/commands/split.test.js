const cli = require('../utils/cli.js');

describe('split command', () => {
  test('Should output help', async () => expect((await cli('split', '--help')).code).toBe(0));
  test('Should split contracts into the expected number of contracts', async () => {
    const result = await cli('split', 'test/contracts/KittyCore.sol', '/tmp/');
    expect(result.stdout).toContain(`into 16 files`);
  });
});
