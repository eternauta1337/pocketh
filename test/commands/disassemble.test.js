const cli = require('../utils/cli.js');

describe('disassemble command', () => {
  test('Should produce appropriate opcode output', async () => {
    const result = await cli('disassemble', './test/artifacts/Test.json');
    expect(result.stdout).toContain(`268 {0xa1} [c378, r338] LOG1
269 {0x65} [c379, r339] PUSH6 0x627a7a723058 (dec 108278179835992)
270 {0x20} [c386, r346] SHA3
271 {0x31} [c387, r347] BALANCE
272 {0x1b} [c388, r348] INVALID (1b)
273 {0xb8} [c389, r349] INVALID (b8)
274 {0x54} [c390, r350] SLOAD
275 {0x78} [c391, r351] PUSH25 0x32dff27412700674e40b06043fe48c222f82044645efb3709d (dec 3.193462532818983e+59)
276 {0xb2} [c417, r377] INVALID (b2)
277 {0x86} [c418, r378] DUP7
278 {0x00} [c419, r379] STOP
279 {0x2} [c420, r380] INVALID (2)`);
  });
});
