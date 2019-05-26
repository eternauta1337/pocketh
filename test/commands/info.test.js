const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');

describe('info command', () => {

  test('Should read the latest block from localhost', async () => {

    // Set up web3.
    const network = 'http://localhost:8545';
    const web3 = await getWeb3(network);

    // Send a dummy transaction so that there is at least 1 block.
    const accounts = await web3.eth.getAccounts();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[1],
      value: 1,
      gas: 100000,
      gasPrice: 1
    });
    
    // Get latest block.
    const latestBlockNumber = await web3.eth.getBlockNumber();

    // Trigger info command.
    const result = await cli(
      'info', 
      network
    );

    expect(result.stdout).toContain(`latestBlock: ${latestBlockNumber}`);
  });
});
