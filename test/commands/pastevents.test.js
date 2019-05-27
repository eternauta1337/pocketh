const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');
const fs = require('fs');

describe('pastevents command', () => {

  let address;

  test('Should retrieve expected events for a contract deployed in localhost', async () => {
    
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
    const blockAfter = await web3.eth.getBlockNumber();

    // Trigger the command to search for events.
    const result = await cli(
      'pastevents', 
      'localhost',
      'test/artifacts/EventEmitter.json', 
      address,
      'Log',
      blockBefore,
      blockAfter
    );

    // Verifications.
    expect(result.stdout).toContain(`Total "Log" events found: 2`);
    expect(result.stdout).toContain(txReceipt1.transactionHash);
    expect(result.stdout).toContain(txReceipt2.transactionHash);
    expect(result.stdout).toContain('42');
    expect(result.stdout).toContain('1982');
  });

  test('Should complain when an invalid contract address is provided', async () => {
    const result = await cli('pastevents', 'localhost', 'test/artifacts/KittyAuction.json', '0x123', 'f', 'f', 'f');
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Invalid contract address');
  });
});
