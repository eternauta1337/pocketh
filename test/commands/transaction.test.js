const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');

describe('transaction command', () => {

  test('Should complain when an invalid tx hash is provided', async () => {
    const result = await cli(
      'transaction', 
      'localhost',
      '0x95ecb5317de43d2c682e93'
    );
    expect(result.code).toBe(1);
  });

  test('Should retrieve a known transaction from localhost', async () => {
    
    // Set up web3.
    const web3 = await getWeb3('localhost');

    // Send a dummy transaction so that there is at least 1 block.
    const accounts = await web3.eth.getAccounts();
    const txReceipt = await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[1],
      value: 1,
      gas: 100000,
      gasPrice: 1
    });

    // Trigger command by block number.
    const result = await cli(
      'transaction', 
      'localhost',
      txReceipt.transactionHash
    );
    const tx = JSON.parse(result.stdout);

    // Verify results.
    expect(txReceipt.transactionHash).toBe(tx.hash);
    expect(txReceipt.blockHash).toBe(tx.blockHash);
    expect(txReceipt.from).toBe(tx.from.toLowerCase());
    expect(txReceipt.to).toBe(tx.to.toLowerCase());
  });
});
