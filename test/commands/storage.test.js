const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');
const fs = require('fs');

describe('storage command', () => {

  test('Should complain when an invalid contract address is provided', async () => {
    const result = await cli('storage', 'localhost', '0x123');
    expect(result.code).toBe(1);
  });

  test('Should properly retrieve storage elements from a contract deployed in localhost', async () => {

    // Set up web3.
    const web3 = await getWeb3('localhost');

    // Retrieve contract artifacts.
    const artifacts = JSON.parse(fs.readFileSync('test/artifacts/Storage.json', 'utf8'));

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
    const address = instance.options.address;
    // console.log(instance);
    console.log('Deployed contract address:', address);
    expect(address.length).toBe(42);

    // Trigger the contract's testFunction to set storage of some variables.
    const tx = await instance.methods.testStorage().send(params);
    // console.log(tx);
    expect(tx.transactionHash.length).toBe(66);
    expect(tx.gasUsed).toBeGreaterThan(400000);

    // Verify a public storage value set by testStorage();
    const secret = await instance.methods.secret().call();
    expect(secret).toBe('42');

    // Read and verify storage elements.
    let result;
    result = await cli('storage', 'localhost', address, '0');
    expect(result.stdout).toContain(`0x000000000000000000000000000000000000000000000000000000000000000f`);
    result = await cli('storage', 'localhost', address, '1', '--range', '16,32');
    expect(result.stdout).toContain(`0x0000000000000000000000000000429f`);
    result = await cli('storage', 'localhost', address, '2');
    expect(result.stdout).toContain(`test1`);
    result = await cli('storage', 'localhost', address, '3');
    expect(result.stdout).toContain(`test1236`);
    result = await cli('storage', 'localhost', address, '4');
    expect(result.stdout).toContain(`lets string something`);
    result = await cli('storage', 'localhost', address, '5');
    expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000000`);
    result = await cli('storage', 'localhost', address, '5', '--mapping', '0xbCcc714d56bc0da0fd33d96d2a87b680dD6D0DF6');
    expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000058`);
    result = await cli('storage', 'localhost', address, '7');
    expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000002`);
    result = await cli('storage', 'localhost', address, '7', '--array', '0');
    expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000001f40`);
    result = await cli('storage', 'localhost', address, '7', '--array', '1');
    expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000002328`);
  });
});
