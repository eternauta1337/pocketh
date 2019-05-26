const cli = require('../../src/utils/cli.js');
const getWeb3 = require('../../src/utils/getWeb3.js');
const fs = require('fs');

describe('storage command', () => {

  test('Should complain when an invalid contract address is provided', async () => {
    const result = await cli('storage', 'localhost', '0x123');
    expect(result.code).toBe(1);
  });

  describe('When reading storage', () => {

    let address;

    beforeAll(async () => {
    
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
      address = instance.options.address;
      // console.log('Deployed contract address:', address);

      // Trigger the contract's testFunction to set storage of some variables.
      const tx = await instance.methods.testStorage().send(params);
      expect(tx.transactionHash.length).toBe(66);
      expect(tx.gasUsed).toBeGreaterThan(400000);

      // Verify a public storage value set by testStorage();
      const secret = await instance.methods.secret().call();
      expect(secret).toBe('42');
    });

    test('Can read uints that occupy an entire slot', async () => {
      const result = await cli('storage', 'localhost', address, '0');
      expect(result.stdout).toContain(`0x000000000000000000000000000000000000000000000000000000000000000f`);
    });

    test('Can read uints that partially occupy a slot', async () => {
      const result = await cli('storage', 'localhost', address, '1', '--range', '16,32');
      expect(result.stdout).toContain(`0x0000000000000000000000000000429f`);
    });

    test('Can read strings', async () => {
      let result;
      result = await cli('storage', 'localhost', address, '2');
      expect(result.stdout).toContain(`test1`);
      result = await cli('storage', 'localhost', address, '3');
      expect(result.stdout).toContain(`test1236`);
      result = await cli('storage', 'localhost', address, '4');
      expect(result.stdout).toContain(`lets string something`);
    });

    test('Can read mappings that store uints', async () => {
      let result;
      result = await cli('storage', 'localhost', address, '5');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000000`);
      result = await cli('storage', 'localhost', address, '5', '--key', '0xbCcc714d56bc0da0fd33d96d2a87b680dD6D0DF6');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000058`);
      result = await cli('storage', 'localhost', address, '5', '--key', '0xaee905FdD3ED851e48d22059575b9F4245A82B04');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000063`);
    });

    test('Can read mappings that store structs', async () => {
      let result;
      result = await cli('storage', 'localhost', address, '6');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000000`);
      result = await cli('storage', 'localhost', address, '6', '--key', '0xaee905FdD3ED851e48d22059575b9F4245A82B04', '--offset', '0');
      expect(result.stdout).toContain(`deviceBrand2`);
      result = await cli('storage', 'localhost', address, '6', '--key', '0xaee905FdD3ED851e48d22059575b9F4245A82B04', '--offset', '1');
      expect(result.stdout).toContain(`deviceYear2`);
      result = await cli('storage', 'localhost', address, '6', '--key', '0xaee905FdD3ED851e48d22059575b9F4245A82B04', '--offset', '2');
      expect(result.stdout).toContain(`wearLevel2`);
    });

    test('Can read arrays that store uints', async () => {
      let result = await cli('storage', 'localhost', address, '7');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000002`);
      result = await cli('storage', 'localhost', address, '7', '--offset', '0');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000001f40`);
      result = await cli('storage', 'localhost', address, '7', '--offset', '1');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000002328`);
    });

    test('Can read arrays that store structs', async () => {
      let result;
      result = await cli('storage', 'localhost', address, '8');
      expect(result.stdout).toContain(`0x0000000000000000000000000000000000000000000000000000000000000002`);
      result = await cli('storage', 'localhost', address, '8', '--offset', '3');
      expect(result.stdout).toContain(`deviceBrand2`);
      result = await cli('storage', 'localhost', address, '8', '--offset', '4');
      expect(result.stdout).toContain(`deviceYear2`);
      result = await cli('storage', 'localhost', address, '8', '--offset', '5');
      expect(result.stdout).toContain(`wearLevel2`);
    });
  });
});
