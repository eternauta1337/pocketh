const cli = require('../../src/utils/cli.js');

describe('split command', () => {
  test('Should split contracts into the expected number of contracts', async () => {
    const result = await cli('split', 'test/contracts/KittyCore.sol', '/tmp/');
    expect(result.stdout).toContain(`into 16 files`);
  });
});
