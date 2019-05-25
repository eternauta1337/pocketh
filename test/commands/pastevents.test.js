const cli = require('../utils/cli.js');
jest.setTimeout(60000);

describe('pastevents command', () => {
  test('Should output help', async () => expect((await cli('pastevents', '--help')).code).toBe(0));
  test.skip('Should retrieve some expected results for a know contract in mainnet', async () => {
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
    expect(result.stdout).toContain(`{
  "address": "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
  "blockHash": "0x413bbd2803a7848ecbb74cf3f3b70406713474f75ed9bbeb6c8c71fa9a82d4cb",
  "blockNumber": 7729780,
  "logIndex": 69,
  "removed": false,
  "transactionHash": "0x1ab519cb7700340078bfca8310ec62076d077ec0a92caf5ed79c6f48ebe3b1ea",
  "transactionIndex": 74,
  "id": "log_0x2c7bc952cf67c19df9ba5b9c46f2d333cf4bd75f9f5ffc01abdc80e0a43d71ed",
  "returnValues": {
    "0": "0x442DCCEe68425828C106A3662014B4F131e3BD9b",
    "1": "0x748044889b60230f7b27039893b6805A8686B286",
    "2": {
      "_hex": "0x0ca6c0"
    },
    "from": "0x442DCCEe68425828C106A3662014B4F131e3BD9b",
    "to": "0x748044889b60230f7b27039893b6805A8686B286",
    "tokenId": {
      "_hex": "0x0ca6c0"
    }
  },
  "event": "Transfer",
  "signature": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "raw": {
    "data": "0x000000000000000000000000442dccee68425828c106a3662014b4f131e3bd9b000000000000000000000000748044889b60230f7b27039893b6805a8686b28600000000000000000000000000000000000000000000000000000000000ca6c0",
    "topics": [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    ]
  }
}`);
  });
});
