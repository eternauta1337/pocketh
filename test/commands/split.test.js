const cli = require('../../src/utils/cli.js');

describe('split command', () => {
  test('Should output help', async () => expect((await cli('split', '--help')).code).toBe(0));
  test('Should split Kitties.sol into the expected number of contracts', async () => {
    const result = await cli('split', 'test/contracts/Kitties.sol');
    expect(result.stdout).toContain(`Split file test/contracts/Kitties.sol into 16 files`);
  });
});
