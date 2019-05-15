const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('compile command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', 'test/artifacts/', '0.5.8');
    expect(result.code).toBe(0);
  });

  test('Result stdout should be correct', async () => {
    const result = await cli('compile', 'test/contracts/Test.sol', 'test/artifacts/', '0.5.8');
    expect(result.stdout).toContain('Compiled Test.sol succesfully');
  });
});
