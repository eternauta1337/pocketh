const cli = require('../../src/utils/cli.js');

describe('convert command', () => {

  test('Should properly convert between different denominations', async () => {
    expect((await cli(
      'convert', '1', 'wei', 'ether'
    )).stdout).toContain('0.000000000000000001');
    expect((await cli(
      'convert', '0.00000000000001', 'finney', 'wei'
    )).stdout).toContain('10');
    expect((await cli(
      'convert', '1', 'ether', 'szabo'
    )).stdout).toContain('1000000');
    expect((await cli(
      'convert', '0.5', 'tether', 'ether'
    )).stdout).toContain('500000000000');
  });

  test('Should list all denominations if no value is given', async () => {
    expect((await cli(
      'convert',
    )).stdout).toContain('nano: \'1000000000\'');
  });

  test('Should default to wei to ether if no denominations are given', async () => {
    expect((await cli(
      'convert', '1'
    )).stdout).toContain('0.000000000000000001');
  });

  test('Should complain on unknown denominations', async () => {
    expect((await cli(
      'convert', '1', 'wei', 'spongy'
    )).code).toBe(1);
  });
});
