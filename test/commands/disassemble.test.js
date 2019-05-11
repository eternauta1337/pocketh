const cli = require('../utils/cli.js');

describe('disassemble command', () => {
  
  test('Result code should be 0', async () => {
    const result = await cli('disassemble', './test/artifacts/Test.json');
    expect(result.code).toBe(0);
  });

  test('Result stdout should contain some of the expected output', async () => {
    const result = await cli('disassemble', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`171 {0x60} [c254, r214] PUSH1 0x20 (dec 32)
172 {0x01} [c256, r216] ADD
173 {0x91} [c257, r217] SWAP2
174 {0x50} [c258, r218] POP
175 {0x50} [c259, r219] POP
176 {0x60} [c260, r220] PUSH1 0x40 (dec 64)
177 {0x51} [c262, r222] MLOAD
178 {0x80} [c263, r223] DUP1
179 {0x91} [c264, r224] SWAP2
180 {0x03} [c265, r225] SUB`);
  });
});
