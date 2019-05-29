const cli = require('../../src/utils/cli.js');

describe('selectors command', () => {

  test('Should produce expected selectors from known contract artifacts', async () => {
    const result = await cli('selectors', 'test/artifacts/Test.json');
    expect(result.stdout).toContain(`0x3fa4f245: value()`);
    expect(result.stdout).toContain(`0x5dce0fa6: granparent_value()`);
    expect(result.stdout).toContain(`0xd8175b14: parent1_value()`);
  });

  test('Should produce expected selectors from a known solidity file', async () => {
    const result = await cli('selectors', 'test/contracts/Test.sol');
    expect(result.stdout).toContain(`0x3fa4f245: value()`);
    expect(result.stdout).toContain(`0x5dce0fa6: granparent_value()`);
    expect(result.stdout).toContain(`0xd8175b14: parent1_value()`);
  });
});
