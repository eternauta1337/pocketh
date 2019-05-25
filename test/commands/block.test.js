const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');

jest.setTimeout(60000);

describe('block command', () => {

  test('Should output help', async () => expect((await cli('block', '--help')).code).toBe(0));

  test('Should properly query a known block in localhost', async () => {

    // Set up web3.
    const network = 'http://localhost:8545';
    const web3 = await getWeb3(network);

    // Send a dummy transaction so that there is at least 1 block.
    const accounts = await web3.eth.getAccounts();
    const tx = await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[1],
      value: 1,
      gas: 100000,
      gasPrice: 1
    });

    // Get latest block.
    const latestBlockNumber = await web3.eth.getBlockNumber();

    // Trigger command by block number.
    let result = await cli(
      'block', 
      network,
      latestBlockNumber
    );
    const block = JSON.parse(result.stdout);

    // Verify results.
    expect(block.number).toBe(latestBlockNumber);
    expect(block.transactions.length).toBe(1);
    expect(block.transactions[0]).toBe(tx.transactionHash);

    // Trigger command by block hash.
    result = await cli(
      'block', 
      network,
      block.hash
    );
    const blockA = JSON.parse(result.stdout);

    // Verify results.
    expect(blockA.hash).toBe(block.hash);
  });
});
