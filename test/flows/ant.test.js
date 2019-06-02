const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

const ANT_MAINNET = ' 0x960b236A07cf122663c4303350609A66A7B288C0';
const CONTRACT_NAME = 'ANT';
const NUM_FILES = 12;

describe('ANT flow', () => {
  test('Retrieves code from Etherscan, splits it, compiles it, and runs a series of commands on the code', async () => {
    
    // Set up a temp directory to hold the output.
    const tmpdir = tmp.dirSync();
    const filepath = `${tmpdir.name}/${CONTRACT_NAME}.sol`;
    console.log(`Test directory: ${tmpdir.name}`);

    // Retrieve the code.
    let result = await cli(
      'getcode', 
      ANT_MAINNET,
      filepath
    );
    expect(result.stdout).toContain(`Source code written to ${filepath}`);

    // Split the contract.
    result = await cli('split', filepath, tmpdir.name);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(`New files written to ${tmpdir.name}`);

    // Number of files should match.
    expect(result.stdout).toContain(`into ${NUM_FILES} files`);

    // Expected files should exist.
    expect(fs.existsSync(`${tmpdir.name}/AbstractSale.sol`));
    expect(fs.existsSync(`${tmpdir.name}/MiniMeToken.sol`));
    expect(fs.existsSync(`${tmpdir.name}/ANT.sol`));

    // Files should have expected content.
    expect(fs.readFileSync(`${tmpdir.name}/SaleWallet.sol`, 'utf8')).toContain('address public multisig');

    // Files should compile.
    result = await cli('compile', `${tmpdir.name}/${CONTRACT_NAME}.sol`, `${tmpdir.name}/`);
    expect(result.code).toBe(0);

    // Compilation output should exist and have content.
    expect(fs.existsSync(`${tmpdir.name}/${CONTRACT_NAME}.json`));
    expect(fs.readFileSync(`${tmpdir.name}/${CONTRACT_NAME}.json`, 'utf8').length).toBeGreaterThan(0);

    // Should have the right inheritance tree.
    result = await cli('inheritance', `${tmpdir.name}/${CONTRACT_NAME}.json`);
    expect(result.stdout).toContain(`└─ ANT
   └─ MiniMeIrrevocableVestedToken
      ├─ MiniMeToken
      │  ├─ ERC20
      │  └─ Controlled
      └─ SafeMath`);

    // Should have the right members.
    result = await cli('members', `${tmpdir.name}/${CONTRACT_NAME}.json`, '--inherited', '--disable-colors');
    let expectedStdout = fs.readFileSync('test/output/ant.members.output', 'utf8');
    expect(result.stdout).toBe(expectedStdout);
    
    // Should read the right storage.
    result = await cli('liststorage', 'mainnet', `${tmpdir.name}/${CONTRACT_NAME}.json`, ANT_MAINNET, '--disable-colors');
    expect(result.stdout).toContain(`0xd39902f046b5885d70e9e66594b65f84d4d1c952`);
    expect(result.stdout).toContain(`Aragon Network Token`);
    expect(result.stdout).toContain(`18`);
    expect(result.stdout).toContain(`ANT`);
    expect(result.stdout).toContain(`MMT_0.1`);
    expect(result.stdout).toContain(`3711733`);
    expect(result.stdout).toContain(`0x175b5d76b0eaa2c66bee02c393f96d6cc05e7ff9`);
    expect(result.stdout).toContain(`0xcafe1a77e84698c83ca8931f54a755176ef75f2c`);
  });
});
