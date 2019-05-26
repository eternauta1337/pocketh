const cli = require('../../src/utils/cli.js');

describe('liststorage command', () => {

  test('Should properly read storage from a contract deployed in ropsten', async () => {
    const result = await cli(
      'liststorage', 
      'ropsten', 
      'test/contracts/Storage.sol', 
      '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b',
      '--disable-colors'
    );
    expect(result.stdout).toContain(`value: 15`);
    expect(result.stdout).toContain(`value: 17055`);
    expect(result.stdout).toContain(`value: 1505308058`);
    expect(result.stdout).toContain(`value: test1`);
    expect(result.stdout).toContain(`value: test1236`);
    expect(result.stdout).toContain(`lets string something`);
  });

  test('Should complain when an invalid contract address is provided', async () => {
    const result = await cli('liststorage', 'localhost', 'test/artifacts/Storage.json', '0x123');
    expect(result.code).toBe(1);
  });
});
