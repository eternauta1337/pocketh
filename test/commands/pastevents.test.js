const cli = require('../../src/utils/cli.js');

describe('pastevents command', () => {
  test('Should retrieve some expected results for a know contract in mainnet', async () => {
    const result = await cli(
      'pastevents', 
      'mainnet',
      './test/artifacts/KittyCore.json', 
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      'Transfer',
      '7729780',
      '7729781',
      '10'
    );
    expect(result.stdout).toContain(`0x451e3b1baa371c9add7ce87e6a4da12add346b52a3b31d468790557a72512553`);
  });
});
