const cli = require('../../src/utils/cli.js');

describe('selector command', () => {

  test('Should produce an expected selector for a simple signature', async () => {
    const result = await cli('selector', `'value()'`);
    expect(result.stdout).toContain(`0x3fa4f245`);
  });

  test('Should produce an expected selector for a more elaborate signature', async () => {
    const result = await cli('selector', `'createSiringAuction(uint256,uint256,uint256,uint256)'`);
    expect(result.stdout).toContain(`0x4ad8c938`);
  });

  test('Should complain if the signature contains "returns"', async () => {
    const result = await cli('selector', `'value() returns(bool)'`);
    expect(result.code).toBe(1);
  });
});
