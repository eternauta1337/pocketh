const cli = require('../utils/cli.js');

describe('disassemble command', () => {
  test('Should produce appropriate opcode output', async () => {
    const result = await cli('disassemble', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`171 {0x60} [c253, r213] PUSH1 0x20 (dec 32)
172 {0x01} [c255, r215] ADD
173 {0x91} [c256, r216] SWAP2
174 {0x50} [c257, r217] POP
175 {0x50} [c258, r218] POP
176 {0x60} [c259, r219] PUSH1 0x40 (dec 64)
177 {0x51} [c261, r221] MLOAD
178 {0x80} [c262, r222] DUP1
179 {0x91} [c263, r223] SWAP2
180 {0x03} [c264, r224] SUB
181 {0x90} [c265, r225] SWAP1`);
  });
});
