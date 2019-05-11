const cli = require('../utils/cli.js');

describe('calldata command', () => {
  
  test('Result code should be 0', async () => {
    let result = await cli('calldata', '0xabcabcab');
    expect(result.code).toBe(0);
  });

  test('Result stdout should identify selectors', async () => {
    let result = await cli('calldata', '0xffffffff');
    expect(result.stdout).toContain('Selector: 0xffffffff');
  });

  test('Result stdout should split parameters', async () => {
    const calldata = [
      '0xffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000002',
      '0000000000000000000000000000000000000000000000000000000000000003'
    ].join('');
    let result = await cli('calldata', calldata);
    expect(result.stdout).toContain(
      '0x0000: 0x0000000000000000000000000000000000000000000000000000000000000001'
    );
    expect(result.stdout).toContain(
      '0x0020: 0x0000000000000000000000000000000000000000000000000000000000000002'
    );
    expect(result.stdout).toContain(
      '0x0040: 0x0000000000000000000000000000000000000000000000000000000000000003'
    );
  });
});
