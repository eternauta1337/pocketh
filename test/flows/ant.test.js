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
    // TODO: Verify that reading the file works
    const expectedStdout = fs.readFileSync('test/output/ant.members.output', 'utf8');
    expect(result.stdout).toBe(expectedStdout);
    // expect(result.stdout).toContain(`function max256(uint256 a, uint256 b) internal view returns(uint256) {...}`);
    // expect(result.stdout).toContain(`function min256(uint256 a, uint256 b) internal view returns(uint256) {...}`);
    // expect(result.stdout).toContain(`function assert(bool assertion) internal {...}`);
    // expect(result.stdout).toContain(`¬ MiniMeToken`);
    // expect(result.stdout).toContain(`string public name;`);
    // expect(result.stdout).toContain(`uint8 public decimals;`);
    // expect(result.stdout).toContain(`string public symbol;`);
    // expect(result.stdout).toContain(`string public version;`);
    // expect(result.stdout).toContain(`struct public Checkpoint {`);
    // expect(result.stdout).toContain(`uint128 fromBlock;`);
    // expect(result.stdout).toContain(`uint128 value;`);
    // expect(result.stdout).toContain(`MiniMeToken public parentToken;`);
    // expect(result.stdout).toContain(`uint256 public parentSnapShotBlock;`);
    // expect(result.stdout).toContain(`uint256 public creationBlock;`);
    // expect(result.stdout).toContain(`mapping(address => struct MiniMeToken.Checkpoint[]) balances;`);
    // expect(result.stdout).toContain(`mapping(address => mapping(address => uint256)) allowed;`);
    
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
