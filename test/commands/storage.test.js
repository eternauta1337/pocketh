const cli = require('../../src/utils/cli.js');
jest.setTimeout(60000);

describe('storage command', () => {
  test('Should output help', async () => expect((await cli('storage', '--help')).code).toBe(0));
  test('Should properly retrieve storage for a known contract deployed in ropsten', async () => {
    const result = await cli('storage', 'ropsten', '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b', '1');
    expect(result.stdout).toContain(`0x00000000000000000000000059b92d9a0000000000000000000000000000429f`);
  });
});
