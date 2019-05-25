const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('getcode command', () => {
  test('Should output help', async () => expect((await cli('getcode', '--help')).code).toBe(0));
  test('Should produce appropriate opcode output', async () => {
    const result = await cli('getcode', '0x06012c8cf97bead5deae237070f9587f8e7a266d');
    expect(result.stdout).toContain(`contract KittyCore is KittyMinting`);
  });
});
