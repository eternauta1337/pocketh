const cli = require('../utils/cli.js');

describe('calldata command', () => {

  test('Should properly identify selectors', async () => {
    const result = await cli('calldata', '0xffffffff');
    expect(result.stdout).toContain('Selector: 0xffffffff');
  });

  test('Should properly split parameters', async () => {
    const calldata = [
      '0xffffffff',
      '0000000000000000000000000000000000000000000000000000000000000001',
      '0000000000000000000000000000000000000000000000000000000000000002',
      '0000000000000000000000000000000000000000000000000000000000000003'
    ].join('');
    const result = await cli('calldata', calldata);
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
