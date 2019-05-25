const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');

describe('block command', () => {

  let web3;
  let network;
  let lastTx;

  beforeEach(async () => {

    // Set up web3.
    network = 'http://localhost:8545';
    web3 = await getWeb3(network);

    // Send a dummy transaction so that there is at least 1 block.
    const accounts = await web3.eth.getAccounts();
    lastTx = await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[1],
      value: 1,
      gas: 100000,
      gasPrice: 1
    });
  });

  test('Should properly query a known block in localhost', async () => {

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
    expect(block.transactions[0]).toBe(lastTx.transactionHash);

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

  test('Should complain when the block identifier is invalid', async () => {
  
    // Trigger command with an invalid block id.
    const blockId = `spongy`;
    const result = await cli(
      'block', 
      network,
      blockId
    );
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`Invalid blockHashOrNumber: ${blockId}`);
  });
});
