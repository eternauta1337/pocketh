const cli = require('../utils/cli.js');

describe('members command', () => {
  
  test('Result code should be 0', async () => {
    let result = await cli('members', './test/artifacts/Test.json', '0');
    expect(result.code).toBe(0);
  });
});
