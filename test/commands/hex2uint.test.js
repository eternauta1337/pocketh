const cli = require('../../src/utils/cli.js');

describe('hex2uint command', () => {

  test('Should properly convert a small hex to a positive integer', async () => {
    const result = await cli('hex2uint', '0x2a');
    expect(result.stdout).toContain('42');
  });

  test('Should properly convert a large hex to a positive integer', async () => {
    const result = await cli('hex2uint', '0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b');
    expect(result.stdout).toContain('1381342429069413442493521589863962471307977493563');
  });

  test('Should complain if an invalid hex number is provided', async () => {
    expect((await cli('hex2uint', 'spongy')).code).toBe(1);
    expect((await cli('hex2uint', '0.1')).code).toBe(1);
    expect((await cli('hex2uint', '0xqqq')).code).toBe(1);
  });
});
