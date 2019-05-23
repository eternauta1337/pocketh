const cli = require('../../src/utils/cli.js');

describe('docyul command', () => {
  test('Should produce appropriate opcode output', async () => {
    const result = await cli('docyul', 'delegatecall');
    expect(result.stdout).toContain(`delegatecall(g:u256, a:u256, in:u256, insize:u256, out:u256, outsize:u256) ‑> r:u256`);
  });
});
