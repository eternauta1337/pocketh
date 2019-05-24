const cli = require('../../src/utils/cli.js');

describe('disassemble command', () => {
  test('Should output help', async () => expect((await cli('disassemble', '--help')).code).toBe(0));
  test('Should produce appropriate opcode output', async () => {
    const result = await cli('disassemble', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`258 {0x5b} [c366, r326] JUMPDEST`);
  });
});
