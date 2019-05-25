const cli = require('../../src/utils/cli.js');

describe('liststorage command', () => {
  test('Should properly read storage from a contract deployed in ropsten', async () => {
    const result = await cli(
      'liststorage', 
      'ropsten', 
      'test/artifacts/Storage.json', 
      '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b',
      '--disable-colors'
    );
    expect(result.stdout).toContain(`value: test1`);
    expect(result.stdout).toContain(`value: 1505308058`);
    expect(result.stdout).toContain(`value: 15`);
  });
});
