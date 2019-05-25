const cli = require('../../src/utils/cli.js');

describe('docyul command', () => {

  test('Should produce expected output for certain keywords', async () => {
    expect((await cli(
      'docyul', 'delegatecall'
    )).stdout).toContain(`delegatecall(g:u256, a:u256, in:u256, insize:u256, out:u256, outsize:u256) ‑> r:u256`);
    expect((await cli(
      'docyul', 'sstore'
    )).stdout).toContain(`sstore(p:u256, v:u256)`);
  });

  test('Should list all documentation if no keyword is given', async () => {
    const output = (await cli( 'docyul')).stdout;
    expect(output).toContain(`not(x:bool) ‑> z:bool`);
    expect(output).toContain(`gtu256(x:u256, y:u256) ‑> z:bool`);
    expect(output).toContain(`mstore8(p:u256, v:u256)`);
    expect(output).toContain(`selfdestruct(a:u256)`);
    expect(output).toContain(`gasleft() ‑> gas:u256`);
  });

  test('Should display a "no documentation found message" if an invalid keyword is given', async () => {
    expect((await cli(
      'docyul', 'spongi'
    )).stdout).toContain(`No Yul documentation found for 'spongi'`);
  });
});
