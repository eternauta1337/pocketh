const cli = require('../../src/utils/cli.js');
const tmp = require('tmp');
const fs = require('fs');

const REP_MAINNET = '0xe94327d07fc17907b4db788e5adf2ed424addff6';
const CONTRACT_NAME = 'RepToken';
const NUM_FILES = 10;

describe('REP flow', () => {
  test('Retrieves code from Etherscan, splits it, compiles it, and runs a series of commands on the code', async () => {
    
    // Set up a temp directory to hold the output.
    const tmpdir = tmp.dirSync();
    const filepath = `${tmpdir.name}/${CONTRACT_NAME}.sol`;
    console.log(`Test directory: ${tmpdir.name}`);

    // Retrieve the code.
    let result = await cli(
      'getcode', 
      REP_MAINNET,
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
    expect(fs.existsSync(`${tmpdir.name}/ERC20.sol`));
    expect(fs.existsSync(`${tmpdir.name}/RepToken.sol`));
    expect(fs.existsSync(`${tmpdir.name}/SafeMath.sol`));

    // Files should have expected content.
    expect(fs.readFileSync(`${tmpdir.name}/RepToken.sol`, 'utf8')).toContain('contract RepToken is Initializable, PausableToken {');

    // Files should compile.
    result = await cli('compile', `${tmpdir.name}/${CONTRACT_NAME}.sol`, `${tmpdir.name}/`);
    expect(result.code).toBe(0);

    // Compilation output should exist and have content.
    expect(fs.existsSync(`${tmpdir.name}/${CONTRACT_NAME}.json`));
    expect(fs.readFileSync(`${tmpdir.name}/${CONTRACT_NAME}.json`, 'utf8').length).toBeGreaterThan(0);

    // Should have the right inheritance tree.
    result = await cli('inheritance', `${tmpdir.name}/${CONTRACT_NAME}.json`);
    expect(result.stdout).toContain(`─ RepToken
   ├─ Initializable
   └─ PausableToken
      ├─ StandardToken
      │  ├─ ERC20
      │  │  └─ ERC20Basic
      │  └─ BasicToken
      │     └─ ERC20Basic
      └─ Pausable
         └─ Ownable`);

    // Should have the right members.
    result = await cli('members', `${tmpdir.name}/${CONTRACT_NAME}.json`, '--inherited', '--disable-colors');
    expect(result.stdout).toContain(`function allowance(address owner, address spender) public view returns(uint256);`);
    expect(result.stdout).toContain(`function allowance(address _owner, address _spender) public view returns(uint256 remaining) {...}`);
    expect(result.stdout).toContain(`function Ownable() public {...}`);
    expect(result.stdout).toContain(`modifier whenNotPaused() {...}`);
    expect(result.stdout).toContain(`function transferFrom(address _from, address _to, uint _value) public returns(bool) {...}`);
    expect(result.stdout).toContain(`function RepToken(address _legacyRepContract, uint256 _amountUsedToFreeze, address _accountToSendFrozenRepTo) public {...}`);
    expect(result.stdout).toContain(`ERC20Basic public legacyRepContract;`);
    expect(result.stdout).toContain(`function endInitialization() internal returns(bool) {...}`);
    
    // Should read the right storage.
    result = await cli('liststorage', 'mainnet', `${tmpdir.name}/${CONTRACT_NAME}.json`, REP_MAINNET, '--disable-colors');
    expect(result.stdout).toContain(`11000000000000000000000000`);
    expect(result.stdout).toContain(`0x48c80f1f4d53d5951e5d5438b54cba84f29f32a5`);
  });
});
