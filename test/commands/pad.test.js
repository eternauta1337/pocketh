const cli = require('../../src/utils/cli.js');

describe('pad command', () => {

  test('Sould properly pad a small hex', async () => {
    const result = await cli('pad', '0x2a');
    expect(result.stdout).toContain('0x000000000000000000000000000000000000000000000000000000000000002a');
  });

  test('Sould properly pad a large hex', async () => {
    const result = await cli('pad', '0x66666666666666666666666666666666666666666666666666666666666662a');
    expect(result.stdout).toContain('0x066666666666666666666666666666666666666666666666666666666666662a');
  });

  test('Sould not pad a hex that fills a word', async () => {
    const result = await cli('pad', '0x666666666666666666666666666666666666666666666666666666666666662a');
    expect(result.stdout).toContain('0x666666666666666666666666666666666666666666666666666666666666662a');
  });

  test('Should complain if an invalid hex number is provided', async () => {
    expect((await cli('hex2uint', 'spongy')).code).toBe(1);
    expect((await cli('hex2uint', '0.1')).code).toBe(1);
    expect((await cli('hex2uint', '0xqqq')).code).toBe(1);
  });
});
