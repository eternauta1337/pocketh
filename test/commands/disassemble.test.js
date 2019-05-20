const cli = require('../utils/cli.js');

describe('disassemble command', () => {
  test('Should produce appropriate opcode output', async () => {
    const result = await cli('disassemble', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`258 {0x5b} [c366, r326] JUMPDEST`);
  });
});
