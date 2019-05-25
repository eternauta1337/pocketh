const cli = require('../../src/utils/cli.js');

describe('getcode command', () => {
  test('Should produce appropriate opcode output', async () => {
    const result = await cli('getcode', '0x06012c8cf97bead5deae237070f9587f8e7a266d');
    expect(result.stdout).toContain(`contract KittyCore is KittyMinting`);
  });
});
