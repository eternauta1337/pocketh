const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');
const fs = require('fs');

describe('txs command', () => {

  let address;

  test('Should find a known number of transactions for a contract deployed in localhost', async () => {
    
    // Set up web3.
    const web3 = await getWeb3('localhost');

    // Retrieve contract artifacts.
    const artifacts = JSON.parse(fs.readFileSync('test/artifacts/EventEmitter.json', 'utf8'));

    // Set up params for upcoming txs.
    const accounts = await web3.eth.getAccounts();
    const params = {
      from: accounts[0],
      gas: 1000000,
      gasPrice: 1
    };

    // Deploy contract.
    const contract = new web3.eth.Contract(artifacts.abi);
    const instance = await contract.deploy({
      data: artifacts.bytecode
    }).send(params);
    address = instance.options.address;
    // console.log('Deployed contract address:', address);

    // Trigger the contract's emitEventWithValue to create some events.
    const blockBefore = await web3.eth.getBlockNumber();
    const txReceipt1 = await instance.methods.emitEventWithValue(42).send(params);
    const txReceipt2 = await instance.methods.emitEventWithValue(1982).send(params);
    await instance.methods.anotherMethod().send(params);
    await instance.methods.anotherMethod().send(params);
    await instance.methods.anotherMethod().send(params);
    const blockAfter = await web3.eth.getBlockNumber();

    // Trigger the command to search for events.
    const result = await cli(
      'txs', 
      'localhost',
      address,
      '0xc8d8936c',
      blockBefore,
      blockAfter
    );

    // Verifications.
    expect(result.stdout).toContain(`Found 2 transactions`);
    expect(result.stdout).toContain(txReceipt1.transactionHash);
    expect(result.stdout).toContain(txReceipt2.transactionHash);
  });

  test('Should find a known number of transactions from a known contract deployed in mainnet', async () => {
    const result = await cli(
      'txs', 
      'mainnet',
      '0x06012c8cf97bead5deae237070f9587f8e7a266d',
      '0xa9059cbb',
      '7729780',
      '7729790',
      '10'
    );
    expect(result.stdout).toContain(`Found 27 transactions`);
  });

  // test('Should complain when an invalid contract address is provided', async () => {
  //   const result = await cli('txs', 'localhost', '0x123', );
  //   expect(result.code).toBe(1);
  // });
});
