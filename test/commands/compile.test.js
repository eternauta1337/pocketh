const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('compile command', () => {
  test('Should output help', async () => expect((await cli('compile', '--help')).code).toBe(0));
  test('Should succesfully compile a contract', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', 'test/artifacts/', '0.5.8');
    expect(result.stdout).toContain('Compiled Test.sol succesfully');
  });
});
