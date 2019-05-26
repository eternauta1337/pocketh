const globals = require('../../src/globals.js');
const cli = require('../../src/utils/cli.js');
const path = require('path');

describe('program', () => {

  test('Program should throw an error when an unknown command is received', async () => {
    const invalidCommnad = `spongi`;
    const result = await cli(invalidCommnad);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`Invalid command: ${invalidCommnad}`);
  });
});
