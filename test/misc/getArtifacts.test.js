const cli = require('../../src/utils/cli.js');
const Web3 = require('web3');
const fs = require('fs');

describe('compile command', () => {

  test('Should cache autocompilation output', async () => {
    
    // Used for utils only.
    const web3 = new Web3();

    // Make sure cacheed files are deleted.
    const source = fs.readFileSync('test/contracts/Test.sol', 'utf8');
    const dir = `/tmp/${web3.utils.sha3(source).substring(2, 14)}`;
    console.log(`Temporary directory: `, dir);
    fs.unlinkSync(dir);

    // Call inheritance on a .sol file.
    let result = await cli('inheritance', 'test/contracts/Test.sol');
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Auto compiling');
    
    // Call inheritance again on the same .sol file.
    result = await cli('inheritance', 'test/contracts/Test.sol');
    expect(result.code).toBe(0);
    expect(result.stdout.includes('Auto compiling')).toBe(false);
  });
});
