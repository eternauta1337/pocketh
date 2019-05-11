const cli = require('../utils/cli.js');

describe('selectors command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('selectors', './test/artifacts/Test.json');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('selectors', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`0x3fa4f245 value()
0x5dce0fa6 granparent_value()
0x11ebe4e4 parent2_value(uint256)
0xd8175b14 parent1_value()
0x29e99f07 test(uint256)`);
  });
});
