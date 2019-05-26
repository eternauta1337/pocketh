const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');

describe('info command', () => {

  test('Should read the latest block from mainnet', async () => {

    // Set up web3.
    const web3 = await getWeb3('mainnet');

    // Get latest block.
    const latestBlockNumber = await web3.eth.getBlockNumber();

    // Trigger info command.
    const result = await cli(
      'info', 
      'mainnet'
    );

    expect(result.stdout).toContain(`latestBlock: ${latestBlockNumber}`);
  });
});
