const cli = require('../utils/cli.js');

describe('disassemble command', () => {
  
  test('Result code should be 0', async () => {
    let result = await cli('disassemble', './test/artifacts/Test.json', '0');
    expect(result.code).toBe(0);
  });
});
