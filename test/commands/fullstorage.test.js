const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('fullstorage command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('fullstorage', 'ropsten', 'test/artifacts/Storage.json', '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b');
    expect(result.code).toBe(0);
  });

  test('Result stdout should contain some of the expected output', async () => {
    const result = await cli('fullstorage', 'ropsten', 'test/artifacts/Storage.json', '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b');
    expect(result.stdout).toContain(`uint256 internal storeduint1
  size: 32 bytes
  slot: 0
  word: 000000000000000000000000000000000000000000000000000000000000000f
  subword: 000000000000000000000000000000000000000000000000000000000000000f
  value: 15
uint128 internal investmentsLimit
  size: 16 bytes
  slot: 1
  word: 00000000000000000000000059b92d9a0000000000000000000000000000429f
  subword: 0000000000000000000000000000429f
  value: 17055
uint32 internal investmentsDeadlineTimeStamp
  size: 4 bytes
  slot: 1
  word: 00000000000000000000000059b92d9a0000000000000000000000000000429f
  subword: 59b92d9a
  value: 1505308058`);
  });
});
