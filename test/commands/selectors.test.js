const cli = require('../utils/cli.js');

describe('selectors command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('selectors', './test/artifacts/Test.json');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('selectors', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`0x3fa4f245 value()`);
  });
});
