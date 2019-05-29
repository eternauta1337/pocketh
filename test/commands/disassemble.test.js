const cli = require('../../src/utils/cli.js');

describe('disassemble command', () => {

  test('Should produce expected opcode output from precompiled artifacts', async () => {
    const result = await cli('disassemble', 'test/artifacts/Test.json');
    expect(result.stdout).toContain(`75 \{0x63\} [c127, r87] PUSH4 0xf0686273 (dec 4033372787)`);
    expect(result.stdout).toContain(`76 \{0x14\} [c132, r92] EQ`);
    expect(result.stdout).toContain(`77 \{0x61\} [c133, r93] PUSH2 0x010d (dec 269)`);
    expect(result.stdout).toContain(`258 {0x5b} [c366, r326] JUMPDEST`);
  });

  test('Should produce expected opcode output from a known solidity file', async () => {
    const result = await cli('disassemble', 'test/contracts/Test.sol');
    expect(result.stdout).toContain(`75 \{0x63\} [c127, r87] PUSH4 0xf0686273 (dec 4033372787)`);
    expect(result.stdout).toContain(`76 \{0x14\} [c132, r92] EQ`);
    expect(result.stdout).toContain(`77 \{0x61\} [c133, r93] PUSH2 0x010d (dec 269)`);
    expect(result.stdout).toContain(`258 {0x5b} [c366, r326] JUMPDEST`);
  });
});
